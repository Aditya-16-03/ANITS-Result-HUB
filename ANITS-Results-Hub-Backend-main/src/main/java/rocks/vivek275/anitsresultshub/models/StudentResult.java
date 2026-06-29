package rocks.vivek275.anitsresultshub.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Component
public class StudentResult {
    private String rollNo;
    private String name;
    private String section;
    private String department;
    private Map<String,Map<String,Object>> results;

    @Override
    public String toString() {
        return "StudentResult{" +
                "rollNo='" + rollNo + '\'' +
                ", name='" + name + '\'' +
                ", section='" + section + '\'' +
                ", department='" + department + '\'' +
                ", results=" + results +
                '}';
    }
}
