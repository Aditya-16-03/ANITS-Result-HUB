package rocks.aditya.anitsresultshub.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import rocks.aditya.anitsresultshub.models.BaseUser;
import rocks.aditya.anitsresultshub.models.RegisterWrapper;
import rocks.aditya.anitsresultshub.repo.UserRepo;

@Service
public class UserRegistrationService {
    @Autowired
    UserRepo userRepo;
    public ResponseEntity<RegisterWrapper> registerUser(BaseUser user) {
        try {
            userRepo.save(user);
            RegisterWrapper registerWrapper = new RegisterWrapper();
            registerWrapper.setSuccess(true);
            registerWrapper.setTypeOfUser(user.getTypeOfUser());
            return new ResponseEntity<>(registerWrapper, HttpStatus.OK);
        }
        catch (Exception ex) {
            RegisterWrapper registerWrapper = new RegisterWrapper();
            registerWrapper.setSuccess(false);
            registerWrapper.setTypeOfUser(null);
            return new ResponseEntity<>(registerWrapper, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
