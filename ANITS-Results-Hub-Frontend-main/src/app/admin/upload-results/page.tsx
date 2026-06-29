import { FileUploadForm } from "@/components/admin/file-upload-form";

export default function UploadResultsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Student Results</h1>
        <p className="text-muted-foreground">
          Upload an Excel file with student results for a specific year and department.
        </p>
      </div>
      <FileUploadForm />
    </div>
  );
}
