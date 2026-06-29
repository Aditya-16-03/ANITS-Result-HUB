
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Results Hub",
  description: "Create an account for the Results Hub",
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Results Hub</h1>
        <p className="text-muted-foreground">Join the portal by creating an account.</p>
      </div>
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Select your role and fill in the details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </>
  );
}
