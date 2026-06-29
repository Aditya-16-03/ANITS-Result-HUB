package rocks.vivek275.anitsresultshub.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import rocks.vivek275.anitsresultshub.models.BaseUser;

import java.util.List;
import java.util.Map;

@Repository
public class StudentsRepo  {
    private final JdbcTemplate jdbcTemplate;
    public StudentsRepo(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
   public List<Map<String, Object>> findAllAdminStudents(String academicYear,String department) {
        String studentTableName = String.format("students_%s_%s",
                academicYear.toLowerCase(),
                department.toLowerCase());
        String sql = "select roll_no,name_of_the_student,section from "+studentTableName+" order by roll_no";
        try {

            return jdbcTemplate.queryForList(sql);
        }
        catch (Exception e) {
            return null;
        }
    }
    public List<Map<String, Object>> findStudentById(String academicYear,String department,String rollNo) {
        String studentTableName = String.format("students_%s_%s",
                academicYear.toLowerCase(),
                department.toLowerCase());
        String sql = "select roll_no,name_of_the_student,section from "+studentTableName+" where roll_no=?";
        try {
            return jdbcTemplate.queryForList(sql,rollNo);
        }
        catch (Exception e) {
            return null;
        }
    }
}
