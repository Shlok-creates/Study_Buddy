import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Study & Career Buddy | Principal Full-Stack OS",
  description:
    "AI Study & Career Buddy targeting students from Class 6 to 3rd-year Undergraduate across Science, Commerce, Arts, Medical, and Tech streams.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#F9FAFB] dark:bg-[#0A191E] text-slate-900 dark:text-slate-100 antialiased min-h-screen selection:bg-salmon-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
