
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminProfilePage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const storedUsername = localStorage.getItem("adminUsername");
        const storedEmail = localStorage.getItem("adminEmail");
        if (storedUsername) setUsername(storedUsername);
        if (storedEmail) setEmail(storedEmail);
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
                    <div className="space-y-2">
                        <h3 className="font-semibold">Username</h3>
                        <p className="text-muted-foreground">{username || "admin.user"}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-muted-foreground">{email || "admin.user@anits.edu.in"}</p>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-semibold">Role</h3>
                        <p className="text-muted-foreground">Administrator</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
