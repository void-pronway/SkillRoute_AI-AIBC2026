"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  Sun, 
  Moon, 
  Globe, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Compass, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  Layers 
} from "lucide-react";

export function Navbar() {
  const { lang, toggleLang, theme, toggleTheme, user, setUser, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch {
      setUser(null);
    }
  };

  // Role-based navigation filtering:
  // - Students NEVER see Employer Portal or Admin
  // - Employers see Employer Portal and Mission Arena
  // - Admins see all portals
  // - Logged-out visitors see public discovery links
  const navLinks: { href: string; label: string; icon: any }[] = [
    { href: "/", label: t("navHome"), icon: Compass },
  ];

  if (!user || user.role === "STUDENT") {
    navLinks.push({ href: "/dashboard", label: t("navStudentPortal"), icon: Layers });
    navLinks.push({ href: "/missions", label: t("navMissions"), icon: Award });
    navLinks.push({ href: "/skillproof", label: t("navSkillProof"), icon: ShieldCheck });
  }

  if (user && (user.role === "EMPLOYER_OWNER" || user.role === "EMPLOYER_RECRUITER")) {
    navLinks.push({ href: "/employer", label: t("navEmployer"), icon: Briefcase });
    navLinks.push({ href: "/missions", label: t("navMissions"), icon: Award });
  }

  if (user && (user.role === "PLATFORM_ADMIN" || user.role === "ASSESSMENT_REVIEWER")) {
    navLinks.push({ href: "/dashboard", label: t("navStudentPortal"), icon: Layers });
    navLinks.push({ href: "/missions", label: t("navMissions"), icon: Award });
    navLinks.push({ href: "/skillproof", label: t("navSkillProof"), icon: ShieldCheck });
    navLinks.push({ href: "/employer", label: t("navEmployer"), icon: Briefcase });
    navLinks.push({ href: "/admin", label: t("navAdmin"), icon: ShieldCheck });
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  return (
    <header className="no-print sticky top-0 z-50 bg-brand-cream/90 dark:bg-brand-black/95 backdrop-blur-md border-b border-brand-sage/40 dark:border-brand-onyx transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-brand-black dark:bg-brand-yellow text-brand-yellow dark:text-brand-black font-bold shadow-xs transition-transform group-hover:scale-105">
              <span className="text-lg">SR</span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-brand-black dark:text-brand-cream block leading-tight">
                SkillRoute <span className="text-amber-500 dark:text-brand-yellow">AI</span>
              </span>
              <span className="text-[10px] font-medium text-brand-onyx dark:text-brand-sage tracking-wider uppercase block">
                {lang === "bn" ? "শিক্ষা থেকে কর্মসংস্থান" : "Workforce Readiness"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black shadow-xs font-semibold"
                      : "text-brand-onyx dark:text-brand-cream hover:bg-brand-sage/50 dark:hover:bg-brand-onyx/80"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Language Toggle Pill */}
            <button
              onClick={toggleLang}
              aria-label="Toggle language"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-sage/50 dark:bg-brand-onyx hover:bg-brand-sage dark:hover:bg-brand-onyx/80 text-brand-black dark:text-brand-cream transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "English" : "বাংলা"}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg text-brand-onyx dark:text-brand-cream hover:bg-brand-sage/50 dark:hover:bg-brand-onyx/80 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Session Status */}
            {user ? (
              <div className="flex items-center pl-2 space-x-2 border-l border-brand-sage/60 dark:border-brand-onyx">
                <Link
                  href={user.role === "STUDENT" ? "/dashboard" : user.role.includes("EMPLOYER") ? "/employer" : "/admin"}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-brand-onyx text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx shadow-xs hover:border-brand-yellow transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-yellow" />
                  <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-sage/60 dark:bg-brand-black text-brand-black dark:text-brand-yellow uppercase tracking-wider">
                    {user.role === "STUDENT" ? "Student" : user.role.includes("EMPLOYER") ? "Employer" : "Admin"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title={t("navLogout")}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-brand-sage/60 dark:border-brand-onyx">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-black dark:text-brand-cream hover:bg-brand-sage/40 dark:hover:bg-brand-onyx transition-colors"
                >
                  {t("navLogin")}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-yellow text-brand-black hover:bg-amber-400 shadow-xs transition-all"
                >
                  {t("navRegister")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={toggleLang}
              className="px-2 py-1 rounded text-xs font-semibold bg-brand-sage/50 dark:bg-brand-onyx text-brand-black dark:text-brand-cream"
            >
              {lang === "bn" ? "EN" : "বাং"}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-brand-black dark:text-brand-cream hover:bg-brand-sage/50 dark:hover:bg-brand-onyx"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-2 pb-4 space-y-1 bg-brand-cream dark:bg-brand-black border-t border-brand-sage/50 dark:border-brand-onyx animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black font-semibold"
                    : "text-brand-onyx dark:text-brand-cream hover:bg-brand-sage/40 dark:hover:bg-brand-onyx"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-brand-onyx dark:text-brand-cream"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4" />}
              <span>{theme === "dark" ? t("themeToggleLight") : t("themeToggleDark")}</span>
            </button>
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
              >
                <LogOut className="w-4 h-4" />
                <span>{t("navLogout")}</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-brand-black dark:text-brand-cream"
                >
                  {t("navLogin")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded bg-brand-yellow text-brand-black text-xs font-bold"
                >
                  {t("navRegister")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
