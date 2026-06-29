package rocks.vivek275.anitsresultshub.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LogInWrapper {
    private Boolean success;
    private String typeOfUser;
    private String jwtToken; // JWT token
}
