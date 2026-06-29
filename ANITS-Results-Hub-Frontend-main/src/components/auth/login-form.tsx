
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/lib/constants";
import { loginStudent, loginAdmin, loginFaculty } from "@/services/api";

type Role = "student" | "faculty" | "admin";

const studentLoginSchema = z.object({
  rollNo: z.string().min(1, "Roll No is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().refine(val => val !== '--', { message: "Please select a department." }),
});

const facultyLoginSchema = z.object({
  username: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().refine(val => val !== '--', { message: "Please select a department." }),
});

const adminLoginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const getLoginSchema = (role: Role) => {
    switch (role) {
        case "student":
            return studentLoginSchema;
        case "faculty":
            return facultyLoginSchema;
        case "admin":
            return adminLoginSchema;
    }
}


export function LoginForm() {
  const [role, setRole] = useState<Role>("student");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(getLoginSchema(role)),
    defaultValues: {
      rollNo: "",
      username: "",
      email: "",
      password: "",
      department: "--",
    },
  });

  useEffect(() => {
    form.reset({
      rollNo: "",
      username: "",
      email: "",
      password: "",
      department: "--",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleRoleChange = (value: string) => {
    const newRole = value as Role;
    setRole(newRole);
  };

  const onSubmit = async (values: any) => {
    setIsLoading(true);

    localStorage.clear();
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    try {
        let response;
        switch (role) {
          case "student":
            response = await loginStudent({
                roll: values.rollNo,
                email: values.email,
                password: values.password,
                department: values.department,
            });

            localStorage.setItem("studentRollNo", values.rollNo);
            localStorage.setItem("studentDepartment", values.department);
            localStorage.setItem("studentEmail", values.email);
            localStorage.setItem("userRole", "student");
            localStorage.setItem("studentJwtToken", response.jwtToken);

            toast({
              title: "Login Successful",
              description: `Welcome! Redirecting...`,
            });
            router.push("/student/dashboard");
            break;
          case "faculty":
            response = await loginFaculty({
                username: values.username,
                email: values.email,
                password: values.password,
                department: values.department,
            });
            localStorage.setItem("facultyUsername", values.username);
            localStorage.setItem("facultyEmail", values.email);
            localStorage.setItem("facultyDepartment", values.department);
            localStorage.setItem("userRole", "faculty");
            localStorage.setItem("facultyJwtToken", response.jwtToken);

            toast({
              title: "Login Successful",
              description: `Welcome! Redirecting to your dashboard...`,
            });
            router.push("/faculty/dashboard");
            break;
          case "admin":
            response = await loginAdmin({
                username: values.username,
                email: values.email,
                password: values.password,
            });
            localStorage.setItem("adminUsername", values.username);
            localStorage.setItem("adminEmail", values.email);
            localStorage.setItem("userRole", "admin");
            localStorage.setItem("adminJwtToken", response.jwtToken);
             toast({
              title: "Login Successful",
              description: `Welcome! Redirecting to your dashboard...`,
            });
            router.push("/admin/dashboard");
            break;
        }
    } catch (error: any) {
        toast({
            title: "Login Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="student"
        className="w-full"
        onValueChange={handleRoleChange}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
      </Tabs>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {role === "student" && (
            <>
              <FormField
                control={form.control}
                name="rollNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll No</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your Roll No"
                        {...field}
                      />
                    </FormControl>
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
                        {DEPARTMENTS.map(dep => (
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {role === "faculty" && (
            <>
               <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
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
                        {DEPARTMENTS.map(dep => (
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {role === "admin" && (
             <>
               <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log In
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline text-primary hover:text-primary/80">
          Sign up
        </Link>
      </div>
    </div>
  );
}
    