package rocks.vivek275.anitsresultshub.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rocks.vivek275.anitsresultshub.service.DynamicExcelUploadService;
import rocks.vivek275.anitsresultshub.service.StudentExcelUploadService;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class StudentExcelUploadController {

    private final StudentExcelUploadService excelUploadService;

    @PostMapping("/upload-student")
    public ResponseEntity<String> uploadExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batch") String batch,
            @RequestParam("branch") String branch) {

        try (InputStream inputStream = file.getInputStream()) {

            // ✅ Build table name dynamically
            String tableName = String.format("students_%s_%s",
                    batch.toLowerCase(),
                    branch.toLowerCase());

            // ✅ Extract headers from first row only
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            List<String> columns = new ArrayList<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                String header = getCellValueAsString(headerRow.getCell(i));
                String colName = (header == null || header.isBlank()) ? "column_" + i : header.trim();

                // normalize for SQL table column
                colName = colName.toLowerCase().replaceAll("[^a-z0-9_]", "_");
                columns.add(colName);
            }
            workbook.close();

            // ✅ Call service to handle DB operations
            excelUploadService.uploadExcel(file.getInputStream(), tableName, columns);

            return ResponseEntity.ok("✅ Data uploaded successfully into table: " + tableName);

        } catch (Exception e) {
            log.error("❌ Excel upload failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Failed to upload Excel: " + e.getMessage());
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case FORMULA -> cell.getCellFormula(); // keep as plain text
            default -> null;
        };
    }
}
