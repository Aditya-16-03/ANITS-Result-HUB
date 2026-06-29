package rocks.vivek275.anitsresultshub.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplyResultsFetchService {

    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> fetchSupplyResults(String batch, String semester, String branch) {
        String tableName = "supply_" + batch.toLowerCase() + "_" +
                semester.replace("-", "_").toLowerCase() + "_" +
                branch.toLowerCase();
        log.info("Attempting to fetch supply results from table: {}", tableName);

        try {
            String sql = "SELECT * FROM " + tableName;
            return jdbcTemplate.queryForList(sql);

        } catch (BadSqlGrammarException e) {
            log.warn("⚠Table {} does not exist. It might not be uploaded yet.", tableName);
            return null;
        }
    }
}