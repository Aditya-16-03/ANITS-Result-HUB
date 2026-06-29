package rocks.vivek275.anitsresultshub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import rocks.vivek275.anitsresultshub.service.FacultyPerformanceService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/get-faculty")
@CrossOrigin
public class FacultyPerformanceViewController {
    @Autowired
    private FacultyPerformanceService facultyPerformanceService;
    @PostMapping("/performance")
    public ResponseEntity<List<Map<String, Object>>> getFacultyPerformance(@RequestParam("branch") String branch, @RequestParam("batch") String batch , @RequestParam("semester") String semester) {
        return new ResponseEntity<>(facultyPerformanceService.getFacultyPerformance(branch, batch, semester), HttpStatus.OK);
    }
}
