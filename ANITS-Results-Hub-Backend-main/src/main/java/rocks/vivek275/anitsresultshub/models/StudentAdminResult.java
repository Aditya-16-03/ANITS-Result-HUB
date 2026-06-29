package rocks.vivek275.anitsresultshub.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentAdminResult {
    private String rollno;
    private String name;
    private String section;
    private String sgpa;
    private String status;
}
