package rocks.vivek275.anitsresultshub.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rocks.vivek275.anitsresultshub.service.StudentPerformanceService;

@RestController
@RequestMapping("/api/admin/upload")
@CrossOrigin
public class StudentPerformanceUploadController {
   @Autowired
   private StudentPerformanceService studentPerformanceService;
    @PostMapping("/student-performance")
    public ResponseEntity<String> uploadPerformance(
            @RequestParam("batch") String batch,
            @RequestParam("branch") String branch,
            @RequestParam("semester") String semester,
            @RequestParam("file") MultipartFile file) {
        try {
            studentPerformanceService.savePerformance(batch.toLowerCase(), branch.toLowerCase(), semester.replace("-","_"), file);
            return ResponseEntity.ok("Student performance data uploaded successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
