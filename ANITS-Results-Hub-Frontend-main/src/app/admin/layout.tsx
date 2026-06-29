import { DashboardLayout } from "@/components/layout/dashboard-layout";

const navItems = [
  { href: "/admin/dashboard", label: "Home", icon: "Home" },
  { href: "/admin/upload-results", label: "Upload Results", icon: "Upload" },
  { href: "/admin/upload-supplementary-results", label: "Upload Supplementary", icon: "FileText" },
  { href: "/admin/upload-student-details", label: "Upload Student Details", icon: "UserPlus" },
  { href: "/admin/upload-faculty-details", label: "Upload Faculty Details", icon: "UserPlus" },
  { 
    label: "Student", 
    icon: "GraduationCap",
    items: [
      { href: "/admin/upload-student-performance", label: "Upload Student Performance", icon: "Upload" },
      { href: "/admin/student-performance-view", label: "Student Performance View", icon: "Users" },
    ]
  },
  {
    label: "Faculty",
    icon: "Briefcase",
    items: [
      { href: "/admin/upload-faculty-performance", label: "Upload Faculty Performance", icon: "Upload" },
      { href: "/admin/faculty-performance-view", label: "Faculty Performance View", icon: "Users" },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout navItems={navItems} title="Admin Panel">
      {children}
    </DashboardLayout>
  );
}
