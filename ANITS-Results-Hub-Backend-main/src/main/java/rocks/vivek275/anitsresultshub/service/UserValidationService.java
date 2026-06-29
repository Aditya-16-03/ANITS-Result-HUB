package rocks.vivek275.anitsresultshub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rocks.vivek275.anitsresultshub.repo.FacultyRepo;
import rocks.vivek275.anitsresultshub.repo.StudentsRepo;

import java.util.List;
import java.util.Map;

@Service
public class UserValidationService {
    @Autowired
    StudentsRepo studentsRepo;
    @Autowired
    FacultyRepo facultyRepo;

    public boolean isValidStudent(String roll ,String department) {
        try {
            String academicYear = roll.substring(0, 3).toLowerCase();
            List<Map<String, Object>> user = studentsRepo.findStudentById(academicYear, department, roll);
            String rollNo = user.get(0).get("roll_no").toString();
            if (rollNo == null || rollNo.isEmpty()) {
                return false;
            } else {
                return true;
            }
        }
        catch (Exception e) {
            return false;
        }
    }
    public boolean isValidFaculty(String email,String branch) {
        try {
            List<Map<String,Object>> faculty = facultyRepo.findFacultyByEmail(email, branch);
            String facultyId = faculty.get(0).get("email").toString();
            if (facultyId == null || facultyId.isEmpty()) {
                return false;
            }
            return true;
        }
        catch (Exception e) {
            return false;
        }
    }
}
