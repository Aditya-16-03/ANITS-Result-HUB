
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { getStudentPerformanceForFacultyView } from "@/services/api";
import { AlertTriangle, Loader2 } from "lucide-react";

const academicYears = ["--", "A21", "A22", "A23", "A24", "A25"];
const semesters = ["--", "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const departments = ["--", "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CSM"];


export default function FacultyPerformanceViewPage() {
  const [selectedBatch, setSelectedBatch] = useState("--");
  const [selectedSemester, setSelectedSemester] = useState("--");
  const [selectedDepartment, setSelectedDepartment] = useState("--");
  const [selectedSection, setSelectedSection] = useState("All");
  const [performanceData, setPerformanceData] = useState<any[] | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (selectedBatch !== '--' && selectedSemester !== '--' && selectedDepartment !== '--') {
        setIsLoading(true);
        setError(null);
        setPerformanceData(undefined);
        try {
          const data = await getStudentPerformanceForFacultyView(selectedBatch, selectedSemester, selectedDepartment);
          setPerformanceData(data);
          setSelectedSection("All");
        } catch (err: any) {
          setError(err.message || "Failed to fetch performance data.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setPerformanceData(undefined);
      }
    };
    fetchPerformanceData();
  }, [selectedBatch, selectedSemester, selectedDepartment]);

  const availableSections = useMemo(() => {
    if (!performanceData) return ["All"];
    // Filter out null/undefined/empty sections to prevent SelectItem errors
    const sections = new Set(performanceData.map(item => item.section).filter(Boolean));
    return ["All", ...Array.from(sections).sort()];
  }, [performanceData]);

  const filteredData = useMemo(() => {
    if (!performanceData) return [];
    if (selectedSection === "All") return performanceData;
    return performanceData.filter(item => item.section === selectedSection);
  }, [performanceData, selectedSection]);

  const hasFilters = selectedBatch !== '--' && selectedSemester !== '--' && selectedDepartment !== '--';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Faculty Performance View</h1>
        <p className="text-muted-foreground">
          View faculty performance by applying filters.
        </p>
      </div>
      <div className="flex justify-center items-center gap-6 flex-wrap">
          <div className="grid gap-2">
              <Label htmlFor="year-select">Academic Year</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger id="year-select" className="w-[180px]">
                      <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                      {academicYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="semester-select">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger id="semester-select" className="w-[180px]">
                      <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                        {semesters.map(sem => (
                          <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="department-select">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department-select" className="w-[180px]">
                      <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                        {departments.map(dep => (
                          <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="section-select">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!performanceData}>
                  <SelectTrigger id="section-select" className="w-[180px]">
                      <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                      {availableSections.map(sec => (
                          <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
      </div>
      
       {isLoading ? (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
            <CardContent className="p-10 text-center text-destructive flex flex-col items-center gap-4">
                <AlertTriangle className="h-8 w-8" />
                <p className="font-semibold">Error loading data</p>
                <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
        </Card>
      ) : performanceData && performanceData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Performance Data</CardTitle>
            <CardDescription>A detailed breakdown of performance for each subject and faculty member.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Section</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Faculty Name</TableHead>
                          <TableHead>Total Students</TableHead>
                          <TableHead>Passed Students</TableHead>
                          <TableHead>Pass Percentage</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredData.map((row, index) => (
                      <TableRow key={index}>
                          <TableCell>{row.section}</TableCell>
                          <TableCell>{row.subject_name}</TableCell>
                          <TableCell>{row.faculty_name}</TableCell>
                          <TableCell>{row.total_students}</TableCell>
                          <TableCell>{row.passed_students}</TableCell>
                          <TableCell>{row.pass_percentage}</TableCell>
                      </TableRow>
                      ))}
                  </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
                <p>
                  {hasFilters && (performanceData === null || performanceData?.length === 0)
                    ? "Data not available for the selected criteria."
                    : "Please select all filters to view faculty performance data."
                  }
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
