package rocks.vivek275.anitsresultshub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rocks.vivek275.anitsresultshub.models.*;
import rocks.vivek275.anitsresultshub.service.UserRegistrationService;
import rocks.vivek275.anitsresultshub.service.UserValidationService;

@RestController
@CrossOrigin
@RequestMapping("/api/signup")
public class RegisterController {

    @Autowired
    UserRegistrationService userRegistrationService;

    @Autowired
    UserValidationService userValidationService;

    @PostMapping("/student")
    public ResponseEntity<RegisterWrapper> signupStudent(@RequestBody Student student) {
        if (userValidationService.isValidStudent(student.getRoll(), student.getDepartment())) {
            try {
                BaseUser user = new BaseUser();
                user.setEmail(student.getEmail());
                user.setPassword(student.getPassword());
                user.setUsername(student.getRoll());
                user.setDepartment(student.getDepartment());
                user.setTypeOfUser("student");

                return userRegistrationService.registerUser(user);
            } catch (Exception ex) {
                RegisterWrapper registerWrapper = new RegisterWrapper();
                registerWrapper.setSuccess(false);
                registerWrapper.setTypeOfUser(null);
                return new ResponseEntity<>(registerWrapper, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else {
            return new ResponseEntity<>(new RegisterWrapper(false, "Not a Valid User"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/faculty")
    public ResponseEntity<RegisterWrapper> signupFaculty(@RequestBody Faculty faculty) {
        if (userValidationService.isValidFaculty(faculty.getEmail(), faculty.getDepartment())) {
            try {
                BaseUser user = new BaseUser();
                user.setEmail(faculty.getEmail());
                user.setPassword(faculty.getPassword());
                user.setUsername(faculty.getUsername());
                user.setDepartment(faculty.getDepartment());
                user.setTypeOfUser("faculty");

                return userRegistrationService.registerUser(user);
            } catch (Exception ex) {
                RegisterWrapper registerWrapper = new RegisterWrapper();
                registerWrapper.setSuccess(false);
                registerWrapper.setTypeOfUser(null);
                return new ResponseEntity<>(registerWrapper, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        else {
            return new ResponseEntity<>(new RegisterWrapper(false, "Not a Valid User"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
