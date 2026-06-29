package rocks.vivek275.anitsresultshub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rocks.vivek275.anitsresultshub.models.*;
import rocks.vivek275.anitsresultshub.service.UserLoginService;

@RestController
@CrossOrigin
@RequestMapping("/api/login")
public class LoginController {

    @Autowired
    UserLoginService userLoginService;

    @PostMapping("/student")
    public ResponseEntity<LogInWrapper> signinStudent(@RequestBody Student student) {
        try {
            return userLoginService.login(student.getEmail(), student.getRoll(), student.getPassword());
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/faculty")
    public ResponseEntity<LogInWrapper> signinFaculty(@RequestBody Faculty faculty) {
        try {
            return userLoginService.login(faculty.getEmail(), faculty.getUsername(), faculty.getPassword());
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/admin")
    public ResponseEntity<LogInWrapper> signinAdmin(@RequestBody Admin admin) {
        try {
            return userLoginService.login(admin.getEmail(), admin.getUsername(), admin.getPassword());
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
