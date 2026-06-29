package rocks.vivek275.anitsresultshub.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.apache.poi.ss.usermodel.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class StudentPerformanceService {

    private final JdbcTemplate jdbcTemplate;

    public StudentPerformanceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void savePerformance(String batch,
                                String branch,
                                String semester,
                                MultipartFile file) throws Exception {

        // 🔐 FIX ZIP BOMB ISSUE (safe for admin uploads)
        ZipSecureFile.setMinInflateRatio(0.001);
        ZipSecureFile.setMaxEntrySize(200 * 1024 * 1024);
        ZipSecureFile.setMaxTextSize(200 * 1024 * 1024);

        String tableName = ("student_performance_" + batch + "_" + branch + "_" + semester)
                .toLowerCase()
                .replaceAll("[^a-z0-9_]", "");

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            // -----------------------------
            // 1️⃣ Read & normalize headers
            // -----------------------------
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("Header row missing in Excel file");
            }

            List<String> columns = new ArrayList<>();
            for (Cell cell : headerRow) {
                String col = cell.getStringCellValue()
                        .trim()
                        .toLowerCase()
                        .replaceAll("[^a-z0-9_]", "_");

                columns.add(col);
            }

            log.info("📊 Normalized columns: {}", columns);

            // -----------------------------
            // 2️⃣ CREATE TABLE
            // -----------------------------
            StringBuilder createSql = new StringBuilder("CREATE TABLE IF NOT EXISTS ")
                    .append(tableName)
                    .append(" (");

            for (int i = 0; i < columns.size(); i++) {
                createSql.append(columns.get(i)).append(" TEXT");
                if (i < columns.size() - 1) createSql.append(", ");
            }
            createSql.append(")");

            jdbcTemplate.execute(createSql.toString());

            // -----------------------------
            // 3️⃣ Prepare INSERT (batch)
            // -----------------------------
            String insertSql = "INSERT INTO " + tableName +
                    " (" + String.join(", ", columns) + ") VALUES (" +
                    String.join(", ", columns.stream().map(c -> "?").toList()) + ")";

            List<Object[]> batchArgs = new ArrayList<>();

            // -----------------------------
            // 4️⃣ Read data rows
            // -----------------------------
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Object[] values = new Object[columns.size()];
                for (int j = 0; j < columns.size(); j++) {
                    values[j] = getCellValue(row.getCell(j), evaluator);
                }
                batchArgs.add(values);
            }

            jdbcTemplate.batchUpdate(insertSql, batchArgs);

            log.info("✅ Inserted {} rows into {}", batchArgs.size(), tableName);
        }
    }

    // ------------------------------------
    // Safe cell value extraction
    // ------------------------------------
    private String getCellValue(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getDateCellValue().toString()
                    : String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> evaluator.evaluate(cell).formatAsString();
            default -> null;
        };
    }

    // -----------------------------
    // Fetch APIs (safe)
    // -----------------------------
    public List<Map<String, Object>> fetchPerformance(String batch,
                                                      String branch,
                                                      String semester) {
        String tableName = ("student_performance_" + batch + "_" + branch + "_" + semester)
                .toLowerCase()
                .replaceAll("[^a-z0-9_]", "");

        return jdbcTemplate.queryForList("SELECT * FROM " + tableName);
    }

    public List<Map<String, Object>> fetchSpecificStudentPerformance(String batch,
                                                                     String branch,
                                                                     String semester,
                                                                     String email) {

        String tableName = ("student_performance_" + batch + "_" + branch + "_" + semester)
                .toLowerCase()
                .replaceAll("[^a-z0-9_]", "");

        return jdbcTemplate.queryForList(
                "SELECT * FROM " + tableName + " WHERE email = ?",
                email
        );
    }
}
