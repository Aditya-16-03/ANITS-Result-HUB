package rocks.vivek275.anitsresultshub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rocks.vivek275.anitsresultshub.models.StudentAdminResult;
import rocks.vivek275.anitsresultshub.service.StudentsResultsService;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/admin/student")
public class AdminStudentResultsController {
    @Autowired
    StudentsResultsService studentsResultsService;
    @GetMapping("/get-students")
    public ResponseEntity<List<StudentAdminResult>> getStudents(@RequestParam("batch") String admissionYear,@RequestParam("semester") String semester , @RequestParam("branch") String department){
        try {
            List<StudentAdminResult> students = new ArrayList<>();

            students = studentsResultsService.getStudentsResults(admissionYear.toLowerCase(),semester,department.toLowerCase());
            return new ResponseEntity<>(students, HttpStatus.OK);
        }
        catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
