"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  Briefcase, 
  Building2, 
  Search, 
  Filter, 
  Award, 
  CheckCircle2, 
  UserPlus, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Layers, 
  Sparkles,
  ExternalLink,
  Eye,
  Mail,
  GraduationCap,
  X,
  UserCheck,
  FileText,
  Check
} from "lucide-react";
import { SkillEvidenceBadge } from "@/components/SkillEvidenceBadge";
import { resolveSkillEvidenceTier, EVIDENCE_TIERS } from "@/logic/evidenceTier";

export default function EmployerPortalPage() {
  const { lang, t, fmtNum, user } = useApp();

  const [activeTab, setActiveTab] = useState<"candidates" | "jobs" | "pipeline">("candidates");

  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [shortlists, setShortlists] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Candidate Details Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [shortlistToast, setShortlistToast] = useState<{ message: string; candidateName?: string } | null>(null);

  // Endorsement within candidate details modal
  const [endorseSkill, setEndorseSkill] = useState("sql");
  const [isEndorsing, setIsEndorsing] = useState(false);
  const [endorseSuccessMsg, setEndorseSuccessMsg] = useState<string | null>(null);

  // New Job Form State
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobCategory, setJobCategory] = useState("data");
  const [creatingJob, setCreatingJob] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
    fetchShortlists();
  }, [selectedTrack]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const url = selectedTrack !== "ALL"
        ? `/api/employer/candidates?careerTrack=${selectedTrack}`
        : "/api/employer/candidates";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error("Fetch candidates error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/employer/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
    }
  };

  const fetchShortlists = async () => {
    try {
      const res = await fetch("/api/employer/shortlist");
      if (res.ok) {
        const data = await res.json();
        setShortlists(data.shortlists || []);
      }
    } catch (err) {
      console.error("Fetch shortlists error:", err);
    }
  };

  const handleShortlistCandidate = async (candidate: any) => {
    const candidateId = typeof candidate === "object" ? candidate.id : candidate;
    const candidateName = typeof candidate === "object" ? candidate.name : "Candidate";
    try {
      const res = await fetch("/api/employer/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateUserId: candidateId,
          status: "SHORTLISTED",
          recruiterNotes: "Candidate demonstrates verified competency from Mission Arena practical assessment.",
        }),
      });
      if (res.ok) {
        await fetchShortlists();
        setShortlistToast({
          message:
            lang === "bn"
              ? `✓ প্রার্থী ${candidateName}-কে সফলভাবে শর্টলিস্টেড করা হয়েছে এবং নিয়োগ পাইপলাইনে যোগ করা হয়েছে!`
              : `✓ Candidate ${candidateName} successfully shortlisted and added to your recruitment pipeline!`,
          candidateName,
        });
        setTimeout(() => {
          setShortlistToast(null);
        }, 5000);
      }
    } catch (err) {
      console.error("Shortlist error:", err);
    }
  };

  const isCandidateShortlisted = (candidateId: string) => {
    return shortlists.some((s) => s.userId === candidateId || s.user?.id === candidateId);
  };

  const handleEndorseCandidate = async (candidate: any) => {
    if (!candidate) return;
    setIsEndorsing(true);
    setEndorseSuccessMsg(null);
    try {
      const selectedSkill = endorseSkill.toLowerCase();
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: candidate.id,
          skillId: selectedSkill,
          competencyTitle: `${selectedSkill.toUpperCase()}: Technical Recruiter Endorsement (TechNext Ltd.)`,
          assessmentType: "EMPLOYER_VERIFIED",
          score: 98,
          notes: "Direct candidate competency validation and technical endorsement by TechNext Ltd. talent acquisition.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const successMsg =
          lang === "bn"
            ? `🏆 ${candidate.name}-কে ${selectedSkill.toUpperCase()} এর জন্য সফলভাবে সত্যায়িত করা হয়েছে! স্তর ৫ নিয়োগকারী সত্যায়িত ব্যাজ প্রদান করা হলো।`
            : `🏆 Successfully endorsed ${candidate.name} for ${selectedSkill.toUpperCase()}! Tier 5 Employer Verified badge awarded.`;
        setEndorseSuccessMsg(successMsg);
        setShortlistToast({ message: successMsg, candidateName: candidate.name });

        // Update selected candidate's credentials live
        if (data.credential) {
          setSelectedCandidate((prev: any) => ({
            ...prev,
            credentials: [
              data.credential,
              ...(prev.credentials || []).filter((c: any) => c.credentialId !== data.credential.credentialId),
            ],
          }));
        }

        await fetchCandidates();
      }
    } catch (err) {
      console.error("Endorse candidate error:", err);
    } finally {
      setIsEndorsing(false);
    }
  };

  const handleUpdateStatus = async (candidateUserId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/employer/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateUserId,
          status: newStatus,
        }),
      });
      if (res.ok) {
        fetchShortlists();
        setShortlistToast({
          message: lang === "bn" ? `স্ট্যাটাস আপডেট করা হয়েছে: ${newStatus}` : `Status updated to: ${newStatus}`,
        });
        setTimeout(() => setShortlistToast(null), 4000);
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingJob(true);
    try {
      const res = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDesc,
          careerCategory: jobCategory,
          requirements: [
            { skillId: "sql", targetLevel: 3, weight: 3, isRequired: true },
            { skillId: "python", targetLevel: 3, weight: 3, isRequired: true },
          ],
        }),
      });
      if (res.ok) {
        setShowJobModal(false);
        setJobTitle("");
        setJobDesc("");
        fetchJobs();
      }
    } catch (err) {
      console.error("Create job error:", err);
    } finally {
      setCreatingJob(false);
    }
  };

  return (
    <div className="flex-1 max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 w-full space-y-6">
      {/* -------------------------------------------------------------
          Shortlist & Action Confirmation Banner Toast
      ------------------------------------------------------------- */}
      {shortlistToast && (
        <div className="fixed top-20 right-6 z-50 max-w-lg p-4 rounded-2xl bg-white dark:bg-brand-card border-2 border-emerald-500 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-black dark:text-brand-cream">
                {shortlistToast.message}
              </p>
              <button
                onClick={() => {
                  setActiveTab("pipeline");
                  setShortlistToast(null);
                }}
                className="text-[11px] font-extrabold text-amber-600 dark:text-brand-yellow hover:underline mt-0.5 inline-block"
              >
                {lang === "bn" ? "পাইপলাইনে দেখুন →" : "View in Pipeline →"}
              </button>
            </div>
          </div>
          <button
            onClick={() => setShortlistToast(null)}
            className="text-xs text-brand-onyx/60 dark:text-brand-sage/60 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          Employer Organization Banner
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-yellow text-brand-black uppercase tracking-wider">
              Employer Portal
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Organization</span>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
            TechNext Ltd. — Talent Acquisition
          </h1>
          <p className="text-xs text-brand-onyx dark:text-brand-sage mt-0.5">
            Software & Financial Technology • 51-200 Employees • Dhaka, Bangladesh
          </p>
        </div>

        <button
          onClick={() => setShowJobModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 transition-all flex items-center space-x-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t("btnCreateJob")}</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          Tabs Navigation
      ------------------------------------------------------------- */}
      <div className="flex border-b border-brand-sage/50 dark:border-brand-onyx space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === "candidates"
              ? "border-brand-yellow text-brand-black dark:text-brand-yellow"
              : "border-transparent text-brand-onyx/70 dark:text-brand-sage/70 hover:text-brand-black"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{t("tabCandidates")}</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === "jobs"
              ? "border-brand-yellow text-brand-black dark:text-brand-yellow"
              : "border-transparent text-brand-onyx/70 dark:text-brand-sage/70 hover:text-brand-black"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t("tabJobs")} ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pipeline")}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === "pipeline"
              ? "border-brand-yellow text-brand-black dark:text-brand-yellow"
              : "border-transparent text-brand-onyx/70 dark:text-brand-sage/70 hover:text-brand-black"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t("tabPipeline")} ({shortlists.length})</span>
        </button>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: Candidate Discovery & Competency Search
      ------------------------------------------------------------- */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="p-4 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-brand-black dark:text-brand-cream flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{t("filterByTrack")}:</span>
            </span>

            {[
              { id: "ALL", label: "All Pathways" },
              { id: "junior_data_analyst", label: "Data Analyst" },
              { id: "junior_backend_developer", label: "Backend Dev" },
              { id: "junior_frontend_developer", label: "Frontend Dev" },
              { id: "junior_cybersecurity_analyst", label: "Cybersecurity" },
              { id: "junior_ui_ux_designer", label: "UI/UX Design" },
            ].map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTrack === track.id
                    ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black"
                    : "bg-brand-cream/60 dark:bg-brand-onyx text-brand-onyx dark:text-brand-sage hover:bg-brand-sage/40"
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>

          {/* Candidates List */}
          <div className="space-y-4">
            {candidates.map((cand) => {
              const shortlisted = isCandidateShortlisted(cand.id);

              return (
                <div
                  key={cand.id}
                  className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-sage/40 dark:border-brand-onyx gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidate(cand);
                            setEndorseSuccessMsg(null);
                          }}
                          className="font-extrabold text-base text-brand-black dark:text-brand-cream hover:text-amber-600 dark:hover:text-brand-yellow hover:underline transition-colors text-left"
                        >
                          {cand.name}
                        </button>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream">
                          {cand.university}
                        </span>
                      </div>
                      <span className="text-xs text-brand-onyx dark:text-brand-sage">
                        Target Role: <span className="font-bold">{cand.careerTitle}</span> • {cand.department} ({cand.graduationYear})
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-brand-onyx/70 dark:text-brand-sage/70 block">
                          Calculated Fit
                        </span>
                        <span className="font-extrabold text-amber-600 dark:text-brand-yellow text-lg">
                          {fmtNum(cand.matchPercentage)}%
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCandidate(cand);
                          setEndorseSuccessMsg(null);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx hover:bg-brand-sage/40 font-bold text-xs flex items-center space-x-1 shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t("btnViewCandidate")}</span>
                      </button>

                      <button
                        onClick={() => handleShortlistCandidate(cand)}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-xs transition-all ${
                          shortlisted
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                            : "bg-brand-yellow hover:bg-amber-400 text-brand-black"
                        }`}
                      >
                        {shortlisted ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{t("btnShortlisted")}</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{t("btnShortlist")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Demonstrated Evidence Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-brand-black dark:text-brand-cream block mb-1.5">
                        Verified Credentials & Practical Proof:
                      </span>
                      {cand.credentials?.length > 0 ? (
                        <div className="space-y-1.5">
                          {cand.credentials.map((cred: any) => (
                            <div
                              key={cred.credentialId}
                              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{cred.competencyTitle}</span>
                                {cred.assessmentType === "EMPLOYER_VERIFIED" && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-900">
                                    Tier 5
                                  </span>
                                )}
                                {cred.assessmentType === "PROJECT_REVIEWED" && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-900">
                                    Tier 4
                                  </span>
                                )}
                              </div>
                              <span className="font-bold">{cred.score}/100</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-brand-onyx/60 dark:text-brand-sage/60 text-[11px]">
                          No platform credentials verified yet.
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-brand-black dark:text-brand-cream block mb-1.5">
                        Reported Skill Levels:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(cand.skills || {}).map(([s, lvl]: any) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-brand-cream/60 dark:bg-brand-onyx/50 border border-brand-sage/40 text-[11px] font-medium"
                          >
                            {s.toUpperCase()}: {lvl}/5
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: Job Listings
      ------------------------------------------------------------- */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-brand-sage/40 dark:border-brand-onyx">
                <div>
                  <h3 className="text-base font-bold text-brand-black dark:text-brand-cream">
                    {job.title}
                  </h3>
                  <span className="text-xs text-brand-onyx dark:text-brand-sage">
                    {job.location} • {job.employmentType} {job.salaryRange && `• ${job.salaryRange}`}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {job.status}
                </span>
              </div>

              <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
                {job.description}
              </p>

              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block mb-1">
                  Required Competency Standards:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements?.map((req: any) => (
                    <span
                      key={req.id}
                      className="px-2 py-0.5 rounded bg-brand-cream dark:bg-brand-onyx text-[11px] font-semibold border border-brand-sage/50"
                    >
                      {req.skillId.toUpperCase()} ≥ Level {req.targetLevel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: Recruitment Pipeline
      ------------------------------------------------------------- */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          {shortlists.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-brand-card text-center text-xs text-brand-onyx dark:text-brand-sage">
              No candidates shortlisted yet. Use the Candidate Discovery tab to shortlist talent.
            </div>
          ) : (
            shortlists.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-brand-sage/40 dark:border-brand-onyx gap-2">
                  <div>
                    <span className="font-extrabold text-sm text-brand-black dark:text-brand-cream">
                      {item.user?.name}
                    </span>
                    <span className="text-xs text-brand-onyx dark:text-brand-sage block">
                      {item.user?.studentProfile?.university} • Goal: {item.user?.studentProfile?.careerGoal}
                    </span>
                  </div>

                  {/* Status Progression Selector */}
                  <div className="flex items-center space-x-1.5">
                    {["REVIEWING", "SHORTLISTED", "INTERVIEWING", "OFFERED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(item.user.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          item.status === st
                            ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black shadow-xs"
                            : "bg-brand-cream/60 dark:bg-brand-onyx text-brand-onyx dark:text-brand-sage hover:bg-brand-sage/40"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-brand-onyx dark:text-brand-sage">
                  <span className="font-semibold">Recruiter Notes:</span> {item.recruiterNotes || "Verified candidate."}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          CANDIDATE DETAILS MODAL (Evidence Dossier)
      ------------------------------------------------------------- */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-brand-sage/40 dark:border-brand-onyx">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-black text-brand-black dark:text-brand-cream tracking-tight">
                    {selectedCandidate.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-yellow text-brand-black">
                    DIU Verified
                  </span>
                </div>
                <p className="text-xs text-brand-onyx dark:text-brand-sage mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedCandidate.university} • {selectedCandidate.department} ({selectedCandidate.graduationYear})</span>
                  </span>
                  <span>•</span>
                  <span>Status: <strong className="text-brand-black dark:text-brand-cream">{selectedCandidate.educationStatus}</strong></span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>{selectedCandidate.email}</span>
                  </span>
                </p>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl bg-brand-cream/80 dark:bg-brand-onyx text-brand-onyx dark:text-brand-sage hover:text-black dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Endorsement Success Toast */}
            {endorseSuccessMsg && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-400 text-purple-900 dark:text-purple-200 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span>{endorseSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setEndorseSuccessMsg(null)}
                  className="text-xs underline hover:opacity-75 font-semibold ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Employability Fit & Role Metric */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  Target Career Role
                </span>
                <div className="text-base font-extrabold text-brand-black dark:text-brand-cream">
                  {selectedCandidate.careerTitle}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx">
                <span className="text-[10px] uppercase font-bold text-brand-onyx/70 dark:text-brand-sage/70 block mb-1">
                  Employability Fit Score
                </span>
                <div className="text-2xl font-black text-amber-600 dark:text-brand-yellow">
                  {fmtNum(selectedCandidate.matchPercentage)}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx">
                <span className="text-[10px] uppercase font-bold text-brand-onyx/70 dark:text-brand-sage/70 block mb-1">
                  Weekly Study Availability
                </span>
                <div className="text-base font-extrabold text-brand-black dark:text-brand-cream">
                  {selectedCandidate.weeklyStudyHours} hrs/week
                </div>
              </div>
            </div>

            {/* Recruiter Action: Award Tier 5 Endorsement */}
            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-purple-300 dark:border-purple-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-extrabold text-sm text-purple-900 dark:text-purple-200">
                    Award Tier 5: Employer Verified Endorsement
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                  Institutional Endorsement
                </span>
              </div>
              <p className="text-xs text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                As an authorized tech recruiter, endorsing this student officially grants them the Tier 5 Employer Verified badge on the institutional blockchain registry.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <select
                  value={endorseSkill}
                  onChange={(e) => setEndorseSkill(e.target.value)}
                  className="w-full sm:w-auto flex-1 px-3 py-2 rounded-xl bg-white dark:bg-brand-card border border-purple-300 dark:border-purple-800 text-xs text-brand-black dark:text-brand-cream font-semibold"
                >
                  <option value="sql">SQL & Relational Databases</option>
                  <option value="python">Python Programming</option>
                  <option value="rest_apis">REST APIs & Backend Engineering</option>
                  <option value="html">Frontend Engineering</option>
                  <option value="log_analysis">Log Analysis & Security SIEM</option>
                  <option value="user_research">User Research & Design</option>
                </select>

                <button
                  onClick={() => handleEndorseCandidate(selectedCandidate)}
                  disabled={isEndorsing}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>
                    {isEndorsing ? "Endorsing Candidate..." : "⚡ Endorse Candidate (Award Tier 5 Badge)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Candidate Competency Matrix & Five-Tier Badges */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Five-Tier Demonstrated Skill Matrix</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(selectedCandidate.skills || {}).map(([skill, lvl]: any) => {
                  const tierInfo = resolveSkillEvidenceTier(skill, selectedCandidate.credentials || []);

                  return (
                    <div
                      key={skill}
                      className="p-3.5 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-brand-black dark:text-brand-cream uppercase">
                          {skill.replace("_", " ")}
                        </span>
                        <SkillEvidenceBadge tier={tierInfo} lang={lang} size="sm" />
                      </div>
                      <div className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 pt-1 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center justify-between">
                        <span>Self-Claimed:</span>
                        <strong className="text-brand-black dark:text-brand-cream">{lvl} / 5</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verified Platform Credentials */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Verified Credentials ({selectedCandidate.credentials?.length || 0})</span>
              </h3>

              {selectedCandidate.credentials?.length === 0 ? (
                <p className="text-xs text-brand-onyx/60 dark:text-brand-sage/60 italic">
                  No verified credentials earned yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedCandidate.credentials.map((cred: any) => (
                    <div
                      key={cred.credentialId}
                      className="p-3 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-brand-yellow">
                            {cred.credentialId}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Score: {cred.score}/100
                          </span>
                        </div>
                        <span className="font-semibold text-brand-black dark:text-brand-cream block mt-0.5">
                          {cred.competencyTitle}
                        </span>
                      </div>

                      <Link
                        href={`/verify/${cred.credentialId}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg bg-brand-black text-brand-yellow text-xs font-bold flex items-center space-x-1 hover:opacity-90 transition-opacity"
                      >
                        <span>Verify Record</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleShortlistCandidate(selectedCandidate)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all ${
                    isCandidateShortlisted(selectedCandidate.id)
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                      : "bg-brand-yellow hover:bg-amber-400 text-brand-black"
                  }`}
                >
                  {isCandidateShortlisted(selectedCandidate.id) ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t("btnShortlisted")}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{t("btnShortlist")}</span>
                    </>
                  )}
                </button>

                {selectedCandidate.publicProfileId && (
                  <Link
                    href={`/portfolio/${selectedCandidate.publicProfileId}`}
                    target="_blank"
                    className="px-4 py-2.5 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx text-xs font-bold hover:bg-brand-sage/40 flex items-center space-x-1.5"
                  >
                    <span>View Public Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                  </Link>
                )}
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl bg-brand-cream/80 dark:bg-brand-onyx text-brand-black dark:text-brand-cream text-xs font-semibold hover:bg-brand-sage/50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          JOB CREATION MODAL
      ------------------------------------------------------------- */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-brand-sage/40 dark:border-brand-onyx">
              <h3 className="text-base font-bold text-brand-black dark:text-brand-cream">
                {t("btnCreateJob")}
              </h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-brand-onyx/60 dark:text-brand-sage/60 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-brand-black dark:text-brand-cream block mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/60 dark:border-brand-onyx"
                  placeholder="e.g. Associate SQL / BI Data Analyst"
                />
              </div>

              <div>
                <label className="font-bold text-brand-black dark:text-brand-cream block mb-1">
                  Category Track
                </label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/60 dark:border-brand-onyx"
                >
                  <option value="data">Data Analytics</option>
                  <option value="software">Software Engineering</option>
                  <option value="security">Cybersecurity</option>
                  <option value="design">UI/UX Design</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-brand-black dark:text-brand-cream block mb-1">
                  Description & Requirements
                </label>
                <textarea
                  rows={4}
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/60 dark:border-brand-onyx"
                  placeholder="Describe role responsibilities and verified competency expectations..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl bg-brand-cream dark:bg-brand-onyx text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJob}
                  className="px-4 py-2 rounded-xl bg-brand-yellow text-brand-black text-xs font-bold hover:bg-amber-400"
                >
                  {creatingJob ? "Creating..." : "Publish Job Requirement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
