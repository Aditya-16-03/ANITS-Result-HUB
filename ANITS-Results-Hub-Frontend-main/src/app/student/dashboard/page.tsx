
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { getStudentResults } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface SemesterResult {
  sgpa: string;
  cgpa: string;
  [key: string]: any; // for subject grades
}

interface Results {
  [semester: string]: SemesterResult | null;
}

const checkHasFGrade = (result: SemesterResult | null): boolean => {
    if (!result) return false;
    for (const key in result) {
        if (key !== 'sgpa' && key !== 'cgpa' && key !== 'rollno' && key !== 'section') {
            if (result[key] === 'F') {
                return true;
            }
        }
    }
    return false;
}

export default function StudentDashboardPage() {
  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      const rollNo = localStorage.getItem("studentRollNo");
      const department = localStorage.getItem("studentDepartment");

      if (rollNo && department) {
        try {
          const data = await getStudentResults(rollNo, department);
          setStudentData(data);
          localStorage.setItem("studentData", JSON.stringify(data));
          localStorage.setItem("studentName", data.name);
          localStorage.setItem("studentSection", data.section);
        } catch (error: any) {
          toast({
            title: "Failed to Fetch Data",
            description: error.message || "Could not load student results. Please try again later.",
            variant: "destructive",
          });
        }
      }
      setIsLoading(false);
    };

    fetchStudentData();
  }, [toast]);

  const semesterData = useMemo(() => {
    if (!studentData?.results) return [];
    
    return Object.entries(studentData.results).map(([semester, result]: [string, any]) => {
      if (result) {
        const hasFGrade = checkHasFGrade(result);
        return {
          semester,
          sgpa: result.sgpa || "--",
          status: hasFGrade ? "fail" : "pass",
        };
      } else {
        return {
          semester,
          sgpa: "--",
          status: "pending",
        };
      }
    }).sort((a,b) => a.semester.localeCompare(b.semester)); // Ensure semesters are sorted
  }, [studentData]);


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full min-h-[60vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-in-from-bottom">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {studentData?.name || "Student"}!</h1>
        <p className="text-muted-foreground">
          Here are your results for all semesters. Click on a card to view details.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {semesterData.length > 0 ? semesterData.map((sem, index) => (
          <Link href={`/student/results/${sem.semester}`} key={sem.semester}>
            <Card
              style={{ animationDelay: `${index * 100}ms` }}
              className={cn(
                "hover:shadow-lg transition-all duration-200 h-full flex flex-col group animate-slide-in-from-bottom",
                sem.status === "pass" &&
                  "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/50 dark:to-emerald-950/50 hover:border-green-500",
                sem.status === "fail" &&
                  "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/50 dark:to-rose-950/50 hover:border-red-500",
                sem.status === "pending" && "hover:border-primary/50"
              )}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{sem.semester} Semester</CardTitle>
                    <CardDescription
                      className={cn(
                        sem.status === "pass" && "text-green-800 dark:text-green-300",
                        sem.status === "fail" && "text-red-800 dark:text-red-300"
                      )}
                    >
                      View your results
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">SGPA</p>
                    <p
                      className={cn(
                        "text-3xl font-bold",
                        sem.status === "pass" && "text-green-600 dark:text-green-400",
                        sem.status === "fail" && "text-red-600 dark:text-red-400",
                        sem.status === "pending" && "text-primary"
                      )}
                    >
                      {sem.sgpa}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex items-end justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {sem.status === "pass" && (
                    <>
                      <CircleCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-300">Passed</span>
                    </>
                  )}
                  {sem.status === "fail" && (
                    <>
                      <CircleAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                       <span className="font-medium text-red-700 dark:text-red-300">Failed</span>
                    </>
                  )}
                   {sem.status === "pending" && (
                    <span>Results pending</span>
                  )}
                </div>
                <ArrowRight className="h-5 w-5 text-primary/50 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        )) : (
             <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                <CardContent className="p-10 text-center text-muted-foreground">
                    <p>No results found for this student.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
