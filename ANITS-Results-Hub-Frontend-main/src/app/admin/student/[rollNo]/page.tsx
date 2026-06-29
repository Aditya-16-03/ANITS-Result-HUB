
"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { getStudentDetails } from "@/services/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formatSubjectName = (subjectKey: string): string => {
    return subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
};

const nonSubjectKeys = ["rollno", "sgpa", "cgpa", "section", "roll_no"];

function StudentDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rollNo = params.rollNo as string;
  const department = searchParams.get("department");

  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (rollNo && department) {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getStudentDetails(rollNo, department);
          setStudentData(data);
        } catch (err: any) {
          setError(err.message || "Failed to fetch student details.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
          setError("Roll number or department is missing.");
          setIsLoading(false);
      }
    };

    fetchData();
  }, [rollNo, department]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold text-destructive">Error</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild className="mt-6">
            <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Student Not Found</h2>
        <p className="text-muted-foreground">The student with roll number {rollNo} could not be found.</p>
        <Button asChild className="mt-6">
            <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const { results: semesterResults } = studentData;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
            <Link href="/admin/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
            </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
          <p className="text-muted-foreground">Detailed view of student's academic record.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>{studentData.name}</CardTitle>
                    <CardDescription>{studentData.rollNo}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Department</h3>
                        <p className="text-muted-foreground">{studentData.department}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Section</h3>
                        <p className="text-muted-foreground">{studentData.section}</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
           <Card>
                <CardHeader>
                    <CardTitle>Semester Results</CardTitle>
                    <CardDescription>
                        Summary of performance across all available semesters.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   {semesterResults && Object.keys(semesterResults).length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {Object.entries(semesterResults).map(([semester, details]: [string, any]) => (
                            <AccordionItem value={semester} key={semester}>
                                <AccordionTrigger disabled={!details}>
                                    <div className="flex justify-between w-full pr-4">
                                        <span className="font-medium">Semester {semester}</span>
                                        {details ? (
                                            <div className="flex gap-4 items-center">
                                                <span className="text-sm">SGPA: {details.sgpa || '--'}</span>
                                                <span className="text-sm">CGPA: {details.cgpa || '--'}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Results not available</span>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    {details ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead className="text-right">Grade</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {Object.keys(details)
                                                    .filter(key => !nonSubjectKeys.includes(key.toLowerCase()))
                                                    .map((key) => (
                                                    <TableRow key={key}>
                                                        <TableCell>{formatSubjectName(key)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant={details[key] === "F" ? "destructive" : "default"}>
                                                                {details[key]}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                      <p className="p-4 text-center text-muted-foreground">Results are not available for this semester.</p>  
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                      </Accordion>
                   ) : (
                     <div className="text-center text-muted-foreground py-10">
                        No semester results are available for this student.
                    </div>
                   )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


export default function AdminStudentDetailsPage() {
  return (
    <Suspense fallback={
        <div className="flex justify-center items-center h-full min-h-[50vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    }>
        <StudentDetailsContent />
    </Suspense>
  )
}
