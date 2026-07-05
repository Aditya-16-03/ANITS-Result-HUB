import { FileUploadForm } from "@/components/admin/file-upload-form";

export default function UploadResultsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Student Results</h1>
        <p className="text-muted-foreground">
          Upload the results PDF. Year, semester, department and subjects are detected automatically.
        </p>
      </div>
      <FileUploadForm />
    </div>
  );
}
