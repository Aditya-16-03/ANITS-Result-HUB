package rocks.vivek275.anitsresultshub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplyExcelUploadService {

    private final JdbcTemplate jdbcTemplate;

    public void uploadExcel(InputStream inputStream, String tableName, List<String> originalColumns) throws Exception {

        Workbook workbook = WorkbookFactory.create(inputStream);
        Sheet sheet = workbook.getSheetAt(0);
        DataFormatter formatter = new DataFormatter();
        FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

        // ✅ Step 1: Detect which columns have data
        List<String> columns = new ArrayList<>();
        List<Integer> columnIndexes = new ArrayList<>();

        for (int j = 0; j < originalColumns.size(); j++) {
            boolean hasData = false;
            // ✅ Data starts at row index 1 (2nd row)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String value = getCellValueAsString(row.getCell(j), formatter, evaluator);
                if (value != null && !value.isBlank()) {
                    hasData = true;
                    break;
                }
            }
            if (hasData) {
                columns.add(originalColumns.get(j));
                columnIndexes.add(j);
            }
        }

        log.info("✅ Using filtered columns for supply: {}", columns);

        // ✅ Step 2: Create Table SQL
        StringBuilder createTableSql = new StringBuilder("CREATE TABLE IF NOT EXISTS ")
                .append(tableName)
                .append(" (");

        for (int i = 0; i < columns.size(); i++) {
            String col = columns.get(i);
            if (col.equalsIgnoreCase("roll_no")) {
                createTableSql.append(col).append(" VARCHAR(50) PRIMARY KEY");
            } else {
                createTableSql.append(col).append(" TEXT NULL");
            }
            if (i < columns.size() - 1) createTableSql.append(", ");
        }
        createTableSql.append(")");

        log.info("📄 Executing CREATE TABLE for supply: {}", createTableSql);
        jdbcTemplate.execute(createTableSql.toString());

        // ✅ Step 3: Prepare INSERT SQL
        StringBuilder insertSql = new StringBuilder("INSERT INTO ")
                .append(tableName)
                .append(" (")
                .append(String.join(", ", columns))
                .append(") VALUES (")
                .append(String.join(", ", columns.stream().map(c -> "?").toList()))
                .append(")");

        log.info("📄 Prepared INSERT SQL for supply: {}", insertSql);

        // ✅ Step 4: Insert Data
        // ✅ Data starts at row index 1 (2nd row)
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String rollNo = getCellValueAsString(row.getCell(0), formatter, evaluator);
            if (rollNo == null || rollNo.isBlank()) {
                log.debug("⏭️ Skipping empty row at index {}", i);
                continue;
            }

            Object[] values = new Object[columns.size()];
            for (int k = 0; k < columnIndexes.size(); k++) {
                Cell cell = row.getCell(columnIndexes.get(k));
                values[k] = getCellValueAsString(cell, formatter, evaluator);
            }

            jdbcTemplate.update(insertSql.toString(), values);
        }

        workbook.close();
        log.info("✅ Supply data successfully inserted into {}", tableName);
    }

    private String getCellValueAsString(Cell cell, DataFormatter formatter, FormulaEvaluator evaluator) {
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> formatter.formatCellValue(cell);
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                String formula = cell.getCellFormula();
                if (formula.contains("[")) {
                    yield formula;
                }
                try {
                    yield formatter.formatCellValue(cell, evaluator);
                } catch (Exception e) {
                    log.warn("⚠️ Could not evaluate formula '{}', storing as text.", formula);
                    yield formula;
                }
            }
            default -> null;
        };
    }
}