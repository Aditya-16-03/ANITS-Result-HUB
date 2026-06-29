import { StudentPerformanceUploadForm } from "@/components/admin/student-performance-upload-form";

export default function UploadStudentPerformancePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Student Performance</h1>
        <p className="text-muted-foreground">
          Enter the details for the student performance.
        </p>
      </div>
      <StudentPerformanceUploadForm />
    </div>
  );
}
