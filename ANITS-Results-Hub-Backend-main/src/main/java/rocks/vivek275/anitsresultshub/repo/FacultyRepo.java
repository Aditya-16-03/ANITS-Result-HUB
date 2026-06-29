package rocks.vivek275.anitsresultshub.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import rocks.vivek275.anitsresultshub.models.BaseUser;

import java.util.List;
import java.util.Map;

@Repository
public class FacultyRepo{
    private final JdbcTemplate jdbcTemplate;
    public FacultyRepo(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    public List<Map<String, Object>> getFacultyPerformance(String branch , String batch , String semester) {
        try{
            String tableName = String.format("faculty_%s_%s_%s",
                    batch.toLowerCase(),
                    semester.replace("-", "_").toLowerCase(),
                    branch.toLowerCase());
            String sql = "select * from " + tableName;
            return jdbcTemplate.queryForList(sql);
        }
        catch(Exception e){
            return null;
        }
    }
    /*
    private final JdbcTemplate jdbcTemplate;

    public ResultsDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> getResults(String year, int semester, String dept) {
        String sql = "SELECT student_name, academic_year, semester, department " +
                     "FROM results WHERE academic_year=? AND semester=? AND department=?";
        return jdbcTemplate.queryForList(sql, year, semester, dept);
    }
     */
    public List<Map<String, Object>> findFacultyByEmail(String email,String branch) {
        String facultyTableName = String.format("faculty_%s",
                branch.toLowerCase());
        String sql = "select email from "+facultyTableName+" where email=?";
        try {
            return jdbcTemplate.queryForList(sql,email);
        }
        catch (Exception e) {
            return null;
        }
    }
}
