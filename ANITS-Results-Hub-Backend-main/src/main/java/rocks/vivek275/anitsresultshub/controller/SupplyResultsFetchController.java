package rocks.vivek275.anitsresultshub.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rocks.vivek275.anitsresultshub.service.SupplyResultsFetchService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
@CrossOrigin
public class SupplyResultsFetchController {

    private final SupplyResultsFetchService supplyFetchService;

    @GetMapping("/fetch-supply")
    public ResponseEntity<?> fetchSupplyResults(
            @RequestParam("batch") String batch,
            @RequestParam("semester") String semester,
            @RequestParam("branch") String branch) {
        List<Map<String, Object>> results = supplyFetchService.fetchSupplyResults(batch, semester, branch);
        if (results == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No supplementary results found for the specified batch, semester, and branch.");
        }
        return ResponseEntity.ok(results);
    }
}