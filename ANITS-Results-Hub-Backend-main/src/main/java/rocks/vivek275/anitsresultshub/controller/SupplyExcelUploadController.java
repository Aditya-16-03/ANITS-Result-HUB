package rocks.vivek275.anitsresultshub.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rocks.vivek275.anitsresultshub.service.SupplyExcelUploadService;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class SupplyExcelUploadController {

    private final SupplyExcelUploadService supplyUploadService;

    @PostMapping("/upload-supply")
    public ResponseEntity<String> uploadSupply(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batch") String batch,
            @RequestParam("semester") String semester,
            @RequestParam("branch") String branch) throws Exception {

        String tableName = "supply_" + batch.toLowerCase() + "_" +
                semester.replace("-", "_").toLowerCase() + "_" +
                branch.toLowerCase();

        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        // ✅ Supply only has 1 header row (index 0)
        Row headerRow = sheet.getRow(0);

        if (headerRow == null) {
            return ResponseEntity.badRequest().body("Excel file must have at least 1 header row.");
        }

        List<String> columns = new ArrayList<>();
        Set<String> usedNames = new HashSet<>();
        int lastCell = headerRow.getLastCellNum();

        for (int i = 0; i < lastCell; i++) {
            String columnName = headerRow.getCell(i) != null ? headerRow.getCell(i).toString().trim() : "";

            String finalName;
            if (!columnName.isEmpty()) {
                finalName = columnName;
            } else {
                finalName = "col_" + i; // fallback for empty column
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

        log.info("📊 Preparing to create supply table: {}", tableName);
        log.info("📝 Final columns: {}", columns);

        supplyUploadService.uploadExcel(file.getInputStream(), tableName, columns);

        return ResponseEntity.ok("✅ Supplementary Results uploaded into table: " + tableName);
    }
}