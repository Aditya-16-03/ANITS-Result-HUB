
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
import { getFacultyPerformance } from "@/services/api";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const academicYears = ["--", "A21", "A22", "A23", "A24", "A25"];
const semesters = ["--", "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
const departments = ["--", "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CSM"];

const processDataForVerticalTable = (data: any[] | null) => {
  if (!data || data.length === 0) {
    return { headers: [], rows: [] };
  }

  const uniqueSections = [...new Set(data.map(d => d.section).filter(Boolean))];
  const metrics: { [key: string]: { [section: string]: string } } = {};

  const allKeys = new Set<string>();
  data.forEach(sectionData => {
    Object.keys(sectionData).forEach(key => {
      if (key !== 'section') {
        allKeys.add(key);
      }
    });
  });

  const sortedKeys = Array.from(allKeys).sort();

  const subjectMetrics: string[] = [];
  const otherMetrics: string[] = [];
  const highlightedMetrics: string[] = [];

  const processedSubjects = new Set<string>();

  sortedKeys.forEach(key => {
    const lowerKey = key.toLowerCase();
     if (lowerKey === 'total students' || lowerKey === 'pass percentage') {
      highlightedMetrics.push(key);
    } else if (lowerKey.endsWith('_pass') || lowerKey.endsWith('_fail')) {
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
  
  // Custom sort for other metrics to ensure "Total Students" and "Pass Percentage" are handled by highlightedMetrics
  const regularMetrics = otherMetrics.filter(m => !highlightedMetrics.find(h => h.toLowerCase() === m.toLowerCase())).sort();

  // Final order of metrics
  const finalMetricOrder = [...formattedSubjectNames.sort(), ...regularMetrics, ...highlightedMetrics.sort()];
  
  finalMetricOrder.forEach(metricName => {
    metrics[metricName] = {};
  });

  data.forEach(sectionData => {
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

    [...regularMetrics, ...highlightedMetrics].forEach(metricKey => {
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

export default function AdminFacultyViewPage() {
  const [selectedBatch, setSelectedBatch] = useState("--");
  const [selectedSemester, setSelectedSemester] = useState("--");
  const [selectedDepartment, setSelectedDepartment] = useState("--");
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
          const data = await getFacultyPerformance(selectedBatch, selectedSemester, selectedDepartment);
          setPerformanceData(data); // Can be null or an array
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

  const { headers, rows } = useMemo(() => processDataForVerticalTable(performanceData), [performanceData]);
  
  const hasFilters = selectedBatch !== '--' && selectedSemester !== '--' && selectedDepartment !== '--';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Student Performance View</h1>
        <p className="text-muted-foreground">
          View student subject performance by applying filters.
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
                            (row.metric.toLowerCase() === 'total students' || row.metric.toLowerCase() === 'pass percentage') &&
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
                  {hasFilters && performanceData === null 
                    ? "Data not available for the selected criteria."
                    : "Please select all filters to view student performance data."
                  }
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
