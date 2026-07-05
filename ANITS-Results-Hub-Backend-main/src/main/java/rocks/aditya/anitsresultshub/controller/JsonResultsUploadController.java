package rocks.aditya.anitsresultshub.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rocks.aditya.anitsresultshub.models.ResultsJsonRequest;
import rocks.aditya.anitsresultshub.service.JsonResultsUploadService;

/**
 * JSON results ingestion (from n8n, which converts the uploaded PDF to JSON).
 *
 *   POST /api/admin/results/json
 *   body: the full n8n payload { sectionCount, sections:[ {branch, semester, students:[...]} ] }
 *
 * One request may contain many branches; each is stored into its own
 * {batch}_{semester}_{branch} table, which the existing view flow already reads.
 */
@RestController
@RequestMapping("/api/admin/results")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class JsonResultsUploadController {

    private final JsonResultsUploadService jsonResultsUploadService;

    @PostMapping("/json")
    public ResponseEntity<?> uploadResultsJson(@RequestBody ResultsJsonRequest request) {
        try {
            int sections = (request.getSections() != null) ? request.getSections().size() : 0;
            log.info("ðŸ“¥ JSON results upload received: {} section(s)", sections);

            JsonResultsUploadService.UploadSummary summary = jsonResultsUploadService.saveResults(request);

            return ResponseEntity.ok(summary);

        } catch (IllegalArgumentException e) {
            log.warn("Rejected JSON results upload: {}", e.getMessage());
            return ResponseEntity.badRequest().body("âŒ " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to store JSON results", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("âŒ Failed to store results: " + e.getMessage());
        }
    }
}
