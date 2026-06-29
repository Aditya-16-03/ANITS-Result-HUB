package rocks.vivek275.anitsresultshub.models;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Admin {
    private String email;
    private String username;
    private String password;
}
