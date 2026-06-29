import { StudentDetailsUploadForm } from "@/components/admin/student-details-upload-form";

export default function UploadStudentDetailsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Student Details</h1>
        <p className="text-muted-foreground">
          Upload an Excel file with details of newly joined students for a specific admission year.
        </p>
      </div>
      <StudentDetailsUploadForm />
    </div>
  );
}
