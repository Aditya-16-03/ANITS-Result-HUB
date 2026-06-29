
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
  FormDescription,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { DEPARTMENTS } from "@/lib/constants";
import { signupStudent, signupFaculty } from "@/services/api";

type Role = "student" | "faculty";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const baseRegisterSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  });

const studentRegisterSchema = baseRegisterSchema.extend({
  rollNo: z.string().min(1, "Roll No is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().refine(val => val !== '--', { message: "Please select a department." }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const staffRegisterSchema = baseRegisterSchema.extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    department: z.string().refine(val => val !== '--', { message: "Please select a department." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(data => {
    if (data.department === '--' || !data.email) return true;
    const expectedEnding = `${data.department.toLowerCase()}@anits.edu.in`;
    return data.email.toLowerCase().endsWith(expectedEnding);
}, {
    message: "Invalid email for the selected department.",
    path: ["email"],
});


const getValidationSchema = (role: Role) => {
    return role === 'student' ? studentRegisterSchema : staffRegisterSchema;
}

export function RegisterForm() {
  const [role, setRole] = useState<Role>("student");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(getValidationSchema(role)),
    mode: "onChange",
    defaultValues: {
      rollNo: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      department: "--",
    },
  });

  useEffect(() => {
    form.reset({
      rollNo: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      department: "--"
    });
    form.trigger();
  }, [role, form]);

  const onSubmit = async (values: z.infer<typeof studentRegisterSchema | typeof staffRegisterSchema>) => {
    setIsLoading(true);

    try {
        if (role === 'student') {
            const studentValues = values as z.infer<typeof studentRegisterSchema>;
            const response = await signupStudent({
                email: studentValues.email,
                roll: studentValues.rollNo,
                password: studentValues.password,
                department: studentValues.department,
            });
            
            localStorage.setItem("studentJwtToken", response.jwtToken);
            localStorage.setItem("userRole", response.typeOfUser);
            localStorage.setItem("studentRollNo", studentValues.rollNo);
            localStorage.setItem("studentEmail", studentValues.email);
            localStorage.setItem("studentDepartment", studentValues.department);

        } else {
            const facultyValues = values as z.infer<typeof staffRegisterSchema>;
            await signupFaculty({
                email: facultyValues.email,
                username: facultyValues.username,
                password: facultyValues.password,
                department: facultyValues.department,
            });
        }
        
        toast({
            title: "Registration Successful",
            description: "Your account has been created. Redirecting to login...",
        });

        router.push("/login");

    } catch (error: any) {
        toast({
            title: "Registration Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };
  

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="student"
        className="w-full"
        onValueChange={(v) => {
            const newRole = v as Role;
            setRole(newRole);
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
        </TabsList>
      </Tabs>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {role === "student" ? (
             <>
                <FormField
                control={form.control}
                name="rollNo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Roll No</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter your Roll No" {...field} />
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
            </>
          ) : (
            <>
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
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
            </>
          )}

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormDescription>
                  Use 8 or more characters with a mix of letters, numbers & symbols.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retype Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline text-primary hover:text-primary/80">
          Sign in
        </Link>
      </div>
    </div>
  );
}
