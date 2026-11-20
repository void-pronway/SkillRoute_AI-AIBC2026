import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SkillRoute AI 2.0 — From Learning to Employability",
  description:
    "AI-Assisted Workforce Development, Skill Assessment, Evidence-Based Credentialing and Talent Recruitment Platform for AIBC 2026.",
  keywords: [
    "SkillRoute AI",
    "AIBC 2026",
    "Daffodil International University",
    "Skill Assessment",
    "Workforce Readiness",
    "Evidence-Based Credentialing",
    "Mission Arena",
    "SkillProof",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="bg-brand-cream text-brand-black dark:bg-brand-darkBg dark:text-brand-cream min-h-screen flex flex-col transition-colors selection:bg-brand-yellow selection:text-brand-black">
        <AppProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
