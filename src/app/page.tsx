"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { CAREER_CATALOG } from "@/data/careers";
import { 
  Compass, 
  Award, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Terminal, 
  Database, 
  Code2, 
  Lock, 
  Palette, 
  Sparkles, 
  FileText, 
  Layers,
  ChevronRight,
  HelpCircle,
  GraduationCap,
  Building2,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const { lang, t, fmtNum, setUser } = useApp();
  const router = useRouter();

  // Quick 1-click login handler for hackathon judges & demo exploration
  const handleQuickLogin = async (email: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "Password123!" }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role === "STUDENT") {
          router.push("/dashboard");
        } else if (data.user.role.includes("EMPLOYER")) {
          router.push("/employer");
        } else {
          router.push("/admin");
        }
      }
    } catch (err) {
      console.error("Quick login error:", err);
    }
  };

  const careerIcons: Record<string, any> = {
    junior_data_analyst: Database,
    junior_backend_developer: Code2,
    junior_frontend_developer: Terminal,
    junior_cybersecurity_analyst: Lock,
    junior_ui_ux_designer: Palette,
  };

  const faqs = [
    {
      q_en: "How does SkillRoute AI calculate career matches and learning effort?",
      q_bn: "স্কিলরুট এআই কীভাবে ক্যারিয়ার ম্যাচ এবং শেখার প্রয়োজনীয় সময় হিসাব করে?",
      a_en: "Calculations are strictly deterministic and reproducible. We compute weighted skill coverage q(s,c) = min(1, P(s)/T(s,c)) against curated role requirements. Learning effort models baseline focused hours calibrated for each skill gap.",
      a_bn: "হিসাবগুলো সম্পূর্ণ গাণিতিক ও সুনির্দিষ্ট নিয়মে হয়। ক্যাটালগের প্রয়োজনীয় দক্ষতার সাথে শিক্ষার্থীর স্ব-প্রতিবেদিত দক্ষতার আনুপাতিক তুলনা করে ম্যাচ স্কোর এবং প্রয়োজনীয় অধ্যয়ন সময় হিসাব করা হয়। এতে কোনো মনগড়া বা কৃত্রিম র‍্যান্ডমনেস নেই।",
    },
    {
      q_en: "How does the platform prevent assessment fraud or cheating?",
      q_bn: "প্ল্যাটফর্মটি মূল্যায়ন বা পরীক্ষায় অসদুপায় কীভাবে নিয়ন্ত্রণ করে?",
      a_en: "SkillRoute AI uses randomized mission variations, server-side grading, hidden evaluation test cases, telemetry signals (tab focus/blur tracking), and distinguishes between Mode A (Independent) and Mode B (AI-Assisted with disclosure).",
      a_bn: "স্কিলরুট এআই র্যান্ডমাইজড টাস্ক ভ্যারিয়েন্ট, সার্ভার-সাইড গ্রেডিং, হিডেন টেস্ট কেস এবং ট্যাব পরিবর্তন সংক্রান্ত ঝুঁকি ট্র্যাকিং ব্যবহার করে। একই সাথে স্বাধীনভাবে সম্পন্ন করা কাজ এবং এআই-সহায়তায় করা কাজের মধ্যে স্পষ্ট পার্থক্য বজায় রাখে।",
    },
    {
      q_en: "What are SkillProof credentials?",
      q_bn: "স্কিলপ্রুফ ক্রেডেনশিয়াল কী এবং কীভাবে কাজ করে?",
      a_en: "SkillProof credentials substantiate verified competency demonstrated through practical missions. Each carries a unique cryptographic ID, a public verification URL, and QR code verification. They are platform credentials, not accredited university degrees.",
      a_bn: "স্কিলপ্রুফ ক্রেডেনশিয়াল হলো মিশন এরিনায় ব্যবহারিক সমস্যার সফল সমাধানের মাধ্যমে অর্জিত ডিজিটাল প্রমাণ। প্রতিটি ক্রেডেনশিয়ালে ইউনিক ক্রিপ্টোগ্রাফিক আইডি এবং কিউআর কোড থাকে যা সরাসরি ভেরিফাই করা যায়।",
    },
    {
      q_en: "Can students control who sees their portfolio?",
      q_bn: "শিক্ষার্থীরা কি তাদের পোর্টফোলিও প্রদর্শনের ওপর নিয়ন্ত্রণ রাখতে পারে?",
      a_en: "Yes. Public sharing is entirely opt-in. Students specify exactly which demographic and competency fields are visible. Public links use unpredictable cryptographic slugs and can be revoked instantly at any moment.",
      a_bn: "হ্যাঁ, সম্পূর্ণ নিয়ন্ত্রণ শিক্ষার্থীর হাতে। শিক্ষার্থী নির্বাচন করতে পারে কোন কোন তথ্য প্রকাশ্যে দেখা যাবে। যেকোনো সময় এক ক্লিকে পাবলিক লিংক বাতিল (Revoke) করা সম্ভব।",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* -------------------------------------------------------------
          1. Hero Section
      ------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-brand-sage/40 dark:border-brand-onyx">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-yellow/15 dark:bg-brand-yellow/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* AIBC Challenge Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-sage/50 dark:bg-brand-onyx/80 border border-brand-sage/80 dark:border-brand-onyx text-xs font-semibold text-brand-black dark:text-brand-cream shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{t("heroBadge")}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-brand-black dark:text-brand-cream leading-[1.15]">
                {t("heroTitle")}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-brand-onyx dark:text-brand-sage leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t("heroSubtitle")}
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-yellow text-brand-black font-bold text-sm hover:bg-amber-400 shadow-md hover:shadow-lg transition-all"
                >
                  <span>{t("heroCtaStudent")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/employer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white dark:bg-brand-darkCard text-brand-black dark:text-brand-cream font-semibold text-sm border border-brand-sage/70 dark:border-brand-onyx hover:border-brand-yellow dark:hover:border-brand-yellow shadow-xs transition-all"
                >
                  <Briefcase className="w-4 h-4 text-brand-yellow" />
                  <span>{t("heroCtaEmployer")}</span>
                </Link>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-brand-onyx/80 dark:text-brand-sage/80">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Deterministic Math Engine</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>SkillProof™ Verification</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>5-Tier Evidence Ledger</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Role Explorer & DIU Live Benchmark Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-brand-sage/40 dark:border-brand-onyx">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-500 dark:text-brand-yellow" />
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-black dark:text-brand-yellow">
                      {lang === "bn" ? "১-ক্লিকে টেস্ট এক্সপ্লোরার" : "1-Click Role Explorer"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Live Demo Ready
                  </span>
                </div>

                <p className="text-xs text-brand-onyx dark:text-brand-sage">
                  {lang === "bn" 
                    ? "আইবিসি হ্যাকাথন বিচারক ও পরীক্ষকদের জন্য যেকোনো রোলে তাৎক্ষণিক সাইন ইন করুন:"
                    : "Instantly explore pre-configured evaluation accounts for AIBC hackathon reviewers:"}
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={() => handleQuickLogin("student@skillroute.ai")}
                    className="w-full p-3 rounded-xl bg-brand-cream/80 dark:bg-[#181817] hover:bg-brand-sage/50 dark:hover:bg-brand-onyx border border-brand-sage/60 dark:border-brand-onyx hover:border-brand-yellow dark:hover:border-brand-yellow flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center space-x-2.5 text-left">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 dark:bg-brand-yellow/15 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-4 h-4 text-amber-600 dark:text-brand-yellow" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-brand-black dark:text-[#E8EDDF] block group-hover:text-amber-600 dark:group-hover:text-brand-yellow">
                          {lang === "bn" ? "শিক্ষার্থী ডেমো পোর্টাল" : "Student Demo Portal"}
                        </span>
                        <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70">
                          student@skillroute.ai • Benchmark A/B Active
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500 dark:text-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => handleQuickLogin("employer@technext.bd")}
                    className="w-full p-3 rounded-xl bg-brand-cream/80 dark:bg-[#181817] hover:bg-brand-sage/50 dark:hover:bg-brand-onyx border border-brand-sage/60 dark:border-brand-onyx hover:border-brand-yellow dark:hover:border-brand-yellow flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center space-x-2.5 text-left">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 dark:bg-blue-400/15 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-brand-black dark:text-[#E8EDDF] block group-hover:text-amber-600 dark:group-hover:text-brand-yellow">
                          {lang === "bn" ? "নিয়োগকারী ট্যালেন্ট পোর্টাল" : "Employer Talent Portal"}
                        </span>
                        <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70">
                          employer@technext.bd • TechNext Bangladesh
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500 dark:text-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => handleQuickLogin("admin@skillroute.ai")}
                    className="w-full p-3 rounded-xl bg-brand-cream/80 dark:bg-[#181817] hover:bg-brand-sage/50 dark:hover:bg-brand-onyx border border-brand-sage/60 dark:border-brand-onyx hover:border-brand-yellow dark:hover:border-brand-yellow flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center space-x-2.5 text-left">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 dark:bg-emerald-400/15 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-brand-black dark:text-[#E8EDDF] block group-hover:text-amber-600 dark:group-hover:text-brand-yellow">
                          {lang === "bn" ? "প্ল্যাটফর্ম অ্যাডমিন কনসোল" : "Platform Admin Console"}
                        </span>
                        <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70">
                          admin@skillroute.ai • Full Verification Authority
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500 dark:text-brand-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Benchmark Invariant Teaser */}
                <div className="p-3.5 rounded-xl bg-brand-yellow/10 dark:bg-brand-yellow/5 border border-brand-yellow/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-brand-black dark:text-brand-cream block">
                      DIU Verified Benchmark A
                    </span>
                    <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70">
                      Junior Data Analyst (SQL 2/5, Python 3/5, Excel 3/5)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-amber-600 dark:text-brand-yellow block">
                      58.33%
                    </span>
                    <span className="text-[10px] font-bold text-brand-onyx dark:text-brand-sage">
                      80.0h Effort
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. The 4 Product Pillars
      ------------------------------------------------------------- */}
      <section className="py-16 md:py-24 bg-white dark:bg-brand-darkBg/60 border-b border-brand-sage/40 dark:border-brand-onyx transition-colors">
        <div className="w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
              {lang === "bn" ? "স্কিলরুট কীভাবে কাজ করে" : "How SkillRoute AI Transforms Workforce Readiness"}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-brand-onyx dark:text-brand-sage">
              {lang === "bn"
                ? "স্ব-প্রতিবেদিত দাবি থেকে শুরু করে ব্যবহারিক মূল্যায়ন এবং প্রাতিষ্ঠানিক নিয়োগ পর্যন্ত একটি সমন্বিত বাস্তুতন্ত্র।"
                : "A unified evidence pipeline bridging classroom education, practical proof, and corporate recruitment."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-brand-cream/60 dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx hover:border-brand-yellow/80 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-sage/70 dark:bg-brand-onyx text-brand-black dark:text-brand-yellow flex items-center justify-center mb-5 font-bold">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-black dark:text-brand-cream mb-2">
                  {t("pillar1Title")}
                </h3>
                <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
                  {t("pillar1Desc")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center text-xs font-semibold text-brand-black dark:text-brand-yellow">
                <Link href="/dashboard" className="flex items-center space-x-1 hover:underline">
                  <span>{lang === "bn" ? "প্রোফাইল শুরু করুন" : "Explore Matching"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-brand-cream/60 dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx hover:border-brand-yellow/80 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-sage/70 dark:bg-brand-onyx text-brand-black dark:text-brand-yellow flex items-center justify-center mb-5 font-bold">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-black dark:text-brand-cream mb-2">
                  {t("pillar2Title")}
                </h3>
                <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
                  {t("pillar2Desc")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center text-xs font-semibold text-brand-black dark:text-brand-yellow">
                <Link href="/missions" className="flex items-center space-x-1 hover:underline">
                  <span>{lang === "bn" ? "মিশন এরিনায় প্রবেশ" : "Enter Arena"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-brand-cream/60 dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx hover:border-brand-yellow/80 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-sage/70 dark:bg-brand-onyx text-brand-black dark:text-brand-yellow flex items-center justify-center mb-5 font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-black dark:text-brand-cream mb-2">
                  {t("pillar3Title")}
                </h3>
                <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
                  {t("pillar3Desc")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center text-xs font-semibold text-brand-black dark:text-brand-yellow">
                <Link href="/skillproof" className="flex items-center space-x-1 hover:underline">
                  <span>{lang === "bn" ? "পোর্টফোলিও দেখুন" : "View SkillProof"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-brand-cream/60 dark:bg-brand-darkCard border border-brand-sage/60 dark:border-brand-onyx hover:border-brand-yellow/80 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-sage/70 dark:bg-brand-onyx text-brand-black dark:text-brand-yellow flex items-center justify-center mb-5 font-bold">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-black dark:text-brand-cream mb-2">
                  {t("pillar4Title")}
                </h3>
                <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
                  {t("pillar4Desc")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center text-xs font-semibold text-brand-black dark:text-brand-yellow">
                <Link href="/employer" className="flex items-center space-x-1 hover:underline">
                  <span>{lang === "bn" ? "প্রার্থী আবিষ্কার" : "Discover Talent"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. Five Career Tracks Showcase
      ------------------------------------------------------------- */}
      <section className="py-16 md:py-24 bg-brand-cream dark:bg-brand-darkBg border-b border-brand-sage/40 dark:border-brand-onyx transition-colors">
        <div className="w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-brand-yellow block mb-1">
                {lang === "bn" ? "সুনির্দিষ্ট পাঠ্যক্রম" : "Standardized Role Pathways"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
                {t("tracksHeading")}
              </h2>
              <p className="mt-1 text-sm text-brand-onyx dark:text-brand-sage">
                {t("tracksSubheading")}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1 text-xs font-bold text-brand-black dark:text-brand-yellow hover:underline"
            >
              <span>{lang === "bn" ? "সকল ক্যারিয়ার মূল্যায়ন দেখুন" : "Evaluate Your Fit Across All 5"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAREER_CATALOG.map((career) => {
              const Icon = careerIcons[career.career_id] || Layers;
              const totalHours = career.skills.reduce((acc, s) => acc + s.hours_zero_to_target, 0);

              return (
                <div
                  key={career.career_id}
                  className="p-6 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-yellow flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-sage/40 dark:bg-brand-onyx text-brand-onyx dark:text-brand-sage">
                        {career.interest_tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-brand-black dark:text-brand-cream mb-1.5">
                      {lang === "bn" && career.title_bn ? career.title_bn : career.title}
                    </h3>
                    <p className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 leading-relaxed mb-4">
                      {lang === "bn" && career.role_summary_bn ? career.role_summary_bn : career.role_summary}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60">
                        {lang === "bn" ? "প্রয়োজনীয় দক্ষতা ও স্তর" : "Required Competencies"}:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {career.skills.map((s) => (
                          <span
                            key={s.skill_id}
                            className="text-[11px] px-2 py-0.5 rounded bg-brand-cream dark:bg-brand-onyx/80 text-brand-black dark:text-brand-cream border border-brand-sage/50 dark:border-brand-onyx font-medium"
                          >
                            {s.skill_id.toUpperCase()} (T={s.target_level})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center justify-between text-xs">
                    <span className="text-brand-onyx/70 dark:text-brand-sage/70 font-medium">
                      {lang === "bn" ? `বেসলাইন অধ্যয়ন: ${fmtNum(totalHours)} ঘণ্টা` : `Zero-to-target: ${totalHours} hrs`}
                    </span>
                    <Link
                      href="/dashboard"
                      className="font-bold text-amber-600 dark:text-brand-yellow hover:underline flex items-center space-x-1"
                    >
                      <span>{lang === "bn" ? "সিলেক্ট করুন" : "Explore"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. Mission Arena Interactive Spotlight
      ------------------------------------------------------------- */}
      <section className="py-16 md:py-24 bg-white dark:bg-brand-darkBg/60 border-b border-brand-sage/40 dark:border-brand-onyx transition-colors">
        <div className="w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-brand-yellow text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>{lang === "bn" ? "বাস্তব কর্মক্ষমতা যাচাই" : "Hands-on Practical Proof"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
                SkillRoute Mission Arena
              </h2>
              <p className="text-sm sm:text-base text-brand-onyx dark:text-brand-sage leading-relaxed">
                {lang === "bn"
                  ? "বহুনির্বাচনী প্রশ্নের বাইরে গিয়ে শিক্ষার্থীকে প্রকৃত কাজের মুখোমুখি দাঁড় করায় মিশন এরিনা। নিরাপদ স্যান্ডবক্সে এসকিউএল কুয়েরি এক্সিকিউশন, রেস্ট এপিআই বাগ ফিক্স, ডোম অ্যাক্সেসিবিলিটি এবং এসওসি লগ অ্যানালাইসিস সমাধান করে প্রমাণ করুন আপনার দক্ষতা।"
                  : "Move beyond theoretical multiple-choice quizzes. The Mission Arena evaluates practical problem solving against explicit server-side rubrics: execute analytical SQL queries, fix broken REST APIs, audit responsive frontend accessibility, and investigate cyber incident logs."}
              </p>

              <div className="space-y-3 text-xs sm:text-sm font-medium">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{lang === "bn" ? "সার্ভার-সাইড সুরক্ষিত মূল্যায়ন (নো আন-স্যান্ডবক্সড কোড)" : "Server-side safe assessment execution against realistic datasets"}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{lang === "bn" ? "স্বচ্ছ স্কোরিং রুব্রিক ও তাৎক্ষণিক প্রতিক্রিয়া" : "Explicit, transparent evaluation rubrics with detailed feedback"}</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{lang === "bn" ? "উত্তীর্ণ হলে সরাসরি যাচাইকৃত প্রাতিষ্ঠানিক ক্রেডেনশিয়াল অর্জন" : "Earn verifiable SkillProof credentials upon scoring ≥ 75%"}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/missions"
                  className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black font-bold text-xs sm:text-sm hover:opacity-90 transition-all shadow-sm"
                >
                  <span>{lang === "bn" ? "মিশন চ্যালেঞ্জগুলো দেখুন" : "Explore All Missions"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Code Preview Card */}
            <div className="p-6 rounded-2xl bg-brand-black text-brand-cream border border-brand-onyx shadow-xl font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-onyx">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-brand-sage text-[11px]">mission_sql_regional_sales.sql</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-onyx text-brand-yellow">
                  Data Analyst
                </span>
              </div>
              <pre className="text-brand-sage overflow-x-auto leading-relaxed">
{`SELECT 
    r.region_name,
    COUNT(o.order_id) AS order_count,
    SUM(o.order_amount) AS total_revenue
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN regions r ON c.region_id = r.region_id
WHERE o.order_status = 'COMPLETED'
GROUP BY r.region_name
HAVING SUM(o.order_amount) > 5000
ORDER BY total_revenue DESC;`}
              </pre>
              <div className="mt-4 pt-4 border-t border-brand-onyx flex items-center justify-between text-[11px] text-brand-sage font-sans">
                <span className="text-emerald-400 font-semibold">✓ Rubric Verification: 100 / 100</span>
                <span>Output: Dhaka ($9,500) • Chittagong ($6,200)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. Frequently Asked Questions (FAQ)
      ------------------------------------------------------------- */}
      <section className="py-16 md:py-24 bg-brand-cream dark:bg-brand-darkBg transition-colors">
        <div className="w-full max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
              {lang === "bn" ? "সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)" : "Frequently Asked Questions"}
            </h2>
            <p className="mt-2 text-sm text-brand-onyx dark:text-brand-sage">
              {lang === "bn"
                ? "স্কিলরুট এআই-এর গাণিতিক স্বচ্ছতা, মূল্যায়ন নির্ভরযোগ্যতা এবং ডেটা প্রাইভেসি সংক্রান্ত তথ্যাবলী।"
                : "Transparent explanations regarding our deterministic calculations, assessment credibility, and privacy."}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs"
              >
                <div className="flex items-start space-x-3">
                  <HelpCircle className="w-5 h-5 text-amber-500 dark:text-brand-yellow flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream mb-2">
                      {lang === "bn" ? faq.q_bn : faq.q_en}
                    </h3>
                    <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
                      {lang === "bn" ? faq.a_bn : faq.a_en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
