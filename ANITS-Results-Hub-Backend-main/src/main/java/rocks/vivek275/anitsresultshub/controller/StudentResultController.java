package rocks.vivek275.anitsresultshub.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rocks.vivek275.anitsresultshub.models.Student;
import rocks.vivek275.anitsresultshub.models.StudentResult;
import rocks.vivek275.anitsresultshub.service.StudentResultService;

@RestController
@CrossOrigin
@RequestMapping("/api/admin/student")
public class StudentResultController {
    @Autowired
    private StudentResultService studentResultService;
    @GetMapping("/get-student")
    public ResponseEntity<StudentResult> getStudent(@RequestParam("roll_no") String rollNo , @RequestParam("department") String department) {
        return studentResultService.getStudentResult(rollNo, department);
    }
}
