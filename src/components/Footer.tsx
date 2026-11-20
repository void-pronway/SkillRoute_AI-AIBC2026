"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";

export function Footer() {
  const { lang, t } = useApp();

  return (
    <footer className="no-print mt-auto bg-white dark:bg-brand-black border-t border-brand-sage/60 dark:border-brand-onyx text-brand-onyx dark:text-brand-sage transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10">
        {/* Responsible AI Notice */}
        <div className="mb-8 p-4 rounded-xl bg-brand-cream/60 dark:bg-brand-onyx/40 border border-brand-sage/50 dark:border-brand-onyx flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-brand-yellow flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-brand-black dark:text-brand-cream block sm:inline mr-1">
              {t("trustBannerTitle")}
            </span>
            <span>{t("trustBannerDesc")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-brand-black dark:bg-brand-yellow text-brand-yellow dark:text-brand-black flex items-center justify-center font-bold text-xs">
                SR
              </div>
              <span className="font-extrabold text-base text-brand-black dark:text-brand-cream tracking-tight">
                SkillRoute <span className="text-amber-500 dark:text-brand-yellow">AI</span>
              </span>
            </div>
            <p className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 leading-relaxed">
              {lang === "bn"
                ? "শিক্ষা থেকে কর্মসংস্থান। বিশ্ববিদ্যালয় শিক্ষার্থী এবং প্রযুক্তি গ্র্যাজুয়েটদের বাস্তব সক্ষমতা যাচাই ও স্বচ্ছ নিয়োগ প্ল্যাটফর্ম।"
                : "From Learning to Employability. Evidence-based workforce readiness, skill verification, and competency-first talent recruitment."}
            </p>
            <div className="text-[11px] font-semibold text-amber-600 dark:text-brand-yellow">
              AIBC Workforce Ready Challenge 2026 • DIU
            </div>
          </div>

          {/* Col 2: Pathways */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-black dark:text-brand-cream mb-3">
              {lang === "bn" ? "ক্যারিয়ার ট্র্যাকসমূহ" : "Career Pathways"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  Junior Data Analyst
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  Junior Backend Developer
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  Junior Frontend Developer
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  Junior Cybersecurity Analyst
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  Junior UI/UX Designer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Practical Assessment */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-black dark:text-brand-cream mb-3">
              {lang === "bn" ? "প্ল্যাটফর্ম ফিচার" : "Core Features"}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/missions" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  SkillRoute Mission Arena
                </Link>
              </li>
              <li>
                <Link href="/skillproof" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  SkillProof™ Level 2 Portfolio
                </Link>
              </li>
              <li>
                <Link href="/employer" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  Employer Talent Discovery
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-600 dark:hover:text-brand-yellow transition-colors">
                  4-Week Starter Roadmaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Integrity */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-black dark:text-brand-cream mb-3">
              {lang === "bn" ? "স্বচ্ছতা ও নিরাপত্তা" : "Integrity & Standards"}
            </h4>
            <p className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 leading-relaxed mb-3">
              {lang === "bn"
                ? "কোনো গোপন মূল্যায়ন বা মনগড়া স্কোর নয়। প্রতিটি স্কোর প্রকাশ্য রুব্রিক ও ব্যবহারিক প্রমাণের ভিত্তিতে নির্ধারিত।"
                : "No arbitrary scores or opaque AI decisions. Every evaluation is grounded in reproducible rubrics and demonstrated evidence."}
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-brand-black dark:text-brand-cream font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Deterministic Formulas Preserved</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-brand-sage/40 dark:border-brand-onyx flex flex-col sm:flex-row items-center justify-between text-xs text-brand-onyx/70 dark:text-brand-sage/70">
          <p>© 2026 SkillRoute AI. Built for AIBC Daffodil International University.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Engineering Excellence from Learning to Employability</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
