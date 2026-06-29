
import { FacultyDetailsUploadForm } from "@/components/admin/faculty-details-upload-form";

export default function UploadFacultyDetailsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Upload Faculty Details</h1>
        <p className="text-muted-foreground">
          Upload an Excel file with details of faculty members.
        </p>
      </div>
      <FacultyDetailsUploadForm />
    </div>
  );
}
