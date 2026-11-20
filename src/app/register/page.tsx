"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { User, Mail, Lock, School, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { lang, t, setUser } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [university, setUniversity] = useState("Daffodil International University");
  const [department, setDepartment] = useState("Computer Science and Engineering");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          university: role === "STUDENT" ? university : undefined,
          department: role === "STUDENT" ? department : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setUser(data.user);
      if (role === "STUDENT") {
        router.push("/dashboard");
      } else {
        router.push("/employer");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-black dark:bg-brand-yellow text-brand-yellow dark:text-brand-black font-extrabold flex items-center justify-center text-xl mx-auto shadow-sm">
            SR
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
            {t("registerTitle")}
          </h2>
          <p className="mt-1 text-xs text-brand-onyx dark:text-brand-sage">
            {t("registerSubtitle")}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-black dark:text-brand-cream mb-1">
              {t("nameLabel")}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-onyx/60 dark:text-brand-sage/60 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-card border border-brand-sage/80 dark:border-brand-onyx text-brand-black dark:text-brand-cream focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              />
            </div>
          </div>

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
                placeholder="student@diu.edu.bd"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 chars)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-card border border-brand-sage/80 dark:border-brand-onyx text-brand-black dark:text-brand-cream focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-black dark:text-brand-cream mb-1">
              {t("roleLabel")}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-card border border-brand-sage/80 dark:border-brand-onyx text-brand-black dark:text-brand-cream focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
            >
              <option value="STUDENT">{t("roleStudent")}</option>
              <option value="EMPLOYER_RECRUITER">{t("roleEmployerRecruiter")}</option>
              <option value="EMPLOYER_OWNER">{t("roleEmployerOwner")}</option>
            </select>
          </div>

          {role === "STUDENT" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-brand-black dark:text-brand-cream mb-1">
                  University / Academic Institution
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-brand-onyx/60 dark:text-brand-sage/60 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-card border border-brand-sage/80 dark:border-brand-onyx text-brand-black dark:text-brand-cream focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-black dark:text-brand-cream mb-1">
                  Department / Degree Program
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-brand-card border border-brand-sage/80 dark:border-brand-onyx text-brand-black dark:text-brand-cream focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow transition-all"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 transition-all shadow-xs disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : t("btnSignUp")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-brand-onyx dark:text-brand-sage">
          <span>{lang === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে? " : "Already registered? "}</span>
          <Link href="/login" className="font-bold text-amber-600 dark:text-brand-yellow hover:underline">
            {t("navLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
