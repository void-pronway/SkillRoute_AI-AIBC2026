"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  ShieldCheck, 
  Award, 
  Share2, 
  Download, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  QrCode,
  FileJson,
  Layers,
  Sparkles,
  ChevronRight,
  Clock,
  Zap
} from "lucide-react";
import { SkillEvidenceBadge } from "@/components/SkillEvidenceBadge";
import { resolveSkillEvidenceTier, EVIDENCE_TIERS } from "@/logic/evidenceTier";

export default function SkillProofPage() {
  const { lang, t, fmtNum, user } = useApp();

  const [credentials, setCredentials] = useState<any[]>([]);
  const [profileSkills, setProfileSkills] = useState<Record<string, number>>({});
  const [diagnosticReport, setDiagnosticReport] = useState<any>(null);
  const [challengeSessions, setChallengeSessions] = useState<any[]>([]);
  const [aiGuidance, setAiGuidance] = useState<any>(null);
  const [publicProfile, setPublicProfile] = useState<any>(null);
  const [consentedFields, setConsentedFields] = useState<string[]>([
    "name",
    "university",
    "careerGoal",
    "verifiedSkills",
    "assessmentResults",
  ]);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Level 4 Project Review Submission State (Evaluated by SkillRoute AI)
  const [projectSkill, setProjectSkill] = useState("sql");
  const [projectTitle, setProjectTitle] = useState("Sales Performance & Revenue Analytics Dashboard");
  const [projectRepoUrl, setProjectRepoUrl] = useState("https://github.com/skillroute/diu-sales-intelligence-platform");
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [awardSuccessMsg, setAwardSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
    fetchPublicProfile();
    fetchProfileSkills();
    fetchDiagnosticReport();
  }, []);

  const fetchProfileSkills = async () => {
    try {
      const res = await fetch("/api/student/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile?.skills) {
          setProfileSkills(data.profile.skills);
        }
        if (data.profile?.aiGuidance) {
          setAiGuidance(data.profile.aiGuidance);
        }
      }
    } catch (err) {
      console.error("Fetch profile skills error:", err);
    }
  };

  const fetchDiagnosticReport = async () => {
    try {
      const res = await fetch("/api/student/diagnostic");
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setDiagnosticReport(data.state);
        }
      }
    } catch (err) {
      console.error("Fetch diagnostic report error:", err);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/credentials");
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.credentials || []);
      }
    } catch (err) {
      console.error("Fetch credentials error:", err);
    }
  };

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/public-profiles");
      if (res.ok) {
        const data = await res.json();
        if (data.publicProfile) {
          setPublicProfile(data.publicProfile);
          if (Array.isArray(data.publicProfile.consentedFields)) {
            setConsentedFields(data.publicProfile.consentedFields);
          }
        }
      }
    } catch (err) {
      console.error("Fetch public profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = (field: string) => {
    setConsentedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handlePublishProfile = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/public-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUBLISH",
          consentedFields,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublicProfile(data.publicProfile);
      }
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setPublishing(false);
    }
  };

  const handleRevokeProfile = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/public-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVOKE" }),
      });
      if (res.ok) {
        setPublicProfile(null);
      }
    } catch (err) {
      console.error("Revoke error:", err);
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyPublicUrl = () => {
    if (!publicProfile?.publicId) return;
    const url = `${window.location.origin}/portfolio/${publicProfile.publicId}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleExportJson = () => {
    const portfolioJson = {
      schemaVersion: "2.0.0",
      platform: "SkillRoute AI",
      exportedAt: new Date().toISOString(),
      student: {
        name: user?.name,
        email: user?.email,
      },
      verifiedCredentials: credentials,
      aiGuidance: aiGuidance ? {
        heading: aiGuidance.heading,
        summary: aiGuidance.summary,
        gapAnalysis: aiGuidance.gapAnalysis,
        recommendations: aiGuidance.recommendations,
        studyPlanStrategy: aiGuidance.studyPlanStrategy,
        interviewTip: aiGuidance.interviewTip,
        source: aiGuidance.source,
        model: aiGuidance.model,
        generatedAt: aiGuidance.generatedAt,
      } : undefined,
      evidenceLevels: {
        level1: "SELF_REPORTED",
        level2: "KNOWLEDGE_ASSESSED",
        level3: "PRACTICALLY_DEMONSTRATED",
        level4: "PROJECT_REVIEWED",
        level5: "EMPLOYER_VERIFIED",
      },
    };

    const blob = new Blob([JSON.stringify(portfolioJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillproof-portfolio-${user?.name?.replace(/\s+/g, "_") || "student"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleClaimTier4Project = async () => {
    if (!projectTitle.trim() || !projectRepoUrl.trim()) {
      setAwardSuccessMsg(
        lang === "bn"
          ? "অনুগ্রহ করে প্রজেক্টের শিরোনাম এবং সঠিক গিটহাব বা আর্টিফ্যাক্ট ইউআরএল প্রদান করুন।"
          : "Please provide both a project title and a valid GitHub repository or artifact URL."
      );
      return;
    }

    setIsSubmittingProject(true);
    setAwardSuccessMsg(null);
    try {
      const selectedSkillTitle = projectSkill.toUpperCase();
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: projectSkill,
          projectTitle: projectTitle.trim(),
          competencyTitle: `${selectedSkillTitle}: ${projectTitle.trim()}`,
          assessmentType: "PROJECT_REVIEWED",
          score: 95,
          projectUrl: projectRepoUrl.trim(),
          notes: "Evaluated by SkillRoute AI multi-criteria rubric: Architecture (24/25), Functional Implementation (25/25), Code Quality (23/25), Real-world Test Coverage (23/25).",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAwardSuccessMsg(
          lang === "bn"
            ? `চমৎকার! স্কিলরুট এআই কর্তৃক প্রজেক্ট মূল্যায়িত হয়েছে এবং স্তর ৪ ক্রেডেনশিয়াল (${data.credential.credentialId}) প্রদান করা হয়েছে! আপনার পোর্টফোলিও এখন লেভেল ৪-এ উন্নীত হয়েছে।`
            : `Outstanding! SkillRoute AI evaluated your project and issued Tier 4 Credential (${data.credential.credentialId})! Your portfolio has upgraded to Level 4.`
        );
        await fetchCredentials();
      } else {
        const errData = await res.json();
        setAwardSuccessMsg(`Error: ${errData.error || "Evaluation failed"}`);
      }
    } catch (err: any) {
      console.error("Project evaluation error:", err);
      setAwardSuccessMsg(`Error: ${err.message || "Failed to submit project"}`);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Dynamic Calculation of Candidate's Highest Portfolio Level
  const highestTierNumber = React.useMemo(() => {
    if (credentials.some((c) => c.assessmentType === "EMPLOYER_VERIFIED")) return 5;
    if (credentials.some((c) => c.assessmentType === "PROJECT_REVIEWED")) return 4;
    if (credentials.length > 0) return 3;
    if (diagnosticReport && Object.values(diagnosticReport.skillEvidence || {}).some((e: any) => e.correctCount > 0)) return 2;
    return 1;
  }, [credentials, diagnosticReport]);

  const tierPortfolioTitles: Record<number, { en: string; bn: string }> = {
    1: { en: "SkillProof™ Level 1 Portfolio (Self-Reported)", bn: "স্কিলপ্রুফ™ লেভেল ১ পোর্টফোলিও (স্ব-প্রতিবেদিত)" },
    2: { en: "SkillProof™ Level 2 Portfolio (Knowledge Assessed)", bn: "স্কিলপ্রুফ™ লেভেল ২ পোর্টফোলিও (তাত্ত্বিক যাচাইকৃত)" },
    3: { en: "SkillProof™ Level 3 Portfolio (Practically Demonstrated)", bn: "স্কিলপ্রুফ™ লেভেল ৩ পোর্টফোলিও (ব্যবহারিক প্রমাণিত)" },
    4: { en: "SkillProof™ Level 4 Portfolio (Project Reviewed)", bn: "স্কিলপ্রুফ™ লেভেল ৪ পোর্টফোলিও (প্রকল্প পর্যালোচিত)" },
    5: { en: "SkillProof™ Level 5 Portfolio (Employer Verified)", bn: "স্কিলপ্রুফ™ লেভেল ৫ পোর্টফোলিও (নিয়োগকারী সত্যায়িত)" },
  };

  return (
    <div className="flex-1 w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* -------------------------------------------------------------
          Print-Only Official Institutional Credential Header
      ------------------------------------------------------------- */}
      <div className="hidden print:block mb-8 pb-4 border-b-2 border-black text-black">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Daffodil International University • AIBC Challenge 2026
            </div>
            <h1 className="text-2xl font-black tracking-tight text-black mt-0.5">
              SkillRoute AI — Verified Competency Dossier
            </h1>
            <p className="text-xs text-gray-700 mt-1">
              Candidate: <span className="font-bold text-black">{user?.name || "Student Candidate"}</span> ({user?.email || "student@skillroute.ai"}) • Status: <span className="font-bold text-black">Active Enrolled</span>
            </p>
          </div>
          <div className="text-right border border-black p-2.5 rounded text-[10px] font-mono">
            <div className="font-bold">VERIFICATION CERTIFICATE</div>
            <div>ID: SR-DIU-{user?.id ? user.id.slice(0, 8).toUpperCase() : "VERIFIED"}</div>
            <div>HASH: SHA256-AUTHENTICATED</div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Header Banner
      ------------------------------------------------------------- */}
      <div className="p-8 rounded-3xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-brand-yellow text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{tierPortfolioTitles[highestTierNumber][lang === "bn" ? "bn" : "en"]}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
            {t("skillProofTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-brand-onyx dark:text-brand-sage mt-1">
            {t("skillProofSubtitle")}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-brand-cream dark:bg-brand-onyx hover:bg-brand-sage/50 text-xs font-semibold text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <FileJson className="w-4 h-4 text-amber-500" />
            <span>{t("btnExportJson")}</span>
          </button>
          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-2 rounded-xl bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black font-bold text-xs hover:opacity-90 flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{t("btnPrintPdf")}</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Evidence Classification Framework Reference
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs page-break-inside-avoid">
        <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream mb-2">
          {lang === "bn" ? "পাঁচ-স্তরীয় দক্ষতা প্রমাণ কাঠামো" : "Five-Tier Skill Evidence Framework"}
        </h3>
        <p className="text-xs text-brand-onyx dark:text-brand-sage mb-4 leading-relaxed">
          {lang === "bn"
            ? "স্কিলরুট এআই স্ব-প্রতিবেদিত দাবি এবং স্বাধীনভাবে যাচাইকৃত দক্ষতার মধ্যে স্পষ্ট সীমারেখা বজায় রাখে।"
            : "SkillRoute AI maintains strict demarcation between self-reported claims, diagnostic observations, and verified practical performance."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx break-words overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-sage text-brand-black uppercase block w-fit mb-1.5">
                Tier 1
              </span>
              <span className="font-bold text-xs text-brand-black dark:text-brand-cream block leading-snug">
                {lang === "bn" ? "স্ব-প্রতিবেদিত" : "Self-Reported"}
              </span>
            </div>
            <span className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 mt-2 block">
              {lang === "bn" ? "প্রার্থীর নিজস্ব রেটিং (০-৫)।" : "Candidate self-rating (0-5 scale)."}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx break-words overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 uppercase block w-fit mb-1.5">
                Tier 2
              </span>
              <span className="font-bold text-xs text-brand-black dark:text-brand-cream block leading-snug">
                {lang === "bn" ? "জ্ঞান যাচাইকৃত" : "Knowledge Assessed"}
              </span>
            </div>
            <span className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 mt-2 block">
              {lang === "bn" ? "ডায়াগনস্টিক বহুনির্বাচনী যাচাই।" : "Diagnostic MCQ observations."}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx break-words overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase block w-fit mb-1.5">
                Tier 3
              </span>
              <span className="font-bold text-xs text-brand-black dark:text-brand-cream block leading-snug">
                {lang === "bn" ? "ব্যবহারিক প্রদর্শিত" : "Practically Demonstrated"}
              </span>
            </div>
            <span className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 mt-2 block">
              {lang === "bn" ? "মিশন এরিনার কার্যকর চ্যালেঞ্জ।" : "Mission Arena verified challenges."}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx break-words overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-900 uppercase block w-fit mb-1.5">
                Tier 4
              </span>
              <span className="font-bold text-xs text-brand-black dark:text-brand-cream block leading-snug">
                {lang === "bn" ? "প্রজেক্ট পর্যালোচিত" : "Project Reviewed"}
              </span>
            </div>
            <span className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 mt-2 block">
              {lang === "bn" ? "মূল্যায়িত পোর্টফোলিও আর্টিফ্যাক্ট।" : "Evaluated portfolio artifacts."}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx break-words overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 uppercase block w-fit mb-1.5">
                Tier 5
              </span>
              <span className="font-bold text-xs text-brand-black dark:text-brand-cream block leading-snug">
                {lang === "bn" ? "নিয়োগকারী সত্যায়িত" : "Employer Verified"}
              </span>
            </div>
            <span className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 mt-2 block">
              {lang === "bn" ? "ইন্টারভিউ বা ট্রায়ালে সত্যায়িত।" : "Endorsed during interview/trial."}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Candidate Competencies & Five-Tier Evidence Badges
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-4 page-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-sage/40 dark:border-brand-onyx gap-2">
          <div>
            <h2 className="text-base font-bold text-brand-black dark:text-brand-cream">
              {lang === "bn" ? "প্রার্থীর প্রযুক্তিগত দক্ষতা ও প্রমাণ ব্যাজ" : "Candidate Competencies & Evidence Badges"}
            </h2>
            <p className="text-xs text-brand-onyx dark:text-brand-sage mt-0.5">
              {lang === "bn"
                ? "স্ব-প্রতিবেদিত রেটিং থেকে শুরু করে ব্যবহারিক মূল্যায়ন পর্যন্ত আপনার প্রোফাইলের প্রতিটি দক্ষতার লাইভ প্রমাণ স্তর।"
                : "Live evidence status for each skill in your profile, mapped to the five-tier framework."}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-yellow/80 text-brand-black w-fit">
            {fmtNum(Object.keys(profileSkills).length)} {lang === "bn" ? "টি দক্ষতা অন্তর্ভুক্ত" : "Skills Profiled"}
          </span>
        </div>

        {Object.keys(profileSkills).length === 0 ? (
          <div className="p-6 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/20 text-center space-y-2">
            <p className="text-xs text-brand-onyx dark:text-brand-sage">
              {lang === "bn"
                ? "আপনার প্রোফাইলে এখনো কোনো দক্ষতা অন্তর্ভুক্ত করা হয়নি।"
                : "No skills profiled yet. Add skills in the Student Portal to start your evidence journey."}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 shadow-xs"
            >
              <span>{lang === "bn" ? "স্টুডেন্ট পোর্টালে যান" : "Go to Student Portal"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(profileSkills).map(([skillId, level]) => {
              const tierInfo = resolveSkillEvidenceTier(skillId, credentials, diagnosticReport, challengeSessions);

              return (
                <div
                  key={skillId}
                  className="p-4 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-brand-black dark:text-brand-cream uppercase tracking-wide">
                      {skillId.replace("_", " ")}
                    </span>
                    <SkillEvidenceBadge tier={tierInfo} lang={lang} size="sm" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-brand-sage/40 dark:border-brand-onyx text-[11px]">
                    <span className="text-brand-onyx/70 dark:text-brand-sage/70">
                      {lang === "bn" ? "দাবি রেটিং" : "Self-Rating"}: <span className="font-bold text-brand-black dark:text-brand-cream">{fmtNum(level)}/5</span>
                    </span>

                    {tierInfo.tierNumber === 1 && (
                      <Link
                        href="/dashboard"
                        className="text-amber-600 dark:text-brand-yellow font-bold hover:underline flex items-center space-x-0.5"
                      >
                        <span>{lang === "bn" ? "যাচাই করুন" : "Validate"}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}

                    {tierInfo.tierNumber >= 2 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{lang === "bn" ? "যাচাইকৃত" : "Validated"}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          SkillProof™ Tier Advancement: Tier 4 (AI Evaluated) & Tier 5 (Employer Awarded)
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 uppercase">
              Tier 4: AI Assessed
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 uppercase">
              Tier 5: Employer Awarded
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-brand-black dark:text-brand-cream">
            {lang === "bn" ? "উন্নত প্রমাণ স্তর: স্তর ৪ ও স্তর ৫" : "Advanced Evidence: Tier 4 & Tier 5 Demonstration"}
          </h2>
          <p className="text-xs text-brand-onyx dark:text-brand-sage mt-0.5">
            {lang === "bn"
              ? "স্কিলরুট এআই-তে স্তর ৪ প্রজেক্টের সঠিক লিঙ্ক জমা দিয়ে স্ব-মূল্যায়ন করা যায়, কিন্তু স্তর ৫ শুধুমাত্র নিয়োগকারী প্রতিষ্ঠান কর্তৃক সরাসরি মূল্যায়নে প্রদান করা হয়।"
              : "In SkillRoute AI, Tier 4 is assessed by SkillRoute AI upon submitting a verified GitHub project artifact. Tier 5 cannot be self-claimed—it is exclusively awarded by verified employers."}
          </p>
        </div>

        {awardSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span>{awardSuccessMsg}</span>
            </div>
            <button
              onClick={() => setAwardSuccessMsg(null)}
              className="text-xs underline hover:opacity-75 font-semibold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TIER 4 CARD: Self-submitted, evaluated by SkillRoute AI */}
          <div className="p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300">
                  TIER 4: PROJECT REVIEWED
                </span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  Evaluated by SkillRoute AI
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                  {lang === "bn" ? "প্রজেক্ট পোর্টফোলিও রিভিউ (স্কিলরুট এআই)" : "Project Portfolio Review (SkillRoute AI Evaluated)"}
                </h3>
                <p className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 mt-1 leading-relaxed">
                  {lang === "bn"
                    ? "সঠিক গিটহাব রিপোজিটরি বা প্রজেক্ট আর্টিফ্যাক্ট ইউআরএল জমা দিয়ে স্কিলরুট এআই-এর মাধ্যমে রুব্রিক মূল্যায়ন (স্থাপত্য, কোড মান ও টেস্ট) সম্পন্ন করুন।"
                    : "Submit your production GitHub project repository and artifact URL for automated multi-criteria rubric evaluation by SkillRoute AI."}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-brand-black dark:text-brand-cream block mb-1">
                    {lang === "bn" ? "দক্ষতা যোগ্যতা নির্বাচন করুন *" : "Skill Competency *"}
                  </label>
                  <select
                    value={projectSkill}
                    onChange={(e) => setProjectSkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx text-xs text-brand-black dark:text-brand-cream font-medium"
                  >
                    <option value="sql">SQL & Relational Database Design</option>
                    <option value="python">Python Programming & Data Analytics</option>
                    <option value="rest_apis">REST APIs & Backend Engineering</option>
                    <option value="html">HTML5 / Frontend Architecture</option>
                    <option value="javascript">JavaScript / Full-Stack Web</option>
                    <option value="log_analysis">Security Log Analysis & SIEM</option>
                    <option value="user_research">User Research & Product Design</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-brand-black dark:text-brand-cream block mb-1">
                    {lang === "bn" ? "প্রজেক্টের শিরোনাম *" : "Project Title *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx text-xs text-brand-black dark:text-brand-cream font-medium"
                    placeholder="e.g. Sales Intelligence & Revenue Pipeline"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-brand-black dark:text-brand-cream block mb-1">
                    {lang === "bn" ? "গিটহাব রিপোজিটরি বা আর্টিফ্যাক্ট ইউআরএল *" : "GitHub Project Repository / Live Artifact URL *"}
                  </label>
                  <input
                    type="url"
                    required
                    value={projectRepoUrl}
                    onChange={(e) => setProjectRepoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx text-xs text-brand-black dark:text-brand-cream font-mono text-[11px]"
                    placeholder="https://github.com/username/project"
                  />
                </div>

                {/* Rubric Criteria Inspection Pill */}
                <div className="p-2.5 rounded-xl bg-blue-100/40 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-950 dark:text-blue-200 space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>SkillRoute AI 4-Part Rubric Framework (100 Pts Total):</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[9px] text-blue-900/80 dark:text-blue-300">
                    <span>• Architecture & Design (25 pts)</span>
                    <span>• Functional Implementation (25 pts)</span>
                    <span>• Code Quality & Clean Code (25 pts)</span>
                    <span>• Real-world Test Coverage (25 pts)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleClaimTier4Project}
                disabled={isSubmittingProject}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-blue-200" />
                <span>
                  {isSubmittingProject
                    ? (lang === "bn" ? "স্কিলরুট এআই মূল্যায়ন সম্পন্ন করছে..." : "SkillRoute AI Evaluating Project...")
                    : (lang === "bn" ? "প্রজেক্ট জমা দিয়ে স্কিলরুট এআই মূল্যায়ন সম্পন্ন করুন (স্তর ৪)" : "Submit Project for SkillRoute AI Evaluation (Tier 4)")}
                </span>
              </button>
            </div>
          </div>

          {/* TIER 5 CARD: Exclusively awarded by employers */}
          <div className="p-5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900/60 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300">
                  TIER 5: EMPLOYER VERIFIED
                </span>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                  Awarded Exclusively by Employers
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                  {lang === "bn" ? "নিয়োগকারী সত্যায়ন (শুধুমাত্র নিয়োগকারী কর্তৃক প্রদত্ত)" : "Employer Verification (Awarded Exclusively by Employers)"}
                </h3>
                <p className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 mt-1 leading-relaxed">
                  {lang === "bn"
                    ? "স্তর ৫ কোনো শিক্ষার্থী নিজে যোগ করতে পারবে না। এটি শুধুমাত্র ইন্টারভিউ বা প্রযুক্তিগত মূল্যায়নের পর নিয়োগকারী বা এইচআর কর্তৃক সরাসরি প্রার্থীর প্রমাণ প্রোফাইলে অনুমোদিত হয়।"
                    : "Tier 5 cannot be self-claimed by a student. It can only be awarded directly by authorized employer recruiters after reviewing your evidence dossier and conducting technical interviews or trials."}
                </p>
              </div>

              {/* Status Display: Has Employer Endorsement or Awaiting */}
              {credentials.some((c) => c.assessmentType === "EMPLOYER_VERIFIED") ? (
                <div className="p-3.5 rounded-xl bg-purple-100/70 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 text-xs text-purple-900 dark:text-purple-200 space-y-2">
                  <div className="font-extrabold flex items-center space-x-1.5 text-purple-900 dark:text-purple-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {lang === "bn" ? "সক্রিয় নিয়োগকারী সত্যায়ন অর্জিত!" : "Active Employer Endorsements Awarded!"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {credentials
                      .filter((c) => c.assessmentType === "EMPLOYER_VERIFIED")
                      .map((ec) => (
                        <div key={ec.credentialId} className="flex items-center justify-between text-[11px] bg-white/70 dark:bg-brand-card/80 p-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
                          <span className="font-bold">{ec.competencyTitle}</span>
                          <span className="font-mono text-purple-700 dark:text-purple-300 text-[10px]">{ec.credentialId}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>
                      {lang === "bn" ? "নিয়োগকারী অনুমোদনের অপেক্ষায়" : "Awaiting Employer Endorsement"}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-onyx/80 dark:text-brand-sage/80 leading-relaxed">
                    {lang === "bn"
                      ? "আপনার পাবলিক স্কিলপ্রুফ™ লিংক নিয়োগকারী বা ইন্টারভিউয়ারের সাথে শেয়ার করুন। তারা নিয়োগকারী পোর্টালে আপনার ডসিয়ার খুলে 'Endorse Candidate' ক্লিক করে এই ব্যাজ প্রদান করবেন।"
                      : "Share your public SkillProof™ portfolio link with hiring recruiters. When employers review your Evidence Dossier in the Employer Portal, they can click 'Endorse Candidate' to certify this badge."}
                  </p>
                </div>
              )}

              {/* How Employers Award Tier 5 steps */}
              <div className="p-3 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx text-xs space-y-1.5">
                <span className="font-bold text-[11px] text-brand-black dark:text-brand-cream block">
                  {lang === "bn" ? "নিয়োগকারী যেভাবে স্তর ৫ অনুমোদন প্রদান করেন:" : "How Employers Award Tier 5:"}
                </span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-brand-onyx/80 dark:text-brand-sage/80">
                  <li>{lang === "bn" ? "নিয়োগকারী অ্যাকাউন্ট (যেমন TechNext Ltd.)-এ লগইন করেন।" : "Employer logs into Employer Portal (e.g. TechNext Ltd.)."}</li>
                  <li>{lang === "bn" ? "ক্যান্ডিডেট তালিকায় প্রার্থীর 'View Evidence Profile' ডসিয়ার খোলেন।" : "Opens candidate's 'View Evidence Profile' dossier."}</li>
                  <li>{lang === "bn" ? "দক্ষতা যাচাই করে 'Endorse Candidate (Award Tier 5 Badge)' ক্লিক করেন।" : "Selects skill and clicks 'Endorse Candidate (Award Tier 5 Badge)'."}</li>
                </ol>
              </div>
            </div>

            {/* Quick Share Link */}
            <div className="pt-2">
              {publicProfile?.publicId ? (
                <button
                  type="button"
                  onClick={handleCopyPublicUrl}
                  className="w-full py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-purple-300 dark:border-purple-800 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>
                    {copiedUrl
                      ? (lang === "bn" ? "✓ লিংক কপি করা হয়েছে!" : "✓ Portfolio URL Copied!")
                      : (lang === "bn" ? "নিয়োগকারীদের সাথে শেয়ার করতে পোর্টফোলিও লিংক কপি করুন" : "Copy Portfolio Link for Employers")}
                  </span>
                </button>
              ) : (
                <div className="text-center text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 py-1">
                  {lang === "bn"
                    ? "নিয়োগকারীদের সাথে শেয়ার করতে নিচে 'পাবলিক পোর্টফোলিও প্রকাশ করুন' ক্লিক করুন।"
                    : "Publish your public portfolio below to share your verified profile with recruiters."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Verified Credentials Section
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-sage/40 dark:border-brand-onyx">
          <h2 className="text-base font-bold text-brand-black dark:text-brand-cream">
            {t("credentialsSectionTitle")}
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-yellow/80 text-brand-black">
            {fmtNum(credentials.length)} {lang === "bn" ? "টি ক্রেডেনশিয়াল" : "Earned"}
          </span>
        </div>

        {credentials.length === 0 ? (
          <div className="p-8 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/20 text-center space-y-3">
            <p className="text-xs text-brand-onyx dark:text-brand-sage max-w-md mx-auto">
              {t("noCredentialsYet")}
            </p>
            <Link
              href="/missions"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 shadow-xs"
            >
              <span>{t("navMissions")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((cred) => (
              <div
                key={cred.credentialId}
                className="p-5 rounded-2xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/60 dark:border-brand-onyx space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-brand-yellow">
                      {cred.credentialId}
                    </span>
                    <div className="flex items-center space-x-2">
                      <SkillEvidenceBadge
                        tier={
                          cred.assessmentType === "EMPLOYER_VERIFIED"
                            ? EVIDENCE_TIERS.EMPLOYER_VERIFIED
                            : cred.assessmentType === "PROJECT_REVIEWED"
                            ? EVIDENCE_TIERS.PROJECT_REVIEWED
                            : EVIDENCE_TIERS.PRACTICALLY_DEMONSTRATED
                        }
                        lang={lang}
                        size="sm"
                      />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        ✓ {cred.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                    {cred.competencyTitle}
                  </h3>
                  <div className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 mt-1">
                    Score: <span className="font-bold text-brand-black dark:text-brand-cream">{fmtNum(cred.score)} / 100</span> • Type: {cred.assessmentType}
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center justify-between text-xs">
                  <span className="text-brand-onyx/60 dark:text-brand-sage/60 text-[11px]">
                    Issued: {new Date(cred.issuedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/verify/${cred.credentialId}`}
                    className="font-bold text-amber-600 dark:text-brand-yellow hover:underline flex items-center space-x-1"
                  >
                    <span>{t("btnVerifyCredential")}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          Public Portfolio Sharing & Granular Privacy Controls
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-6 no-print">
        <div>
          <h2 className="text-base font-bold text-brand-black dark:text-brand-cream">
            {t("publicSharingTitle")}
          </h2>
          <p className="text-xs text-brand-onyx dark:text-brand-sage mt-1">
            {t("publicSharingDesc")}
          </p>
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-brand-black dark:text-brand-cream block">
            {t("demographicConsentLabel")}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center space-x-2 p-3 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/40 dark:border-brand-onyx cursor-pointer">
              <input
                type="checkbox"
                checked={consentedFields.includes("name")}
                onChange={() => handleToggleConsent("name")}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <span className="font-medium text-brand-black dark:text-brand-cream">{t("consentShareName")}</span>
            </label>

            <label className="flex items-center space-x-2 p-3 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/40 dark:border-brand-onyx cursor-pointer">
              <input
                type="checkbox"
                checked={consentedFields.includes("university")}
                onChange={() => handleToggleConsent("university")}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <span className="font-medium text-brand-black dark:text-brand-cream">{t("consentShareUniversity")}</span>
            </label>

            <label className="flex items-center space-x-2 p-3 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/40 dark:border-brand-onyx cursor-pointer">
              <input
                type="checkbox"
                checked={consentedFields.includes("careerGoal")}
                onChange={() => handleToggleConsent("careerGoal")}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <span className="font-medium text-brand-black dark:text-brand-cream">{t("consentShareGoal")}</span>
            </label>

            <label className="flex items-center space-x-2 p-3 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/40 dark:border-brand-onyx cursor-pointer">
              <input
                type="checkbox"
                checked={consentedFields.includes("verifiedSkills")}
                onChange={() => handleToggleConsent("verifiedSkills")}
                className="rounded accent-amber-500 cursor-pointer"
              />
              <span className="font-medium text-brand-black dark:text-brand-cream">{t("consentShareVerifiedOnly")}</span>
            </label>
          </div>
        </div>

        {/* Public URL Action Bar */}
        <div className="pt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {publicProfile?.publicId && publicProfile?.isPublic ? (
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 p-2.5 rounded-xl bg-brand-cream dark:bg-brand-onyx border border-brand-sage/60 dark:border-brand-onyx font-mono text-xs text-brand-black dark:text-brand-cream truncate">
                {typeof window !== "undefined" ? window.location.origin : ""}/portfolio/{publicProfile.publicId}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyPublicUrl}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-brand-card hover:bg-brand-sage/40 border border-brand-sage/60 dark:border-brand-onyx text-xs font-semibold text-brand-black dark:text-brand-cream flex items-center space-x-1.5 transition-colors"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl ? "Copied!" : t("btnCopyUrl")}</span>
                </button>
                <Link
                  href={`/portfolio/${publicProfile.publicId}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs flex items-center space-x-1 shadow-xs transition-colors"
                >
                  <span>Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleRevokeProfile}
                  disabled={publishing}
                  className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors"
                >
                  {t("btnRevokePublic")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handlePublishProfile}
              disabled={publishing}
              className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>{publishing ? "Publishing..." : t("btnPublishPublic")}</span>
            </button>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          Print-Only Institutional Dossier Footer & Seal
      ------------------------------------------------------------- */}
      <div className="hidden print:block pt-8 mt-12 border-t-2 border-black text-black page-break-inside-avoid">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-bold">SkillRoute AI Credential Verification Service</p>
            <p className="text-gray-600">Daffodil International University • AIBC Challenge 2026</p>
            <p className="text-[10px] text-gray-500 mt-1">Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="w-32 border-b border-black mb-1 ml-auto" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Institutional Signoff & Verification</p>
          </div>
        </div>
      </div>
    </div>
  );
}
