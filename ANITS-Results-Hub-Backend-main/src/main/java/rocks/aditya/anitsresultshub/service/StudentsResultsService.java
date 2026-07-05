package rocks.aditya.anitsresultshub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rocks.aditya.anitsresultshub.models.StudentAdminResult;
import rocks.aditya.anitsresultshub.repo.ResultsRepo;
import rocks.aditya.anitsresultshub.repo.StudentsRepo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudentsResultsService {
    @Autowired
    ResultsRepo resultsRepo;
    @Autowired
    StudentsRepo studentsRepo;
    public List<StudentAdminResult> getStudentsResults(String batch, String semester, String branch) {
        try {
            List<Map<String, Object>> studentResults = resultsRepo.getAllStudentAdminResults(batch, semester, branch);
            List<Map<String, Object>> studentDetails = studentsRepo.findAllAdminStudents(batch, branch);

            List<StudentAdminResult> studentAdminResults = new ArrayList<>();
            if (studentDetails == null) {
                return studentAdminResults; // no student master list for this branch
            }

            // Index the results by roll number so we can match reliably (order-independent).
            Map<String, Object> sgpaByRoll = new HashMap<>();
            if (studentResults != null) {
                for (Map<String, Object> r : studentResults) {
                    Object roll = r.get("rollno");
                    if (roll != null) {
                        sgpaByRoll.put(roll.toString().trim(), r.get("sgpa"));
                    }
                }
            }

            // Iterate over ALL students in the master list and attach their SGPA (if any).
            for (Map<String, Object> studentDetail : studentDetails) {
                if (studentDetail == null || studentDetail.get("roll_no") == null) continue;

                String rollNo = studentDetail.get("roll_no").toString().trim();
                String studentName = studentDetail.get("name_of_the_student") != null
                        ? studentDetail.get("name_of_the_student").toString() : "";
                String sectionName = studentDetail.get("section") != null
                        ? studentDetail.get("section").toString() : "";

                StudentAdminResult studentAdminResult = new StudentAdminResult();
                studentAdminResult.setRollno(rollNo);
                studentAdminResult.setName(studentName);
                studentAdminResult.setSection(sectionName);

                Object sgpaObj = sgpaByRoll.get(rollNo);
                String sgpa = (sgpaObj == null || sgpaObj.toString().isBlank()) ? "--" : sgpaObj.toString();
                if (!sgpa.equals("--")) {
                    studentAdminResult.setSgpa(sgpa);
                    studentAdminResult.setStatus("Passed");
                } else {
                    studentAdminResult.setSgpa(sgpa);
                    studentAdminResult.setStatus("Failed");
                }
                studentAdminResults.add(studentAdminResult);
            }
            return studentAdminResults;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
