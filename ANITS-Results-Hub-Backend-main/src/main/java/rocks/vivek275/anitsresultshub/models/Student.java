package rocks.vivek275.anitsresultshub.models;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    private String email;
    private String roll;
    private String password;
    private String department;
}

