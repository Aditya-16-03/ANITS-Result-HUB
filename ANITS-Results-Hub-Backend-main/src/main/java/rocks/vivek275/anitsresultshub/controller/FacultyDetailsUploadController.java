package rocks.vivek275.anitsresultshub.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rocks.vivek275.anitsresultshub.service.FacultyDetailsUploadService;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class FacultyDetailsUploadController {
    private final FacultyDetailsUploadService facultyDetailsUploadService;

    @PostMapping(value = "/upload-faculty-details")
    public ResponseEntity<String> uploadFacultyDetails(
            @RequestParam("file") MultipartFile file,
            @RequestParam("branch") String branch) {

        try (InputStream inputStream = file.getInputStream()) {
            String tableName = String.format("faculty_%s",
                    branch.toLowerCase());
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            List<String> columns = new ArrayList<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                String header = getCellValueAsString(headerRow.getCell(i));
                String colName = (header == null || header.isBlank()) ? "column_" + i : header.trim();
                colName = colName.toLowerCase().replaceAll("[^a-z0-9_]", "_");
                columns.add(colName);
            }
            workbook.close();

            facultyDetailsUploadService.uploadFacultyDetailsExcel(file.getInputStream(), tableName, columns);

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
