package rocks.vivek275.anitsresultshub.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import rocks.vivek275.anitsresultshub.models.BaseUser;

import java.util.*;

@Repository
public class ResultsRepo {

    private final JdbcTemplate jdbcTemplate;

    public ResultsRepo(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> getAllStudentAdminResults(String academicYear, String semester, String department) {
        String tableName = academicYear.toLowerCase() + "_" +
                semester.replace("-", "_").toLowerCase() + "_" +
                department.toLowerCase();
        String sql = "select rollno,sgpa from " + tableName;
        try {
            return jdbcTemplate.queryForList(sql);
        }
        catch (Exception e) {
//            e.printStackTrace();
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
    public Map<String,Map<String,Object>> getAllSemestersStudentResult(String academicYear, String rollNo , String department) {
        String sems[] = {"1-1","1-2","2-1","2-2","3-1","3-2","4-1","4-2"};
        Map<String,Map<String,Object>> results = new LinkedHashMap<>();
        for (String s : sems) {
            String tableName = academicYear.toLowerCase() + "_" +
                    s.replace("-", "_").toLowerCase() + "_" +
                    department.toLowerCase();

            String sql = "SELECT * FROM " + tableName + " WHERE rollno = ?";
            try {
                List<Map<String, Object>> map = jdbcTemplate.queryForList(sql, rollNo);
                if (map != null && !map.isEmpty()) {
                    results.put(s, map.get(0));
                } else {
                    results.put(s, null);
                }
            } catch (Exception e) {
                results.put(s, null);
            }
        }
        return results;
    }
}
