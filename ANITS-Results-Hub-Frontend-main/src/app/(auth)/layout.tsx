export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-fade-in">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
