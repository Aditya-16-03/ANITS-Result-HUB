package rocks.aditya.anitsresultshub.util;

/**
 * Maps a full branch name coming from the results JSON (e.g. "CHEMICAL ENGINEERING")
 * to the short department code the app uses in table names and in the frontend
 * department dropdown (e.g. "csm", "cse").
 *
 * Frontend DEPARTMENTS: CSE, IT, ECE, EEE, MECH, CIVIL, CSM.
 * For any branch that isn't one of those, a short, deterministic code is generated
 * from the branch name so the upload still works (e.g. "CHEMICAL ENGINEERING" -> "che").
 */
public final class BranchCodeMapper {

    private BranchCodeMapper() {
    }

    /**
     * @param branchName full branch name from the JSON payload
     * @return lowercase short code used in the table name ({batch}_{sem}_{code})
     */
    public static String toCode(String branchName) {
        if (branchName == null || branchName.isBlank()) {
            return "unknown";
        }
        String n = branchName.trim().toUpperCase();

        // Known ANITS departments (matched by keywords so exact wording can vary).
        boolean hasComputer = n.contains("COMPUTER");
        boolean aiMl = n.contains("AI") || n.contains("ML") || n.contains("MACHINE LEARNING")
                || n.contains("ARTIFICIAL");

        // Computer-science specialisations - check the specific ones BEFORE plain CSE.
        if (hasComputer && n.contains("DATA SCIENCE")) return "csd";   // CSE with Data Science
        if (hasComputer && n.contains("CYBER")) return "csc";          // CSE with Cyber Security
        if (hasComputer && aiMl) return "csm";                         // CSE with AI & ML
        if (hasComputer) return "cse";                                 // Computer Science & Engineering

        if (n.contains("INFORMATION")) return "it";                    // Information Technology
        if (n.contains("ELECTRONICS") && n.contains("COMMUNICATION")) return "ece";
        if (n.contains("ELECTRICAL")) return "eee";                    // Electrical & Electronics
        if (n.contains("MECHAN")) return "mech";                       // Mechanical
        if (n.contains("CIVIL")) return "civil";                       // Civil
        if (n.contains("CHEMICAL")) return "che";                      // Chemical

        // Fallback: build a deterministic code from the first letters of each word.
        return generateFallbackCode(n);
    }

    /**
     * Builds a short code from the initials of the branch words; if that is too short,
     * falls back to a sanitized, truncated version of the whole name.
     */
    private static String generateFallbackCode(String upperName) {
        StringBuilder initials = new StringBuilder();
        for (String word : upperName.split("[^A-Z0-9]+")) {
            if (word.isBlank()) continue;
            // skip common filler words so the code stays meaningful
            if (word.equals("AND") || word.equals("OF") || word.equals("ENGINEERING")
                    || word.equals("TECHNOLOGY") || word.equals("THE")) {
                continue;
            }
            initials.append(word.charAt(0));
        }
        String code = initials.toString().toLowerCase();
        if (code.length() >= 2) {
            return code;
        }
        // last resort: sanitized + truncated full name
        String sanitized = upperName.toLowerCase().replaceAll("[^a-z0-9]", "");
        return sanitized.isEmpty() ? "unknown" : sanitized.substring(0, Math.min(6, sanitized.length()));
    }
}
