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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadResultsPdf } from "@/services/api";

const fileUploadSchema = z.object({
  resultsFile: z
    .any()
    .refine((files) => files?.[0], "File is required.")
    .refine(
      (files) => files?.[0]?.type === "application/pdf",
      "Only .pdf files are accepted."
    ),
});

type FormValues = z.infer<typeof fileUploadSchema>;

export function FileUploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      resultsFile: undefined,
    },
  });

  const selectedFile = form.watch("resultsFile")?.[0];

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const file = values.resultsFile[0];
      const result = await uploadResultsPdf(file);

      const tablesInfo = result?.tables
        ? result.tables.map((t: any) => `${t.tableName} (${t.rowCount})`).join(", ")
        : "";

      toast({
        title: "Upload Successful!",
        description: result?.totalRows != null
          ? `Stored ${result.totalRows} result rows. ${tablesInfo}`
          : "Results uploaded successfully.",
      });

      form.reset({ resultsFile: undefined });
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
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.resetField("resultsFile");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results Upload</CardTitle>
        <CardDescription>
          Upload the results PDF. The admission year, semester, department and
          subjects are read automatically from the file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resultsFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Results File (PDF)</FormLabel>
                  <div
                    className={cn(
                      "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80 transition-colors",
                      form.getFieldState("resultsFile").error && "border-destructive"
                    )}
                    onClick={handleFileAreaClick}
                  >
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,application/pdf"
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
                          <X className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove file</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <UploadCloud className="w-12 h-12" />
                        <p className="mt-2 text-sm">
                          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs">PDF files only (.pdf)</p>
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
              Upload Results PDF
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
