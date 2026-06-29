package rocks.vivek275.anitsresultshub.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import rocks.vivek275.anitsresultshub.models.StudentResult;
import rocks.vivek275.anitsresultshub.repo.ResultsRepo;
import rocks.vivek275.anitsresultshub.repo.StudentsRepo;

import java.util.List;
import java.util.Map;

@Service
public class StudentResultService {
    @Autowired
    StudentsRepo studentsRepo;
    @Autowired
    ResultsRepo resultsRepo;
    public ResponseEntity<StudentResult> getStudentResult(String studentId , String department) {
        try {
            String academicYear = studentId.substring(0, 3).toLowerCase();
            department = department.toLowerCase();
            Map<String, Map<String, Object>> results = resultsRepo.getAllSemestersStudentResult(academicYear, studentId, department);
            StudentResult studentResult = new StudentResult();
            studentResult.setRollNo(studentId);
            studentResult.setDepartment(department.toUpperCase());
            List<Map<String, Object>> studentDetails = studentsRepo.findStudentById(academicYear, department, studentId);
            String name = studentDetails.get(0).get("name_of_the_student").toString();
            studentResult.setName(name);
            String section = studentDetails.get(0).get("section").toString();
            studentResult.setSection(section);
            studentResult.setResults(results);
            return new ResponseEntity<>(studentResult, HttpStatus.OK);
        }
        catch (Exception ex) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
