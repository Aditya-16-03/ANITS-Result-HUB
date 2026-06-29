
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
import { getSpecificStudentPerformance } from "@/services/api";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

const academicYears = ["--", "A21", "A22", "A23", "A24", "A25"];
const semesters = ["--", "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const departments = ["--", "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CSM"];

const processDataForVerticalTable = (data: any[] | null, selectedSection: string) => {
  if (!data || data.length === 0) {
    return { headers: [], rows: [] };
  }

  const filteredBySection = selectedSection === 'All'
    ? data
    : data.filter(d => d.section && d.section.endsWith(selectedSection));

  if (filteredBySection.length === 0) {
      return { headers: [], rows: [] };
  }

  const uniqueSections = [...new Set(filteredBySection.map(d => d.section).filter(Boolean))];
  const metrics: { [key: string]: { [section: string]: string } } = {};

  const allKeys = new Set<string>();
  filteredBySection.forEach(sectionData => {
    Object.keys(sectionData).forEach(key => {
      // Exclude 'section' and 'email' keys from being displayed as metrics
      if (key.toLowerCase() !== 'section' && key.toLowerCase() !== 'email') {
        allKeys.add(key);
      }
    });
  });

  const sortedKeys = Array.from(allKeys).sort();

  const subjectMetrics: string[] = [];
  const otherMetrics: string[] = [];
  const processedSubjects = new Set<string>();

  sortedKeys.forEach(key => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.endsWith('_pass') || lowerKey.endsWith('_fail')) {
      const subjectName = key.replace(/_pass|_fail/i, '');
      if (!processedSubjects.has(subjectName.toLowerCase())) {
        subjectMetrics.push(subjectName);
        processedSubjects.add(subjectName.toLowerCase());
      }
    } else {
      otherMetrics.push(key);
    }
  });

  const formattedSubjectNames = subjectMetrics.map(s => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
  const finalMetricOrder = [...formattedSubjectNames.sort(), ...otherMetrics.sort()];
  
  finalMetricOrder.forEach(metricName => {
    metrics[metricName] = {};
  });

  filteredBySection.forEach(sectionData => {
    const sectionName = sectionData.section;
    if (!sectionName) return;
    
    processedSubjects.forEach(subjectKey => {
       const passKey = Object.keys(sectionData).find(k => k.toLowerCase() === `${subjectKey.toLowerCase()}_pass`);
       const failKey = Object.keys(sectionData).find(k => k.toLowerCase() === `${subjectKey.toLowerCase()}_fail`);
       const passCount = passKey ? sectionData[passKey] : null;
       const failCount = failKey ? sectionData[failKey] : null;
       const formattedName = subjectKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
       
       let displayValue = '--';
       if (passCount !== null && failCount !== null) {
           displayValue = `${passCount} / ${failCount}`;
       } else if (passCount !== null) {
           displayValue = `${passCount}`;
       } else if (failCount !== null) {
           displayValue = `${failCount}`;
       }

       if (metrics[formattedName]) {
          metrics[formattedName][sectionName] = displayValue;
       }
    });

    otherMetrics.forEach(metricKey => {
      if (metrics[metricKey]) {
        metrics[metricKey][sectionName] = sectionData[metricKey] ?? '--';
      }
    });
  });

  return {
    headers: ["Metric", ...uniqueSections],
    rows: finalMetricOrder.map(metric => ({
      metric,
      ...metrics[metric]
    }))
  };
};

export default function FacultyDashboardPage() {
  const [selectedBatch, setSelectedBatch] = useState("--");
  const [selectedSemester, setSelectedSemester] = useState("--");
  const [selectedDepartment, setSelectedDepartment] = useState("--");
  const [selectedSection, setSelectedSection] = useState("All");
  const [performanceData, setPerformanceData] = useState<any[] | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facultyName, setFacultyName] = useState("Faculty");
  const [facultyEmail, setFacultyEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("facultyUsername");
    const storedEmail = localStorage.getItem("facultyEmail");
    if (storedUsername) {
      setFacultyName(storedUsername);
    }
    if (storedEmail) {
        setFacultyEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (selectedBatch !== '--' && selectedSemester !== '--' && selectedDepartment !== '--' && facultyEmail) {
        setIsLoading(true);
        setError(null);
        setPerformanceData(undefined);
        try {
          const data = await getSpecificStudentPerformance(selectedBatch, selectedDepartment, selectedSemester, facultyEmail);
          setPerformanceData(data);
          setSelectedSection("All");
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 500) {
                setPerformanceData(null);
                setError(null); 
            } else {
                setError(err.message || "Failed to fetch performance data.");
            }
        } finally {
          setIsLoading(false);
        }
      } else {
        setPerformanceData(undefined);
      }
    };
    fetchPerformanceData();
  }, [selectedBatch, selectedSemester, selectedDepartment, facultyEmail]);

  const { headers, rows } = useMemo(() => processDataForVerticalTable(performanceData, selectedSection), [performanceData, selectedSection]);
  
  const hasFilters = selectedBatch !== '--' && selectedSemester !== '--' && selectedDepartment !== '--';

  const availableSections = useMemo(() => {
    if (!performanceData) return ["All"];
    // Extract last character of section and filter out empty strings
    const sections = new Set(performanceData.map(d => d.section ? d.section.slice(-1) : '').filter(Boolean));
    return ["All", ...Array.from(sections).sort()];
  }, [performanceData]);

  return (
    <div className="space-y-8 animate-slide-in-from-bottom">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {facultyName}!</h1>
        <p className="text-muted-foreground">
          View student subject performance by applying filters.
        </p>
      </div>

      <div className="flex justify-center items-center gap-6 flex-wrap">
          <div className="grid gap-2">
              <Label htmlFor="year-select">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger id="year-select" className="w-[180px]">
                      <SelectValue placeholder="Select Batch" />
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
      ) : performanceData && rows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Section Data</CardTitle>
            <CardDescription>A breakdown of performance metrics for each section.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    {headers.map(header => (
                        <TableHead key={header}>{header}</TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                    <TableRow
                        key={row.metric}
                        className={cn(
                        (row.metric.toLowerCase().includes('pass percentage') || row.metric.toLowerCase().includes('total students')) &&
                            "font-bold bg-yellow-200 dark:bg-yellow-800/30 hover:bg-yellow-300 dark:hover:bg-yellow-800/40"
                        )}
                    >
                        <TableCell className="font-medium">{row.metric}</TableCell>
                        {headers.slice(1).map(sectionName => (
                            <TableCell key={sectionName}>{row[sectionName] ?? '--'}</TableCell>
                        ))}
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
                  {hasFilters && (performanceData === null || rows.length === 0)
                    ? "Data Not Found"
                    : "Please select batch, semester, and department to view student performance data."
                  }
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
