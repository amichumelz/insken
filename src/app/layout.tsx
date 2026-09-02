import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "INSKEN · ASEAN MSME A.I. Skills Training — Operations & Intelligence",
  description:
    "Operations & Data Intelligence Agent for the ASEAN MSME A.I. Skills Training Program. End-to-end participant validation, regional capacity routing, attendance tracking, and executive reporting for 5,000 MSMEs across five regions.",
  keywords: [
    "INSKEN",
    "ASEAN",
    "MSME",
    "A.I. Training",
    "Operations Dashboard",
    "Capacity Routing",
    "Executive Intelligence",
  ],
  authors: [{ name: "INSKEN Operations" }],
  openGraph: {
    title: "INSKEN · ASEAN MSME A.I. Skills Training — Operations & Intelligence",
    description:
      "Autonomous operations agent managing 5,000 MSME participants across KL, Johor, Penang, Sabah, and Sarawak.",
    siteName: "INSKEN Operations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen overflow-x-hidden`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
