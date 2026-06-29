
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
import { uploadStudentDetailsFile } from "@/services/api";

const years = ["A21", "A22", "A23", "A24"];
const departments = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CSM"];

const fileUploadSchema = z.object({
  year: z.string().refine(val => val !== '--', { message: "Please select an admission year." }),
  department: z.string().refine(val => val !== '--', { message: "Please select a department." }),
  studentDetailsFile: z
    .any()
    .refine((files) => files?.[0], "File is required.")
    .refine(
      (files) => files?.[0]?.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Only .xlsx files are accepted."
    ),
});

type FormValues = z.infer<typeof fileUploadSchema>;

export function StudentDetailsUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      year: '--',
      department: '--',
      studentDetailsFile: undefined
    }
  });

  const selectedFile = form.watch("studentDetailsFile")?.[0];

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const file = values.studentDetailsFile[0];
      await uploadStudentDetailsFile(file, values.year, values.department);
      
      toast({
        title: "Upload Successful!",
        description: `Student details for admission year ${values.year} (${values.department}) have been uploaded.`,
      });
      
      form.reset({
        year: '--',
        department: '--',
        studentDetailsFile: undefined,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
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
    form.resetField("studentDetailsFile");
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Details Upload</CardTitle>
        <CardDescription>
          Select the admission year, department, and the student details file (.xlsx).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
               <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="--">--</SelectItem>
                        {years.map(year => (
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
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
            </div>
            
            <FormField
              control={form.control}
              name="studentDetailsFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Details File</FormLabel>
                   <div 
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 transition-colors",
                      form.getFieldState('studentDetailsFile').error && "border-destructive"
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
