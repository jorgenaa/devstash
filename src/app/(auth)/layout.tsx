import Navbar from "@/components/homepage/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-14">
        {children}
      </div>
    </>
  );
}
