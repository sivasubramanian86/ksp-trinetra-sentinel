import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KSP Trinetra Sentinel | Law Enforcement Command Center",
  description: "Multi-Layer City Brain for Karnataka State Police (KSP Datathon 2026)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0f1d] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
