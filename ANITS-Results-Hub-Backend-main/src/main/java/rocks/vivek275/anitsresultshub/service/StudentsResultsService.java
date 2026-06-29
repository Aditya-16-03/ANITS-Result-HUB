package rocks.vivek275.anitsresultshub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rocks.vivek275.anitsresultshub.models.StudentAdminResult;
import rocks.vivek275.anitsresultshub.repo.ResultsRepo;
import rocks.vivek275.anitsresultshub.repo.StudentsRepo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class StudentsResultsService {
    @Autowired
    ResultsRepo resultsRepo;
    @Autowired
    StudentsRepo studentsRepo;
    public List<StudentAdminResult> getStudentsResults(String batch,String semester,String branch) {
        try {
            List<Map<String, Object>> studentResults = resultsRepo.getAllStudentAdminResults(batch, semester, branch);
            List<Map<String, Object>> studentDetails = studentsRepo.findAllAdminStudents(batch, branch);
            List<StudentAdminResult> studentAdminResults = new ArrayList<>();
            for (int i = 0; i < studentResults.size(); i++) {
                Map<String, Object> studentResult = studentResults.get(i);
                Map<String, Object> studentDetail = studentDetails.get(i);
                StudentAdminResult studentAdminResult = new StudentAdminResult();
                String rollNo = studentResult.get("rollno").toString();
                String sgpa;
                if (studentResult.get("sgpa") == null) {
                    sgpa = "--";
                } else {
                    sgpa = studentResult.get("sgpa").toString();
                }
                String studentRollNo = studentDetail.get("roll_no").toString();
                String studentName = studentDetail.get("name_of_the_student").toString();
                String sectionName = studentDetail.get("section").toString();
                if (Objects.equals(rollNo, studentRollNo)) {
                    studentAdminResult.setRollno(rollNo);
                    studentAdminResult.setName(studentName);
                    studentAdminResult.setSection(sectionName);
                    if (!Objects.equals(sgpa, "--")) {
                        studentAdminResult.setSgpa(sgpa);
                        studentAdminResult.setStatus("Passed");
                    } else {
                        studentAdminResult.setSgpa(sgpa);
                        studentAdminResult.setStatus("Failed");
                    }
                    studentAdminResults.add(studentAdminResult);
                }
            }
            return studentAdminResults;
        }
        catch (Exception e) {
            return null;
        }
    }
}
