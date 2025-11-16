import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import AdminNavbar from "../admin/navbar/navbar";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: "Ditvi Play School",
  description: "Best Play School in Your City",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Admin Navbar - Shows on /admin/* (except /admin/login, /admin/register) */}
        <AdminNavbar />
        
        {/* Public Navbar - Shows on non-admin pages */}
        <Navbar />
        
        {children}
        
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}