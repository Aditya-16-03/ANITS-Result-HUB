package rocks.aditya.anitsresultshub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import rocks.aditya.anitsresultshub.models.ResultsJsonRequest;
import rocks.aditya.anitsresultshub.util.BranchCodeMapper;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Stores results supplied as JSON (produced by n8n from a PDF) into the same dynamic
 * table layout the app already reads:  {batch}_{semester}_{branch}  e.g. a23_2_1_che
 *
 *  - batch    : first 3 chars of rollNo, lowercased           (A23126502001 -> a23)
 *  - semester : parsed from "II/IV B.Tech SEM-I"              -> 2-1
 *  - branch   : short code from the full branch name          (CHEMICAL ENGINEERING -> che)
 *
 * Each result table has rollno (PK) + sgpa + cgpa + one column per subject
 * (subject names sanitized to lowercase alphanumeric, matching the older Excel flow).
 * Re-uploading the same rollno updates the row (upsert).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JsonResultsUploadService {

    private final JdbcTemplate jdbcTemplate;

    private static final Pattern YEAR_PATTERN = Pattern.compile("^\\s*(IV|III|II|I)\\s*/");
    private static final Pattern SEM_PATTERN = Pattern.compile("SEM[^A-Z0-9]*(II|I)\\b");
    // Matches the regulation in examType, e.g. "Regular Examinations (R23)" -> 23
    private static final Pattern REGULATION_PATTERN = Pattern.compile("R\\s*(\\d{2,4})", Pattern.CASE_INSENSITIVE);

    public UploadSummary saveResults(ResultsJsonRequest request) {
        if (request == null || request.getSections() == null || request.getSections().isEmpty()) {
            throw new IllegalArgumentException("'sections' must contain at least one branch section.");
        }

        // Group all rows by target table (a branch/semester with different batches would split).
        Map<String, TableData> tables = new LinkedHashMap<>();

        for (int s = 0; s < request.getSections().size(); s++) {
            ResultsJsonRequest.Section section = request.getSections().get(s);
            if (section == null) continue;

            String semesterCode = parseSemesterCode(section.getSemester());
            if (semesterCode == null) {
                throw new IllegalArgumentException("Could not parse semester '" + section.getSemester()
                        + "' in section #" + (s + 1) + ". Expected something like 'II/IV B.Tech SEM-I'.");
            }
            String branchCode = BranchCodeMapper.toCode(section.getBranch());
            // Batch is taken from the regulation in examType (e.g. R23 -> a23).
            String regulationBatch = extractRegulationBatch(section.getExamType());

            List<ResultsJsonRequest.StudentResultEntry> students = section.getStudents();
            if (students == null || students.isEmpty()) continue;

            for (ResultsJsonRequest.StudentResultEntry st : students) {
                if (st == null || st.getRollNo() == null || st.getRollNo().isBlank()) {
                    log.warn("Skipping a student with no rollNo in section '{}'", section.getBranch());
                    continue;
                }
                String rollNo = st.getRollNo().trim();

                // Prefer the regulation-derived batch; fall back to the roll-number prefix.
                String batch;
                if (regulationBatch != null && !regulationBatch.isBlank()) {
                    batch = regulationBatch;
                } else if (rollNo.length() >= 3) {
                    batch = rollNo.substring(0, 3).toLowerCase();
                } else {
                    log.warn("Skipping rollNo '{}' - no regulation and roll too short to derive batch.", rollNo);
                    continue;
                }

                // table names use underscores for the semester (2-1 -> 2_1), matching the read side
                String tableName = batch + "_" + semesterCode.replace("-", "_") + "_" + branchCode;

                TableData td = tables.computeIfAbsent(tableName, k -> new TableData());

                // Build one row: rollno, sgpa, cgpa, then each subject.
                LinkedHashMap<String, Object> row = new LinkedHashMap<>();
                row.put("rollno", rollNo);
                row.put("sgpa", st.getSgpa() == null ? null : String.valueOf(st.getSgpa()));
                row.put("cgpa", st.getCgpa() == null ? null : String.valueOf(st.getCgpa()));

                if (st.getSubjects() != null) {
                    for (Map.Entry<String, String> subj : st.getSubjects().entrySet()) {
                        String col = sanitizeColumn(subj.getKey());
                        if (col.isEmpty()) continue;
                        // avoid clobbering the fixed columns
                        if (col.equals("rollno") || col.equals("sgpa") || col.equals("cgpa")) {
                            col = col + "_subject";
                        }
                        row.put(col, subj.getValue());
                    }
                }

                td.columns.addAll(row.keySet());
                td.rows.add(row);
            }
        }

        if (tables.isEmpty()) {
            throw new IllegalArgumentException("No valid student rows found in the payload.");
        }

        // Persist each table.
        List<TableResult> results = new ArrayList<>();
        int totalRows = 0;
        for (Map.Entry<String, TableData> e : tables.entrySet()) {
            int n = persistTable(e.getKey(), e.getValue());
            results.add(new TableResult(e.getKey(), n));
            totalRows += n;
        }

        log.info("âœ… JSON results stored: {} rows across {} tables {}", totalRows, results.size(), results);
        return new UploadSummary(totalRows, results);
    }

    private int persistTable(String tableName, TableData data) {
        // rollno first, keep the rest in insertion order
        LinkedHashSet<String> ordered = new LinkedHashSet<>();
        ordered.add("rollno");
        ordered.addAll(data.columns);
        List<String> cols = new ArrayList<>(ordered);

        // 1) table + columns
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + tableName + " (rollno VARCHAR(50) PRIMARY KEY)");
        for (String col : cols) {
            if (col.equals("rollno")) continue;
            jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD COLUMN IF NOT EXISTS " + col + " TEXT");
        }

        // 2) upsert statement
        String colCsv = String.join(", ", cols);
        String placeholders = String.join(", ", cols.stream().map(c -> "?").toList());
        StringBuilder updateSet = new StringBuilder();
        for (String col : cols) {
            if (col.equals("rollno")) continue;
            if (updateSet.length() > 0) updateSet.append(", ");
            updateSet.append(col).append(" = EXCLUDED.").append(col);
        }
        String sql = "INSERT INTO " + tableName + " (" + colCsv + ") VALUES (" + placeholders + ")"
                + " ON CONFLICT (rollno) DO UPDATE SET " + updateSet;

        // 3) batch args
        List<Object[]> batchArgs = new ArrayList<>();
        for (LinkedHashMap<String, Object> row : data.rows) {
            Object[] values = new Object[cols.size()];
            for (int i = 0; i < cols.size(); i++) {
                values[i] = row.get(cols.get(i));
            }
            batchArgs.add(values);
        }
        jdbcTemplate.batchUpdate(sql, batchArgs);
        return batchArgs.size();
    }

    /**
     * "II/IV B.Tech SEM-I" -> "2-1", "I/IV B.Tech SEM-II" -> "1-2", etc.
     */
    public String parseSemesterCode(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String up = raw.trim().toUpperCase();

        Matcher ym = YEAR_PATTERN.matcher(up);
        Matcher sm = SEM_PATTERN.matcher(up);
        if (!ym.find() || !sm.find()) return null;

        int year = romanToInt(ym.group(1));
        int sem = romanToInt(sm.group(1));
        if (year < 1 || year > 4 || sem < 1 || sem > 2) return null;

        return year + "-" + sem;
    }

    /**
     * Extracts the regulation year from examType and returns it as a batch code.
     * "Regular Examinations (R23)" -> "a23"   (matches the existing a&lt;YY&gt; table convention)
     * Returns null if no regulation is present.
     */
    public String extractRegulationBatch(String examType) {
        if (examType == null || examType.isBlank()) return null;
        Matcher m = REGULATION_PATTERN.matcher(examType);
        if (m.find()) {
            return "a" + m.group(1);
        }
        return null;
    }

    private int romanToInt(String r) {
        return switch (r) {
            case "I" -> 1;
            case "II" -> 2;
            case "III" -> 3;
            case "IV" -> 4;
            default -> -1;
        };
    }

    /** Sanitize a subject/column name to lowercase alphanumeric (matches the old Excel flow). */
    private String sanitizeColumn(String raw) {
        if (raw == null) return "";
        return raw.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    // ----- small holders -----

    private static class TableData {
        final LinkedHashSet<String> columns = new LinkedHashSet<>();
        final List<LinkedHashMap<String, Object>> rows = new ArrayList<>();
    }

    public record TableResult(String tableName, int rowCount) {
    }

    public record UploadSummary(int totalRows, List<TableResult> tables) {
    }
}
