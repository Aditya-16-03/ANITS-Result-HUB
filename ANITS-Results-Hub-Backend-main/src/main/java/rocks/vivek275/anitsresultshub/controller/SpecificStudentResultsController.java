package rocks.vivek275.anitsresultshub.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rocks.vivek275.anitsresultshub.models.StudentResult;
import rocks.vivek275.anitsresultshub.service.StudentResultService;

@RestController
@RequestMapping("/api/student")
@CrossOrigin

public class SpecificStudentResultsController {
    @Autowired
    private StudentResultService studentResultService;
    @GetMapping("/get-results")
    public ResponseEntity<StudentResult> retrieveSpecificResults(@RequestParam("roll_no") String rollNo , @RequestParam("branch") String branch) {
       return studentResultService.getStudentResult(rollNo, branch);
    }
}
