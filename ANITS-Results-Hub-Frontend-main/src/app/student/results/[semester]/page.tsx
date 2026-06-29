
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { formatSubjectName } from "@/services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const nonSubjectKeys = ["rollno", "sgpa", "cgpa", "section", "status"];

const checkHasFGrade = (result: any | null): boolean => {
    if (!result) return false;
    for (const key in result) {
        if (!nonSubjectKeys.includes(key.toLowerCase())) {
            if (result[key] === 'F') {
                return true;
            }
        }
    }
    return false;
}

export default function SemesterResultPage() {
  const params = useParams();
  const semesterId = params.semester as string;

  const [semesterData, setSemesterData] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState({ name: '', rollNo: '', department: '', section: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const storedData = localStorage.getItem("studentData");
    const storedName = localStorage.getItem("studentName") || '';
    const storedRollNo = localStorage.getItem("studentRollNo") || '';
    const storedDepartment = localStorage.getItem("studentDepartment") || '';
    const storedSection = localStorage.getItem("studentSection") || '';

    setStudentInfo({ name: storedName, rollNo: storedRollNo, department: storedDepartment, section: storedSection });

    if (storedData) {
      const allResults = JSON.parse(storedData).results;
      const dataForSemester = allResults[semesterId];
      if (dataForSemester) {
         const hasFGrade = checkHasFGrade(dataForSemester);
         setSemesterData({
            ...dataForSemester,
            status: hasFGrade ? 'fail' : 'pass'
         });
      } else if (dataForSemester === null) {
        setSemesterData({ status: 'pending', results: [] });
      }
    }
    setIsLoading(false);
  }, [semesterId]);

  const handleDownload = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);

    // Temporarily add a class to style for printing
    const printElement = printRef.current;
    printElement.classList.add('printing');

    const canvas = await html2canvas(printElement, {
      scale: 2,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#020817' : '#FFFFFF',
      useCORS: true,
    });
    
    printElement.classList.remove('printing');
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasAspectRatio = canvasWidth / canvasHeight;

    let imgWidth = pdfWidth - 20; // with some margin
    let imgHeight = imgWidth / canvasAspectRatio;

    if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * canvasAspectRatio;
    }
    
    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = 10; // top margin

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    pdf.save(`results-${studentInfo.rollNo}-${semesterId}.pdf`);
    setIsDownloading(false);
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full min-h-[60vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  if (!semesterData) {
    notFound();
  }

  const results = Object.entries(semesterData)
    .filter(([key]) => !nonSubjectKeys.includes(key.toLowerCase()));

  return (
    <div className="space-y-8">
       <style jsx global>{`
        .printing .non-printable {
            display: none;
        }
        .printing .printable-header {
            display: block !important;
        }
       `}</style>
       <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="non-printable">
                <Link href="/student/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Dashboard</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{semesterId} Semester Results</h1>
                <p className="text-muted-foreground">
                Your detailed academic performance for the semester.
                </p>
            </div>
        </div>
        <Button variant="outline" onClick={handleDownload} disabled={isDownloading} className="non-printable">
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
        </Button>
      </div>
      
      <div ref={printRef} className="bg-card p-6 rounded-lg border">
          <div className="printable-header hidden mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-center">Results Summary</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-sm">
                  <div><strong>Name:</strong> {studentInfo.name}</div>
                  <div><strong>Roll No:</strong> {studentInfo.rollNo}</div>
                  <div><strong>Department:</strong> {studentInfo.department}</div>
                  <div><strong>Section:</strong> {studentInfo.section}</div>
              </div>
          </div>

          <CardHeader className="flex flex-row justify-between items-center p-0 mb-6">
          <div className="flex gap-8">
             <div>
                <CardTitle>SGPA</CardTitle>
                <CardDescription className={cn(
                   "font-bold text-xl",
                   semesterData.status === "pass" && "text-green-600 dark:text-green-400",
                   semesterData.status === "fail" && "text-red-600 dark:text-red-400",
                   semesterData.status === "pending" && "text-primary"
                )}>{semesterData.sgpa || '--'}</CardDescription>
             </div>
             <div>
                <CardTitle>CGPA</CardTitle>
                <CardDescription className="font-bold text-xl text-primary">{semesterData.cgpa || '--'}</CardDescription>
             </div>
             <div>
                <CardTitle>Status</CardTitle>
                <CardDescription className={cn(
                   "font-bold text-xl",
                   semesterData.status === "pass" && "text-green-600 dark:text-green-400",
                   semesterData.status === "fail" && "text-red-600 dark:text-red-400",
                   semesterData.status === "pending" && "text-primary"
                )}>{semesterData.status.charAt(0).toUpperCase() + semesterData.status.slice(1)}</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
           {results.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead className="text-right">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map(([subject, grade]) => (
                    <TableRow key={subject}>
                      <TableCell className="font-medium">{formatSubjectName(subject)}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex justify-end">
                            <Badge variant={grade === "F" ? "destructive" : "default"} className="w-10 h-8 flex items-center justify-center text-base">{String(grade)}</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           ) : (
             <div className="text-center text-muted-foreground py-10">
                Results for this semester are not yet available.
            </div>
           )}
        </CardContent>
      </div>
    </div>
  );
}
 
