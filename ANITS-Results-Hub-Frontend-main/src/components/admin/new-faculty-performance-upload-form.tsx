
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadNewFacultyPerformanceFile } from "@/services/api";

const departments = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CSM"];
const academicYears = ["A21", "A22", "A23", "A24", "A25"];
const semesters = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];

const fileUploadSchema = z.object({
  branch: z.string().refine(val => val !== '--', { message: "Please select a branch." }),
  batch: z.string().refine(val => val !== '--', { message: "Please select a batch." }),
  semester: z.string().refine(val => val !== '--', { message: "Please select a semester." }),
  facultyPerformanceFile: z
    .any()
    .refine((files) => files?.[0], "File is required.")
    .refine(
      (files) => files?.[0]?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Only .xlsx files are accepted."
    ),
});

type FormValues = z.infer<typeof fileUploadSchema>;

export function NewFacultyPerformanceUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      branch: '--',
      batch: '--',
      semester: '--',
      facultyPerformanceFile: undefined
    }
  });

  const selectedFile = form.watch("facultyPerformanceFile")?.[0];

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
        const file = values.facultyPerformanceFile[0];
        await uploadNewFacultyPerformanceFile(file, values.batch, values.branch, values.semester);

        toast({
            title: "Upload Successful!",
            description: `Faculty performance details for ${values.batch} ${values.branch} (${values.semester}) have been uploaded.`,
        });
        
        form.reset({
            batch: '--',
            branch: '--',
            semester: '--',
            facultyPerformanceFile: undefined
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    } catch (error: any) {
        toast({
            title: "Upload Failed",
            description: error.message || "An unexpected error occurred during the file upload.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleFileAreaClick = () => {
    fileInputRef.current?.click();
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.resetField("facultyPerformanceFile");
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faculty Performance Details Upload</CardTitle>
        <CardDescription>
          Select the branch, batch, semester, and the faculty performance file (.xlsx).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="--">--</SelectItem>
                        {departments.map(dep => (
                            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="--">--</SelectItem>
                        {academicYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         <SelectItem value="--">--</SelectItem>
                        {semesters.map(sem => (
                            <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="facultyPerformanceFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Performance File</FormLabel>
                   <div 
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 transition-colors",
                      form.getFieldState('facultyPerformanceFile').error && "border-destructive"
                    )}
                    onClick={handleFileAreaClick}
                  >
                     <FormControl>
                        <Input
                          type="file"
                          accept=".xlsx"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                    {selectedFile ? (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <FileIcon className="w-12 h-12 text-primary" />
                        <p className="mt-2 text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(selectedFile.size / 1024)} KB</p>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/50 hover:bg-destructive/10"
                            onClick={handleRemoveFile}
                        >
                           <X className="h-4 w-4 text-destructive"/>
                           <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <UploadCloud className="w-12 h-12" />
                          <p className="mt-2 text-sm">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs">Excel files only (.xlsx)</p>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              Upload File
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    