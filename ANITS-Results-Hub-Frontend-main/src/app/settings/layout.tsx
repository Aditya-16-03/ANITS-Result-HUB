
"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect, useState } from "react";

const getNavItems = (role: string | null) => {
    if (role === 'admin') {
        return [
            { href: "/admin/dashboard", label: "Home", icon: "Home" },
            { href: "/admin/upload-results", label: "Upload Results", icon: "Upload" },
            { href: "/admin/upload-student-details", label: "Upload Student Details", icon: "UserPlus" },
            { href: "/admin/faculty-view", label: "Faculty View", icon: "Users" },
        ];
    }
    if (role === 'faculty') {
        return [
            { href: "/faculty/dashboard", label: "Home", icon: "Home" },
            { href: "/faculty/announcements", label: "Announcements", icon: "Megaphone" },
        ];
    }
    if (role === 'student') {
        return [
            { href: "/student/dashboard", label: "Home", icon: "Home" },
        ];
    }
    return [];
}

const getTitle = (role: string | null) => {
    if (role === 'admin') return "Admin Panel";
    if (role === 'faculty') return "Faculty Portal";
    if (role === 'student') return "Student Portal";
    return "Settings";
}


export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Fallback to localStorage on the client side
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);


  const navItems = getNavItems(role);
  const title = getTitle(role);

  return (
    <DashboardLayout navItems={navItems} title={title}>
      {children}
    </DashboardLayout>
  );
}
