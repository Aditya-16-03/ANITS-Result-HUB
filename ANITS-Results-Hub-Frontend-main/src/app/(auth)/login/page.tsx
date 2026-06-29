
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Results Hub",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Results Hub</h1>
        <p className="text-muted-foreground">Welcome back! Please login to your account.</p>
      </div>
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Select your role and enter your credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </>
  );
}
