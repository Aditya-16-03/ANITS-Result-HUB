package rocks.vivek275.anitsresultshub.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class BaseUser {
    @Id
    private String email;
    private String username;
    private String password;
    private String typeOfUser;
    private String department;

    @Override
    public String toString() {
        return "BaseUser{" +
                "email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", typeOfUser='" + typeOfUser + '\'' +
                '}';
    }
}
