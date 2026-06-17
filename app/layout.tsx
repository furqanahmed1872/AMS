import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academy Management System",
  description: "Manage students, attendance, fees, and tests for private academies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
