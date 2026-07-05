package rocks.aditya.anitsresultshub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import rocks.aditya.anitsresultshub.models.ResultsJsonRequest;

/**
 * Flow A client: Spring Boot POSTs the uploaded PDF to the n8n webhook and
 * synchronously receives the parsed results JSON back in the HTTP response.
 *
 * Configure in application.properties:
 *   n8n.webhook.url=https://<your-n8n-or-ngrok>/webhook/<path>
 *   n8n.webhook.timeout-ms=120000
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class N8nResultsClient {

    private final ObjectMapper objectMapper;

    @Value("${n8n.webhook.url:}")
    private String n8nWebhookUrl;

    @Value("${n8n.webhook.timeout-ms:120000}")
    private int timeoutMs;

    /**
     * Sends the PDF to n8n and parses the JSON response into a ResultsJsonRequest.
     */
    public ResultsJsonRequest convertPdf(MultipartFile pdfFile) throws Exception {
        if (n8nWebhookUrl == null || n8nWebhookUrl.isBlank()) {
            throw new IllegalStateException(
                    "n8n webhook URL is not configured. Set 'n8n.webhook.url' in application.properties.");
        }
        if (pdfFile == null || pdfFile.isEmpty()) {
            throw new IllegalArgumentException("PDF file is missing or empty.");
        }

        RestTemplate restTemplate = buildRestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON, MediaType.ALL));

        final String filename = (pdfFile.getOriginalFilename() != null && !pdfFile.getOriginalFilename().isBlank())
                ? pdfFile.getOriginalFilename()
                : "input.pdf";

        ByteArrayResource fileResource = new ByteArrayResource(pdfFile.getBytes()) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileResource);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        log.info("ðŸ“¤ Sending PDF '{}' to n8n for parsing: {}", filename, n8nWebhookUrl);
        ResponseEntity<String> response = restTemplate.postForEntity(n8nWebhookUrl, request, String.class);

        String jsonBody = response.getBody();
        if (!response.getStatusCode().is2xxSuccessful() || jsonBody == null || jsonBody.isBlank()) {
            throw new RuntimeException("n8n returned no JSON (status " + response.getStatusCode() + ").");
        }

        log.info("ðŸ“¥ Received JSON from n8n ({} chars). Parsing...", jsonBody.length());
        try {
            return objectMapper.readValue(jsonBody, ResultsJsonRequest.class);
        } catch (Exception e) {
            throw new RuntimeException("Could not parse n8n JSON response into the expected results format: "
                    + e.getMessage(), e);
        }
    }

    private RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);
        return new RestTemplate(factory);
    }
}
