package rocks.vivek275.anitsresultshub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rocks.vivek275.anitsresultshub.service.FacultyPerformanceService;

@RestController
@RequestMapping("/api/admin/upload")
@CrossOrigin
public class FacultyPerformanceUploadController {

    @Autowired
    private FacultyPerformanceService facultyPerformanceService;

    @PostMapping("/faculty-performance")
    public ResponseEntity<String> uploadFacultyPerformance(
            @RequestParam String branch,
            @RequestParam String batch,
            @RequestParam String semester,
            @RequestParam("file") MultipartFile file) {

        try {
            facultyPerformanceService.saveFacultyPerformance(branch, batch, semester, file);
            return new ResponseEntity<>("Faculty performance uploaded successfully", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Failed to upload faculty performance: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
