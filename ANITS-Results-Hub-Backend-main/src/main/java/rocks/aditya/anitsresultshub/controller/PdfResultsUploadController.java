package rocks.aditya.anitsresultshub.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rocks.aditya.anitsresultshub.models.ResultsJsonRequest;
import rocks.aditya.anitsresultshub.service.JsonResultsUploadService;
import rocks.aditya.anitsresultshub.service.N8nResultsClient;

/**
 * Flow A results ingestion.
 *
 *   Admin uploads a PDF  ->  this endpoint sends it to the n8n webhook  ->
 *   n8n responds with the results JSON  ->  it is saved into the
 *   {batch}_{semester}_{branch} tables via JsonResultsUploadService.
 *
 *   POST /api/admin/results/pdf   (requires a JWT; multipart form field: file)
 */
@RestController
@RequestMapping("/api/admin/results")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class PdfResultsUploadController {

    private final N8nResultsClient n8nResultsClient;
    private final JsonResultsUploadService jsonResultsUploadService;

    @PostMapping("/pdf")
    public ResponseEntity<?> uploadResultsPdf(@RequestParam("file") MultipartFile file) {
        try {
            log.info("ðŸ“„ Results PDF received ('{}'), forwarding to n8n...", file.getOriginalFilename());

            // 1) PDF -> n8n -> results JSON
            ResultsJsonRequest parsed = n8nResultsClient.convertPdf(file);

            // 2) Save the parsed JSON (same logic as the direct-JSON endpoint)
            JsonResultsUploadService.UploadSummary summary = jsonResultsUploadService.saveResults(parsed);

            return ResponseEntity.ok(summary);

        } catch (IllegalStateException e) {
            // n8n not configured
            log.warn("Results PDF rejected: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("âŒ " + e.getMessage());
        } catch (IllegalArgumentException e) {
            // bad input / empty file / unparseable structure
            log.warn("Results PDF rejected: {}", e.getMessage());
            return ResponseEntity.badRequest().body("âŒ " + e.getMessage());
        } catch (Exception e) {
            // n8n unreachable or returned something unexpected
            log.error("Results PDF processing failed", e);
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("âŒ PDF conversion/parse failed: " + e.getMessage());
        }
    }
}
