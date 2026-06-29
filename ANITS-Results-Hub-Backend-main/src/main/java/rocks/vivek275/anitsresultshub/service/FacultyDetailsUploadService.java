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
public class FacultyDetailsUploadService {
    private final JdbcTemplate jdbcTemplate;

    public void uploadFacultyDetailsExcel(InputStream inputStream, String tableName, List<String> originalColumns) throws Exception {

        Workbook workbook = WorkbookFactory.create(inputStream);
        Sheet sheet = workbook.getSheetAt(0);

        List<String> columns = new ArrayList<>();
        List<Integer> columnIndexes = new ArrayList<>();

        for (int j = 0; j < originalColumns.size(); j++) {
            boolean hasData = false;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String value = getCellValueAsString(row.getCell(j));
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

        log.info("✅ Using filtered columns: {}", columns);

        StringBuilder createTableSql = new StringBuilder("CREATE TABLE IF NOT EXISTS ")
                .append(tableName)
                .append(" (");

        for (int i = 0; i < columns.size(); i++) {
            String col = columns.get(i);
            if (col.equalsIgnoreCase("email")) {
                createTableSql.append(col).append(" VARCHAR(50) PRIMARY KEY");
            } else {
                createTableSql.append(col).append(" VARCHAR(255) NULL");
            }
            if (i < columns.size() - 1) createTableSql.append(", ");
        }
        createTableSql.append(")");

        jdbcTemplate.execute(createTableSql.toString());
        log.info("📄 Table Created (if not exists): {}", tableName);

        StringBuilder insertSql = new StringBuilder("INSERT INTO ")
                .append(tableName)
                .append(" (")
                .append(String.join(", ", columns))
                .append(") VALUES (")
                .append(String.join(", ", columns.stream().map(c -> "?").toList()))
                .append(")");

        log.info("📄 Prepared INSERT SQL: {}", insertSql);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String rollNo = getCellValueAsString(row.getCell(0));
            if (rollNo == null || rollNo.isBlank()) continue;

            Object[] values = new Object[columns.size()];
            for (int k = 0; k < columnIndexes.size(); k++) {
                Cell cell = row.getCell(columnIndexes.get(k));
                values[k] = getCellValueAsString(cell);
            }

            jdbcTemplate.update(insertSql.toString(), values);
        }

        workbook.close();
        log.info("Data successfully inserted into {}", tableName);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getDateCellValue().toString()
                    : String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }
}
