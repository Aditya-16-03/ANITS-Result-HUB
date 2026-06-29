package rocks.vivek275.anitsresultshub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import rocks.vivek275.anitsresultshub.models.BaseUser;
import rocks.vivek275.anitsresultshub.models.LogInWrapper;
import rocks.vivek275.anitsresultshub.repo.UserRepo;
import rocks.vivek275.anitsresultshub.security.JwtUtil;

@Service
public class UserLoginService {
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtUtil jwtUtil; // Inject JWT utility

    public ResponseEntity<LogInWrapper> login(String email, String username, String password) {
        BaseUser baseUser = userRepo.getBaseUserByEmail(email);
        if (baseUser == null) {
            LogInWrapper wrapper = new LogInWrapper(false, null, null);
            return new ResponseEntity<>(wrapper, HttpStatus.NOT_FOUND);
        }

        if (baseUser.getUsername().equals(username) && baseUser.getPassword().equals(password)) {
            LogInWrapper logInWrapper = new LogInWrapper();
            logInWrapper.setSuccess(true);
            logInWrapper.setTypeOfUser(baseUser.getTypeOfUser());

            // Generate JWT token
            String token = jwtUtil.generateToken(baseUser.getEmail(), baseUser.getUsername(), baseUser.getTypeOfUser());
            logInWrapper.setJwtToken(token);

            return new ResponseEntity<>(logInWrapper, HttpStatus.OK);
        } else {
            LogInWrapper wrapper = new LogInWrapper(false, null, null);
            return new ResponseEntity<>(wrapper, HttpStatus.UNAUTHORIZED);
        }
    }
}

