"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { lang, t, setUser } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("authErrorInvalid"));
        setLoading(false);
        return;
      }

      setUser(data.user);
      if (data.user.role === "STUDENT") {
        router.push("/dashboard");
      } else if (data.user.role.includes("EMPLOYER")) {
        router.push("/employer");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-brand-yellow text-brand-yellow dark:text-brand-black font-extrabold flex items-center justify-center text-xl mx-auto shadow-sm">
            SR
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
            {t("loginTitle")}
          </h2>
          <p className="mt-1 text-xs text-brand-onyx dark:text-brand-sage">
            {t("loginSubtitle")}
          </p>
        </div>

        {/* 1-Click Demo Fill */}
        <div className="p-4 rounded-xl bg-brand-cream/80 dark:bg-brand-card border border-brand-sage dark:border-brand-onyx shadow-xs">
          <div className="text-xs font-bold text-brand-black dark:text-brand-cream mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-brand-yellow" />
            <span>{t("quickLoginTitle")}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo("student@skillroute.ai")}
              className="px-2 py-1.5 rounded bg-white dark:bg-brand-onyx hover:bg-brand-sage/40 dark:hover:bg-brand-onyx/80 font-medium text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx transition-colors text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("employer@technext.bd")}
              className="px-2 py-1.5 rounded bg-white dark:bg-brand-onyx hover:bg-brand-sage/40 dark:hover:bg-brand-onyx/80 font-medium text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx transition-colors text-center"
            >
              Employer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin@skillroute.ai")}
              className="px-2 py-1.5 rounded bg-white dark:bg-brand-onyx hover:bg-brand-sage/40 dark:hover:bg-brand-onyx/80 font-medium text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx transition-colors text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-black dark:text-brand-cream mb-1">
              {t("emailLabel")}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-onyx/60 dark:text-brand-sage/60 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-card border border-brand-sage/80 dark:border-brand-onyx text-brand-black dark:text-brand-cream focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-black dark:text-brand-cream mb-1">
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-onyx/60 dark:text-brand-sage/60 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-card border border-brand-sage/80 dark:border-brand-onyx text-brand-black dark:text-brand-cream focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 transition-all shadow-xs disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : t("btnSignIn")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-brand-onyx dark:text-brand-sage">
          <span>{lang === "bn" ? "অ্যাকাউন্ট নেই? " : "Don't have an account? "}</span>
          <Link href="/register" className="font-bold text-amber-600 dark:text-brand-yellow hover:underline">
            {t("navRegister")}
          </Link>
        </div>
      </div>
    </div>
  );
}
