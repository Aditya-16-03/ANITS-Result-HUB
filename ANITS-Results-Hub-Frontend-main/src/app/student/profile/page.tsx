
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function StudentProfilePage() {
    const [rollNo, setRollNo] = useState("");
    const [email, setEmail] = useState("");
    const [studentName, setStudentName] = useState("");
    const [section, setSection] = useState("");
    const [department, setDepartment] = useState("");


    useEffect(() => {
        const storedRollNo = localStorage.getItem("studentRollNo");
        const storedEmail = localStorage.getItem("studentEmail");
        const storedName = localStorage.getItem("studentName");
        const storedSection = localStorage.getItem("studentSection");
        const storedDepartment = localStorage.getItem("studentDepartment");

        if (storedRollNo) setRollNo(storedRollNo);
        if (storedEmail) setEmail(storedEmail);
        if(storedName) setStudentName(storedName);
        if(storedSection) setSection(storedSection);
        if(storedDepartment) setDepartment(storedDepartment);

    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">View your account details.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your personal and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold">{studentName || "Student Name"}</h2>
                        <p className="text-muted-foreground">{rollNo || "321126510001"}</p>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold">Email</h3>
                            <p className="text-muted-foreground">{email || "student@anits.edu.in"}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Department</h3>
                            <p className="text-muted-foreground">{department || "Not Available"}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold">Section</h3>
                            <p className="text-muted-foreground">{section || "Not Available"}</p>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
    )
}
