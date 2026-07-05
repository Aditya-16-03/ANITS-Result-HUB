package rocks.aditya.anitsresultshub.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Request body for the JSON results upload produced by n8n (PDF -> JSON).
 *
 * One request carries all branches (sections). Example:
 * {
 *   "sectionCount": 9,
 *   "sections": [
 *     {
 *       "branch": "CHEMICAL ENGINEERING",
 *       "examType": "Regular Examinations (R23)",
 *       "heldIn": "December 2024",
 *       "semester": "II/IV B.Tech SEM-I",
 *       "students": [
 *         { "cgpa": 8.15, "rollNo": "A23126502001", "sgpa": 7.36,
 *           "subjects": { "Momentum Transfer": "A", "Mechanical Operations Lab": "A", ... } }
 *       ]
 *     }
 *   ]
 * }
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResultsJsonRequest {

    private Integer sectionCount;
    private List<Section> sections;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Section {
        private String branch;      // full branch name, e.g. "CHEMICAL ENGINEERING"
        private String examType;    // e.g. "Regular Examinations (R23)"
        private String heldIn;      // e.g. "December 2024"
        private String semester;    // e.g. "II/IV B.Tech SEM-I"
        private List<StudentResultEntry> students;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StudentResultEntry {
        private String rollNo;
        private Double sgpa;
        private Double cgpa;
        private Map<String, String> subjects;   // subject name -> grade
    }
}
