
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudentListForAdmin } from "@/services/api";

const years = ["A21", "A22", "A23", "A24", "A25"];
const semesters = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const departments = ["CSE", "IT", "ECE", "CSM"];
const sections = ["A", "B", "C", "D"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState("--");
  const [selectedSemester, setSelectedSemester] = useState("--");
  const [selectedDepartment, setSelectedDepartment] = useState("--");
  const [selectedSection, setSelectedSection] = useState("--");
  const [searchTerm, setSearchTerm] = useState("");
  const [allResults, setAllResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRollNo, setSelectedRollNo] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (selectedYear !== '--' && selectedSemester !== '--' && selectedDepartment !== '--') {
        setIsLoading(true);
        setAllResults([]);
        try {
          const response = await getStudentListForAdmin(selectedYear, selectedSemester, selectedDepartment);
          setAllResults(response || []);
        } catch (error) {
          console.error("Failed to fetch student results:", error);
          setAllResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAllResults([]);
      }
    };

    fetchResults();
  }, [selectedYear, selectedSemester, selectedDepartment]);

  const sectionsForDepartment = useMemo(() => {
    return ["--", "All", ...sections];
  }, []);

  const displayedResults = useMemo(() => {
    if (selectedSection === '--') {
        return [];
    }

    let resultsToDisplay = allResults;
    
    if (selectedSection !== "All") {
        resultsToDisplay = allResults.filter(student => 
            student.section.endsWith(selectedSection)
        );
    }
    
    if (searchTerm) {
        return resultsToDisplay.filter(student =>
            student.rollno.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return resultsToDisplay;
  }, [allResults, selectedSection, searchTerm]);
  
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    setSelectedSection("--");
    setSelectedRollNo(null);
  }

  const handleRowClick = (student: any) => {
    setSelectedRollNo(student.rollno);
    router.push(`/admin/student/${student.rollno}?department=${selectedDepartment}`);
  }

  const getCardTitle = () => {
    if (selectedYear === '--' || selectedSemester === '--' || selectedDepartment === '--') {
      return "Results";
    }
    let title = `Results for ${selectedYear} - ${selectedSemester} - ${selectedDepartment}`;
    if (selectedSection !== '--' && selectedSection !== 'All') {
      title += ` - Section ${selectedSection}`;
    } else if (selectedSection === 'All') {
        title += ` - All Sections`;
    }
    return title;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Student Results</h1>
          <p className="text-muted-foreground">
            View student academic performance by filtering options.
          </p>
        </div>
        <div className="flex justify-center items-center gap-6 flex-wrap">
            <div className="grid gap-2">
                <Label htmlFor="year-select">Admission Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year-select" className="w-[180px]">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="--">--</SelectItem>
                        {years.map(year => (
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
                        <SelectItem value="--">--</SelectItem>
                         {semesters.map(sem => (
                            <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="department-select">Department</Label>
                <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                    <SelectTrigger id="department-select" className="w-[180px]">
                        <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="--">--</SelectItem>
                         {departments.map(dep => (
                            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="section-select">Section</Label>
                <Select value={selectedSection} onValueChange={(value) => { setSelectedSection(value); setSelectedRollNo(null); }}>
                    <SelectTrigger id="section-select" className="w-[180px]">
                        <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                         {sectionsForDepartment.map(sec => (
                            <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{getCardTitle()}</CardTitle>
              <CardDescription className="mt-1">
                A list of all students and their SGPA for the selected term. Click a student to view details.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Roll No..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>SGPA</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading">
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : displayedResults.length > 0 ? (
                displayedResults.map((student) => (
                  <TableRow 
                    key={student.rollno} 
                    className={cn(
                        "cursor-pointer",
                        selectedRollNo === student.rollno && "bg-muted hover:bg-muted"
                    )} 
                    onClick={() => handleRowClick(student)}
                  >
                    <TableCell className="font-medium">{student.rollno}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell>{student.sgpa}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-white",
                          student.status.toLowerCase() === "passed"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : "bg-gradient-to-r from-red-500 to-rose-500"
                        )}
                      >
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key="no-results">
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        {selectedYear === '--' || selectedSemester === '--' || selectedDepartment === '--' 
                         ? "Please select admission year, semester, and department to see results."
                         : "No results found for the selected criteria."
                        }
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
