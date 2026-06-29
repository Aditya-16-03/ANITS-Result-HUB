
import { NewFacultyPerformanceUploadForm } from "@/components/admin/new-faculty-performance-upload-form";

export default function UploadFacultyPerformancePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Faculty Performance</h1>
        <p className="text-muted-foreground">
          Enter the details for the faculty performance.
        </p>
      </div>
      <NewFacultyPerformanceUploadForm />
    </div>
  );
}
