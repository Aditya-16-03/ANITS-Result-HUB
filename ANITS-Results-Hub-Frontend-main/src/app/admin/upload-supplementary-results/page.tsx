import { SupplementaryResultsUploadForm } from "@/components/admin/supplementary-results-upload-form";

export default function UploadSupplementaryResultsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Supplementary Results</h1>
        <p className="text-muted-foreground">
          Upload an Excel file with supplementary student results for a specific year and department.
        </p>
      </div>
      <SupplementaryResultsUploadForm />
    </div>
  );
}
