package rocks.vivek275.anitsresultshub.service;

import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import rocks.vivek275.anitsresultshub.repo.FacultyRepo;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class FacultyPerformanceService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    FacultyRepo facultyRepo;

    public void saveFacultyPerformance(String branch, String batch, String semester, MultipartFile file) throws Exception {

        // Create table name dynamically
        String tableName = String.format("faculty_%s_%s_%s",
                batch.toLowerCase(),
                semester.replace("-", "_").toLowerCase(),
                branch.toLowerCase());

        InputStream is = file.getInputStream();
        Workbook workbook = WorkbookFactory.create(is);
        Sheet sheet = workbook.getSheetAt(0);

        // Read headers dynamically and sanitize
        Row headerRow = sheet.getRow(0);
        List<String> columns = new ArrayList<>();
        for (Cell cell : headerRow) {
            columns.add(sanitizeColumnName(cell.getStringCellValue()));
        }

        // Create table dynamically if not exists
        StringBuilder createSql = new StringBuilder("CREATE TABLE IF NOT EXISTS " + tableName + " (");
        for (String col : columns) {
            createSql.append(col).append(" VARCHAR(255),");
        }
        createSql.setLength(createSql.length() - 1); // remove last comma
        createSql.append(")");
        jdbcTemplate.execute(createSql.toString());

        // Insert data row by row
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            StringBuilder insertSql = new StringBuilder("INSERT INTO " + tableName + " (");
            StringBuilder valuesPart = new StringBuilder(" VALUES (");

            for (int j = 0; j < columns.size(); j++) {
                Cell cell = row.getCell(j);
                String value = (cell == null) ? "" : getCellValueAsString(cell);

                insertSql.append(columns.get(j)).append(",");
                valuesPart.append("'").append(value.replace("'", "''")).append("',");
            }

            insertSql.setLength(insertSql.length() - 1); // remove last comma
            valuesPart.setLength(valuesPart.length() - 1); // remove last comma
            insertSql.append(")").append(valuesPart).append(")");
            jdbcTemplate.execute(insertSql.toString());
        }

        workbook.close();
    }

    // Convert cell value to string
    private String getCellValueAsString(Cell cell) {
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    // Sanitize column names to be valid PostgreSQL identifiers
    private String sanitizeColumnName(String header) {
        return header.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "_")  // replace invalid chars with underscore
                .replaceAll("_+", "_");        // collapse multiple underscores
    }

    public List<Map<String, Object>> getFacultyPerformance(String branch, String batch, String semester) {
        try {
            return facultyRepo.getFacultyPerformance(branch, batch, semester);
        }
        catch (Exception e) {
            return null;
        }
    }
}
