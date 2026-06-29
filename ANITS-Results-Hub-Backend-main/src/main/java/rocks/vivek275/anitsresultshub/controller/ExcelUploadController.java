package rocks.vivek275.anitsresultshub.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import rocks.vivek275.anitsresultshub.service.DynamicExcelUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class ExcelUploadController {
    private final DynamicExcelUploadService uploadService;
    @PostMapping("/upload")
    public ResponseEntity<String> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batch") String batch,
            @RequestParam("semester") String semester,
            @RequestParam("branch") String branch) throws Exception {

        String tableName = batch.toLowerCase() + "_" +
                semester.replace("-", "_").toLowerCase() + "_" +
                branch.toLowerCase();

        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        Row row1 = sheet.getRow(1); // Full subject names row
        Row row2 = sheet.getRow(2); // SGPA/CGPA/Grad row

        if (row1 == null || row2 == null) {
            return ResponseEntity.badRequest().body("Excel file must have at least 3 rows for headers.");
        }

        List<String> columns = new ArrayList<>();
        Set<String> usedNames = new HashSet<>();
        int lastCell = row2.getLastCellNum();

        for (int i = 0; i < lastCell; i++) {
            String fullName = row1.getCell(i) != null ? row1.getCell(i).toString().trim() : "";
            String bottomLabel = row2.getCell(i) != null ? row2.getCell(i).toString().trim() : "";

            // ✅ Determine base name
            String finalName;
            if (!fullName.isEmpty() && !bottomLabel.isEmpty()) {
                finalName = fullName;
            } else if (!fullName.isEmpty()) {
                finalName = fullName;
            } else if (!bottomLabel.isEmpty()) {
                finalName = bottomLabel;
            } else {
                finalName = "col_" + i; // ✅ fallback for empty column
            }

            finalName = finalName
                    .toLowerCase()
                    .replaceAll("[^a-z0-9]", "")  // spaces → _
                    .replaceAll("_+", "_")         // collapse multiple underscores
                    .replaceAll("^_|_$", "");      // trim underscores

            if (finalName.equals("sgpa") || finalName.equals("cgpa") || finalName.equals("section")) {
                finalName = finalName.toUpperCase();
            }
            String uniqueName = finalName;
            int suffix = 1;
            while (usedNames.contains(uniqueName)) {
                uniqueName = finalName + "_" + suffix++;
            }
            usedNames.add(uniqueName);

            columns.add(uniqueName);
        }

        log.info("📊 Preparing to create table: {}", tableName);
        log.info("📝 Final columns: {}", columns);
        uploadService.uploadExcel(file.getInputStream(), tableName, columns);
        return ResponseEntity.ok("✅ Results uploaded into table:" + tableName);
    }
}
