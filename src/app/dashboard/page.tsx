"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { CAREER_CATALOG } from "@/data/careers";
import { DIAGNOSTIC_QUESTIONS } from "@/data/questions";
import { MISSION_CATALOG } from "@/data/challenges";
import { rankCareers } from "@/logic/careerMatching";
import { calculateLearningEffort } from "@/logic/learningEffort";
import { generateStarterRoadmap } from "@/logic/roadmap";
import { resolveSkillEvidenceTier } from "@/logic/evidenceTier";
import { SkillEvidenceBadge } from "@/components/SkillEvidenceBadge";
import { 
  Compass, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  BookOpen, 
  Award, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  Save, 
  RotateCcw, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  ExternalLink,
  ShieldCheck,
  Trash2,
  Edit2,
  X,
  Code2,
  Terminal,
  FileText,
  Key,
  RefreshCw,
  Lock
} from "lucide-react";

export default function StudentDashboardPage() {
  const { lang, t, fmtNum, user, setUser } = useApp();

  // 4-Step Guided Stepper Workflow State (Step-by-Step Enforced)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<1 | 2 | 3 | 4>(1);

  // Initialize and persist unlocked steps
  useEffect(() => {
    try {
      const savedMax = localStorage.getItem("skillroute_max_step");
      if (savedMax) {
        const val = parseInt(savedMax, 10);
        if (val >= 1 && val <= 4) {
          setMaxUnlockedStep(val as 1 | 2 | 3 | 4);
        }
      }
    } catch (e) {}
  }, []);

  const unlockStep = (stepNumber: 1 | 2 | 3 | 4) => {
    setMaxUnlockedStep((prev) => {
      const next = Math.max(prev, stepNumber) as 1 | 2 | 3 | 4;
      try {
        localStorage.setItem("skillroute_max_step", String(next));
      } catch (e) {}
      return next;
    });
  };

  // Helper to immediately lock future steps whenever skills or profile parameters change on Step 1
  const relockFutureSteps = () => {
    setMaxUnlockedStep(1);
    try {
      localStorage.setItem("skillroute_max_step", "1");
    } catch (e) {}
  };

  const [assessmentSubTab, setAssessmentSubTab] = useState<"mcq" | "practical">("mcq");

  // Student Profile Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // Profile Skills & Availability State
  const [skills, setSkills] = useState<Record<string, number>>({
    python: 3,
    sql: 2,
    excel: 3,
    statistics: 0,
    power_bi: 0,
  });
  const [weeklyHours, setWeeklyHours] = useState(8);
  const [careerGoal, setCareerGoal] = useState("junior_data_analyst");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");

  // Diagnostic State (Starts completely empty by default)
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [diagnosticReport, setDiagnosticReport] = useState<any>(null);
  const [gradingDiag, setGradingDiag] = useState(false);

  // Verified Credentials & Challenge Sessions (for 5-Tier Framework resolution)
  const [credentials, setCredentials] = useState<any[]>([]);
  const [challengeSessions, setChallengeSessions] = useState<any[]>([]);

  // Career Matches State
  const [careerMatches, setCareerMatches] = useState<any[]>([]);

  // Roadmap & Progression State
  const [roadmap, setRoadmap] = useState<any>(null);
  const [studyMinutes, setStudyMinutes] = useState(60);
  const [studyNotes, setStudyNotes] = useState("");
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [totalStudyHours, setTotalStudyHours] = useState(0);

  // AI Guidance & Gemini Configuration State
  const [aiGuidance, setAiGuidance] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputApiKey, setInputApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash-lite");
  const [savingKey, setSavingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState("");
  const [geminiConfig, setGeminiConfig] = useState<{
    hasKey: boolean;
    source: string;
    maskedKey: string;
    model: string;
    availableModels: { id: string; name: string }[];
  }>({
    hasKey: true,
    source: "hardcoded_code",
    maskedKey: "AQ.Ab8...SeUw",
    model: "gemini-3.5-flash-lite",
    availableModels: [],
  });

  // Calculate staleness: detect if current skills or career goal changed compared to AI snapshot
  const isGuidanceStale = React.useMemo(() => {
    if (!aiGuidance) return false;
    if (aiGuidance.isStale) return true;
    if (!aiGuidance.skillsSnapshot) return false;
    const curKeys = Object.keys(skills);
    const snapKeys = Object.keys(aiGuidance.skillsSnapshot);
    if (curKeys.length !== snapKeys.length) return true;
    for (const k of curKeys) {
      if (Number(skills[k]) !== Number(aiGuidance.skillsSnapshot[k])) return true;
    }
    if (aiGuidance.careerGoalSnapshot && aiGuidance.careerGoalSnapshot !== careerGoal) return true;
    return false;
  }, [aiGuidance, skills, careerGoal]);

  // Available skills to add
  const availableSkillsList = [
    { id: "python", name: "Python" },
    { id: "sql", name: "SQL" },
    { id: "excel", name: "Excel / Spreadsheets" },
    { id: "statistics", name: "Statistics & Probability" },
    { id: "power_bi", name: "Power BI" },
    { id: "git", name: "Git & Version Control" },
    { id: "rest_apis", name: "REST APIs" },
    { id: "html", name: "HTML" },
    { id: "css", name: "CSS" },
    { id: "javascript", name: "JavaScript" },
    { id: "networking", name: "Networking" },
    { id: "linux", name: "Linux / OS" },
    { id: "security_fundamentals", name: "Security Fundamentals" },
    { id: "log_analysis", name: "Log Analysis / SIEM" },
    { id: "figma", name: "Figma" },
    { id: "user_research", name: "User Research" },
    { id: "visual_design", name: "Visual Design" },
    { id: "interaction_design", name: "Interaction Design" },
    { id: "design_systems", name: "Design Systems" },
  ];

  // Fetch initial profile, roadmap, and evidence data on mount
  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
    fetchProfile();
    fetchRoadmap();
    fetchStudySessions();
    fetchCredentials();
    fetchGeminiConfig();
  }, [user?.name]);

  const fetchGeminiConfig = async () => {
    try {
      const res = await fetch("/api/ai/config");
      if (res.ok) {
        const data = await res.json();
        setGeminiConfig(data);
        if (data.model) setSelectedModel(data.model);
      }
    } catch (err) {
      console.error("Fetch Gemini config error:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/student/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setSkills(data.profile.skills || {});
          setWeeklyHours(data.profile.weeklyStudyHours || 8);
          setCareerGoal(data.profile.careerGoal || "junior_data_analyst");
          if (data.profile.aiGuidance) {
            setAiGuidance(data.profile.aiGuidance);
          }
        }
        if (data.careerMatches) {
          setCareerMatches(data.careerMatches);
        }
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  const fetchRoadmap = async () => {
    try {
      const res = await fetch("/api/student/roadmap");
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmap(data.roadmap);
        }
      }
    } catch (err) {
      console.error("Fetch roadmap error:", err);
    }
  };

  const fetchStudySessions = async () => {
    try {
      const res = await fetch("/api/student/study-session");
      if (res.ok) {
        const data = await res.json();
        if (data.sessions) {
          setStudySessions(data.sessions);
          setTotalStudyHours(data.totalHours || 0);
        }
      }
    } catch (err) {
      console.error("Fetch study sessions error:", err);
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

  // 1-Click Load Demo Persona (Benchmark A: Python 3, SQL 2, Excel 3, Stats 0, Power BI 0, 8h/wk)
  const handleLoadDemoPersona = async () => {
    const demoSkills = {
      python: 3,
      sql: 2,
      excel: 3,
      statistics: 0,
      power_bi: 0,
    };
    setSkills(demoSkills);
    setWeeklyHours(8);
    setCareerGoal("junior_data_analyst");
    setActiveStep(1);
    setMaxUnlockedStep(1);
    try {
      localStorage.setItem("skillroute_max_step", "1");
    } catch (e) {}

    await saveProfileDirect(demoSkills, 8, "junior_data_analyst");
  };

  // Benchmark B Trigger: Set SQL to 3
  const handleTriggerBenchmarkB = async () => {
    const updated = {
      ...skills,
      sql: 3,
    };
    setSkills(updated);
    await saveProfileDirect(updated, weeklyHours, careerGoal);
  };

  const saveProfileDirect = async (
    targetSkills: Record<string, number>,
    targetHours: number,
    targetGoal: string
  ) => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: targetSkills,
          weeklyStudyHours: targetHours,
          careerGoal: targetGoal,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCareerMatches(data.careerMatches);
        if (data.profile?.aiGuidance) {
          setAiGuidance(data.profile.aiGuidance);
        }
        setProfileSavedMsg(lang === "bn" ? "✓ প্রোফাইল সংরক্ষিত হয়েছে!" : "✓ Profile Saved!");
        setTimeout(() => setProfileSavedMsg(""), 3000);
        // Refresh roadmap
        await fetch("/api/student/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regenerate: true }),
        });
        fetchRoadmap();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSkillLevelChange = (skillId: string, level: number) => {
    setSkills((prev) => {
      if (prev[skillId] === level) return prev;
      relockFutureSteps();
      return {
        ...prev,
        [skillId]: level,
      };
    });
  };

  const handleAddSkill = (skillId: string) => {
    if (!(skillId in skills)) {
      relockFutureSteps();
      setSkills((prev) => ({
        ...prev,
        [skillId]: 1,
      }));
    }
  };

  // Bug 1 Fix: Remove skill from profile
  const handleRemoveSkill = (skillId: string) => {
    relockFutureSteps();
    setSkills((prev) => {
      const next = { ...prev };
      delete next[skillId];
      return next;
    });
  };

  // Bug 6 Fix: Save edited student name
  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 2) {
      setNameError(lang === "bn" ? "নাম অন্তত ২ অক্ষরের হতে হবে।" : "Name must be at least 2 characters.");
      return;
    }
    setSavingName(true);
    setNameError("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
        setIsEditingName(false);
      } else {
        const err = await res.json();
        setNameError(err.error || "Failed to update name");
      }
    } catch (err: any) {
      setNameError(err.message || "Network error");
    } finally {
      setSavingName(false);
    }
  };

  const handleSelectActiveCareer = async (selectedId: string) => {
    setCareerGoal(selectedId);
    // Relock Step 4 so candidate must confirm and click "Continue to Step 4"
    setMaxUnlockedStep((prev) => Math.min(prev, 3) as 1 | 2 | 3 | 4);
    try {
      localStorage.setItem("skillroute_max_step", "3");
    } catch (e) {}
    await saveProfileDirect(skills, weeklyHours, selectedId);
  };

  // Diagnostic Grading
  const handleGradeDiagnostic = async () => {
    setGradingDiag(true);
    try {
      const res = await fetch("/api/student/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswers }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnosticReport(data.report);
      }
    } catch (err) {
      console.error("Diagnostic grade error:", err);
    } finally {
      setGradingDiag(false);
    }
  };

  // Bug 2 Fix: Clear answers button
  const handleClearAnswers = () => {
    setUserAnswers({});
    setDiagnosticReport(null);
  };

  // Demo: Fill All Correct Diagnostic Answers
  const handleFillAllCorrectAnswers = () => {
    const answers: Record<string, number> = {};
    DIAGNOSTIC_QUESTIONS.filter((q) => q.skill_id in skills).forEach((q) => {
      answers[q.question_id] = q.correct_option_index;
    });
    setUserAnswers(answers);
  };

  // Demo: Fill Single Question Correct Answer
  const handleFillSingleCorrectAnswer = (questionId: string) => {
    const q = DIAGNOSTIC_QUESTIONS.find((item) => item.question_id === questionId);
    if (q) {
      setUserAnswers((prev) => ({
        ...prev,
        [questionId]: q.correct_option_index,
      }));
    }
  };

  const [missionSolvingId, setMissionSolvingId] = useState<string | null>(null);
  const [missionSolvedMsg, setMissionSolvedMsg] = useState<Record<string, string>>({});

  const handleOneClickSolveMission = async (mission: any) => {
    if (!mission.fullMarkSolution) return;
    setMissionSolvingId(mission.id);
    try {
      const res = await fetch(`/api/missions/${mission.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission: mission.fullMarkSolution,
          mode: "INDEPENDENT",
          aiNotes: "",
          blurredCount: 0,
          timeSpentSeconds: 45,
        }),
      });
      if (res.ok) {
        setMissionSolvedMsg((prev) => ({
          ...prev,
          [mission.id]: t("missionSolvedSuccess"),
        }));
        await fetchCredentials();
        await fetchProfile();
      }
    } catch (err) {
      console.error("1-click solve mission error:", err);
    } finally {
      setMissionSolvingId(null);
    }
  };

  const handleToggleActivity = async (activityId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // 1. Optimistically update local roadmap state
    setRoadmap((prev: any) => {
      const base = prev || effectiveRoadmap;
      if (!base) return prev;
      const copy = JSON.parse(JSON.stringify(base));
      copy.weeks?.forEach((w: any) => {
        w.activities?.forEach((a: any) => {
          if (a.id === activityId) {
            a.completed = nextStatus;
          }
        });
      });
      return copy;
    });

    // 2. Persist to API
    try {
      const res = await fetch("/api/student/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_ACTIVITY",
          activityId,
          completed: nextStatus,
        }),
      });
      if (res.ok) {
        fetchRoadmap();
      }
    } catch (err) {
      console.error("Toggle activity error:", err);
    }
  };

  const handleLogStudySession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const primarySkill = Object.keys(skills)[0] || "sql";
      const res = await fetch("/api/student/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId: primarySkill,
          durationMinutes: studyMinutes,
          notes: studyNotes,
        }),
      });
      if (res.ok) {
        setStudyNotes("");
        fetchStudySessions();
      }
    } catch (err) {
      console.error("Log session error:", err);
    }
  };

  const handleFetchAiGuidance = async () => {
    setLoadingAi(true);
    setAiSuccessMsg("");
    try {
      const res = await fetch("/api/ai/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerId: careerGoal,
          skills,
          weeklyHours,
          lang,
          apiKey: inputApiKey || undefined,
          model: selectedModel || undefined,
          forceRefresh: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiGuidance(data.guidance);
        setAiSuccessMsg(
          lang === "bn"
            ? "✓ নতুন এআই গাইডেন্স তৈরি এবং প্রোফাইলে সংরক্ষিত হয়েছে!"
            : "✓ Fresh AI guidance generated & saved to profile!"
        );
        setTimeout(() => setAiSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("AI guidance error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveGeminiConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingKey(true);
    setKeyFeedback("");
    try {
      const res = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: inputApiKey,
          model: selectedModel,
          testConnection: true,
          saveToEnv: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setKeyFeedback(lang === "bn" ? "✓ জেমিনাই এপিআই সফলভাবে সংযুক্ত হয়েছে!" : "✓ Gemini API connected successfully!");
        fetchGeminiConfig();
        setTimeout(() => {
          setShowKeyModal(false);
          handleFetchAiGuidance();
        }, 1200);
      } else {
        setKeyFeedback("❌ " + (data.error || "Connection test failed"));
      }
    } catch (err: any) {
      setKeyFeedback("❌ " + (err.message || "Failed to configure key"));
    } finally {
      setSavingKey(false);
    }
  };

  const handleClearGeminiConfig = async () => {
    try {
      await fetch("/api/ai/config", { method: "DELETE" });
      setInputApiKey("");
      fetchGeminiConfig();
      setKeyFeedback(lang === "bn" ? "কী সরানো হয়েছে। ডিটারমিনিস্টিক ইঞ্জিন সক্রিয়।" : "Key removed. Switched to deterministic mode.");
    } catch (err) {}
  };

  const selectedCareer = CAREER_CATALOG.find((c) => c.career_id === careerGoal) || CAREER_CATALOG[0];

  // Pure deterministic client-side calculation fallback
  const computedMatches = React.useMemo(() => {
    return rankCareers(
      CAREER_CATALOG,
      skills,
      (c, l) => calculateLearningEffort(c, l, weeklyHours || 8),
      "match"
    );
  }, [skills, weeklyHours]);

  const effectiveCareerMatches = careerMatches.length > 0 ? careerMatches : computedMatches;
  const targetCareerEval = effectiveCareerMatches.find((m: any) => m.career_id === careerGoal) || computedMatches[0];

  const activeMatchScore = Number(targetCareerEval?.match?.matchPercentage ?? targetCareerEval?.matchPercentage ?? 58.33);
  const activeTotalEffort = Number(targetCareerEval?.effort?.totalEffortHours ?? targetCareerEval?.totalEffortHours ?? 80.0);
  const activeEstimatedWeeks = Number(
    targetCareerEval?.effort?.estimatedWeeks ??
    targetCareerEval?.estimatedWeeks ??
    Math.ceil(activeTotalEffort / Math.max(1, weeklyHours || 8))
  );

  // Client-side starter roadmap fallback
  const effectiveRoadmap = React.useMemo(() => {
    if (roadmap) return roadmap;
    return generateStarterRoadmap(selectedCareer, skills, weeklyHours);
  }, [roadmap, selectedCareer, skills, weeklyHours]);

  // Dynamic progress evaluation across 4-week roadmap activities
  const completedTasksStats = React.useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let completedHours = 0;
    const totalAllocatedHours = effectiveRoadmap?.fourWeekAllocatedHours || 32;

    effectiveRoadmap?.weeks?.forEach((w: any) => {
      w.activities?.forEach((a: any) => {
        totalTasks += 1;
        if (a.completed) {
          completedTasks += 1;
          completedHours += a.hours || 0;
        }
      });
    });

    const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, completedHours, totalAllocatedHours, pct };
  }, [effectiveRoadmap]);

  return (
    <div className="flex-1 w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6">
      {/* -------------------------------------------------------------
          Header Banner & Student Summary (With Inline Name Editing)
      ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-yellow text-brand-black uppercase tracking-wider">
              Student Portal
            </span>
            <span className="text-xs text-brand-onyx/70 dark:text-brand-sage/70 font-medium">
              Daffodil International University • CSE
            </span>
          </div>

          {/* Student Name & Edit Option */}
          <div className="flex items-center space-x-3">
            {isEditingName ? (
              <div className="flex items-center space-x-2 my-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-1 rounded-lg border border-brand-yellow text-sm font-bold bg-white dark:bg-brand-onyx text-brand-black dark:text-brand-cream focus:outline-hidden"
                  placeholder="Enter full name"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="px-3 py-1 rounded-lg bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs shadow-xs"
                >
                  {savingName ? "..." : lang === "bn" ? "সংরক্ষণ" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setNewName(user?.name || "");
                    setNameError("");
                  }}
                  className="p-1 rounded-lg text-brand-onyx/70 hover:text-brand-black dark:text-brand-sage dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
                  {t("studentGreeting", { name: user?.name || "Student Candidate" })}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 rounded-lg text-brand-onyx/60 hover:text-brand-black dark:text-brand-sage/60 dark:hover:text-brand-yellow hover:bg-brand-sage/40 dark:hover:bg-brand-onyx transition-colors"
                  title="Edit your display name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          {nameError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{nameError}</p>}

          <p className="text-xs text-brand-onyx dark:text-brand-sage mt-0.5">
            {t("studentSubtitle")}
          </p>
        </div>

        {/* Quick Benchmark Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadDemoPersona}
            className="px-3 py-1.5 rounded-xl bg-brand-cream dark:bg-brand-onyx hover:bg-brand-sage/50 dark:hover:bg-brand-onyx/80 text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-brand-yellow" />
            <span>⚡ {lang === "bn" ? "বেঞ্চমার্ক A লোড করুন" : "Load Benchmark A"}</span>
          </button>
          <button
            onClick={handleTriggerBenchmarkB}
            className="px-3 py-1.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black text-xs font-bold shadow-xs transition-colors"
          >
            {lang === "bn" ? "SQL ৩/৫ (বেঞ্চমার্ক B)" : "SQL 3/5 (Benchmark B)"}
          </button>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand-sage/30 dark:bg-brand-onyx/50 text-brand-black dark:text-brand-cream border border-brand-sage/40 dark:border-brand-onyx">
            <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-600 dark:text-brand-yellow" />
            <span>{fmtNum(totalStudyHours)} {lang === "bn" ? "ঘণ্টা স্টাডি ট্র্যাকিং" : "hrs logged"}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Guided Step-by-Step Stepper Progress Bar (Step-by-Step Enforced)
      ------------------------------------------------------------- */}
      <div className="p-4 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Step 1 */}
          <button
            onClick={() => setActiveStep(1)}
            className={`p-3 rounded-xl text-left border transition-all flex items-center space-x-3 cursor-pointer ${
              activeStep === 1
                ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black border-transparent shadow-xs"
                : "bg-brand-cream/30 dark:bg-brand-onyx/30 border-brand-sage/50 dark:border-brand-onyx text-brand-onyx dark:text-brand-sage hover:bg-brand-sage/30 hover:border-amber-400"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
              activeStep === 1
                ? "bg-brand-yellow text-brand-black dark:bg-brand-black dark:text-brand-yellow"
                : "bg-brand-sage dark:bg-brand-onyx text-brand-black dark:text-brand-cream"
            }`}>
              {maxUnlockedStep > 1 && activeStep !== 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
            </div>
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                Step 1 {maxUnlockedStep > 1 ? "✓" : ""}
              </span>
              <span className="text-xs font-bold truncate block">{lang === "bn" ? "দক্ষতার প্রোফাইল" : "Skill Profile"}</span>
            </div>
          </button>

          {/* Step 2 */}
          <button
            disabled={maxUnlockedStep < 2}
            onClick={() => maxUnlockedStep >= 2 && setActiveStep(2)}
            title={maxUnlockedStep < 2 ? (lang === "bn" ? "ধাপ ১ সম্পন্ন করে আনলক করুন" : "Complete Step 1 to unlock") : undefined}
            className={`p-3 rounded-xl text-left border transition-all flex items-center space-x-3 ${
              activeStep === 2
                ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black border-transparent shadow-xs cursor-pointer"
                : maxUnlockedStep >= 2
                ? "bg-brand-cream/30 dark:bg-brand-onyx/30 border-brand-sage/50 dark:border-brand-onyx text-brand-onyx dark:text-brand-sage hover:bg-brand-sage/30 hover:border-amber-400 cursor-pointer"
                : "opacity-45 bg-gray-100 dark:bg-brand-onyx/20 border-dashed border-gray-300 dark:border-neutral-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
              activeStep === 2
                ? "bg-brand-yellow text-brand-black dark:bg-brand-black dark:text-brand-yellow"
                : maxUnlockedStep >= 2
                ? "bg-brand-sage dark:bg-brand-onyx text-brand-black dark:text-brand-cream"
                : "bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-gray-500"
            }`}>
              {maxUnlockedStep < 2 ? (
                <Lock className="w-3 h-3" />
              ) : maxUnlockedStep > 2 && activeStep !== 2 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                "2"
              )}
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Step 2</span>
                {maxUnlockedStep < 2 ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-neutral-800 text-gray-500 font-semibold uppercase">
                    {t("stepLocked")}
                  </span>
                ) : maxUnlockedStep > 2 ? (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                ) : null}
              </div>
              <span className="text-xs font-bold truncate block">{lang === "bn" ? "অ্যাসেসমেন্ট হাব" : "Assessment Hub"}</span>
            </div>
          </button>

          {/* Step 3 */}
          <button
            disabled={maxUnlockedStep < 3}
            onClick={() => maxUnlockedStep >= 3 && setActiveStep(3)}
            title={maxUnlockedStep < 3 ? (lang === "bn" ? "ধাপ ২ সম্পন্ন করে আনলক করুন" : "Complete Step 2 to unlock") : undefined}
            className={`p-3 rounded-xl text-left border transition-all flex items-center space-x-3 ${
              activeStep === 3
                ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black border-transparent shadow-xs cursor-pointer"
                : maxUnlockedStep >= 3
                ? "bg-brand-cream/30 dark:bg-brand-onyx/30 border-brand-sage/50 dark:border-brand-onyx text-brand-onyx dark:text-brand-sage hover:bg-brand-sage/30 hover:border-amber-400 cursor-pointer"
                : "opacity-45 bg-gray-100 dark:bg-brand-onyx/20 border-dashed border-gray-300 dark:border-neutral-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
              activeStep === 3
                ? "bg-brand-yellow text-brand-black dark:bg-brand-black dark:text-brand-yellow"
                : maxUnlockedStep >= 3
                ? "bg-brand-sage dark:bg-brand-onyx text-brand-black dark:text-brand-cream"
                : "bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-gray-500"
            }`}>
              {maxUnlockedStep < 3 ? (
                <Lock className="w-3 h-3" />
              ) : maxUnlockedStep > 3 && activeStep !== 3 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                "3"
              )}
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center space-x-1">
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Step 3</span>
                {maxUnlockedStep < 3 ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-neutral-800 text-gray-500 font-semibold uppercase">
                    {t("stepLocked")}
                  </span>
                ) : maxUnlockedStep > 3 ? (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                ) : null}
              </div>
              <span className="text-xs font-bold truncate block">{lang === "bn" ? "ক্যারিয়ার ম্যাচিং" : "Career Matches"}</span>
            </div>
          </button>

          {/* Step 4 */}
          <button
            disabled={maxUnlockedStep < 4}
            onClick={() => maxUnlockedStep >= 4 && setActiveStep(4)}
            title={maxUnlockedStep < 4 ? (lang === "bn" ? "ধাপ ৩ সম্পন্ন করে আনলক করুন" : "Complete Step 3 to unlock") : undefined}
            className={`p-3 rounded-xl text-left border transition-all flex items-center space-x-3 ${
              activeStep === 4
                ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black border-transparent shadow-xs cursor-pointer"
                : maxUnlockedStep >= 4
                ? "bg-brand-cream/30 dark:bg-brand-onyx/30 border-brand-sage/50 dark:border-brand-onyx text-brand-onyx dark:text-brand-sage hover:bg-brand-sage/30 hover:border-amber-400 cursor-pointer"
                : "opacity-45 bg-gray-100 dark:bg-brand-onyx/20 border-dashed border-gray-300 dark:border-neutral-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
              activeStep === 4
                ? "bg-brand-yellow text-brand-black dark:bg-brand-black dark:text-brand-yellow"
                : maxUnlockedStep >= 4
                ? "bg-brand-sage dark:bg-brand-onyx text-brand-black dark:text-brand-cream"
                : "bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-gray-500"
            }`}>
              {maxUnlockedStep < 4 ? (
                <Lock className="w-3 h-3" />
              ) : (
                "4"
              )}
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Step 4</span>
                  {maxUnlockedStep < 4 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-neutral-800 text-gray-500 font-semibold uppercase">
                      {t("stepLocked")}
                    </span>
                  )}
                </div>
                {isGuidanceStale && maxUnlockedStep >= 4 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" title="AI Update Required" />
                )}
              </div>
              <span className="text-xs font-bold truncate block">{lang === "bn" ? "৪ সপ্তাহের রোডম্যাপ" : "4-Week Roadmap"}</span>
            </div>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Responsive Two-Column Widescreen Layout (Left: Flow, Right: Live Intelligence Deck)
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area (8 Cols on LG/XL, 9 Cols on 2XL) */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-6">
          {/* -------------------------------------------------------------
              STEP 1: Student Skill Profiling & Availability
          ------------------------------------------------------------- */}
          {activeStep === 1 && (
        <div className="space-y-6">
          {/* Step 1 Step Progression Notice */}
          {maxUnlockedStep === 1 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-brand-black dark:text-brand-cream text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-brand-yellow flex-shrink-0" />
              <span>{t("skillsModifiedNotice")}</span>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-brand-sage/40 dark:border-brand-onyx gap-3">
              <div>
                <h2 className="text-lg font-bold text-brand-black dark:text-brand-cream">
                  {lang === "bn" ? "প্রযুক্তিগত দক্ষতার স্ব-প্রতিবেদন (০ - ৫ স্তর)" : "Technical Skill Competencies (0 - 5 Scale)"}
                </h2>
                <p className="text-xs text-brand-onyx dark:text-brand-sage">
                  {lang === "bn"
                    ? "০ (কোনো জ্ঞান নেই) থেকে ৫ (উচ্চতর দক্ষতা) পর্যন্ত প্রতিটি বিষয়ে আপনার বর্তমান দক্ষতা নির্ধারণ করুন।"
                    : "Rate each competence honestly from 0 (No Exposure) to 5 (Advanced)."}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {profileSavedMsg && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                    {profileSavedMsg}
                  </span>
                )}
                <button
                  onClick={() => saveProfileDirect(skills, weeklyHours, careerGoal)}
                  disabled={savingProfile}
                  className="px-4 py-2 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? "Saving..." : t("btnSaveProfile")}</span>
                </button>
              </div>
            </div>

            {/* Skill Rating Cards with 5-Tier Evidence Badges and Delete Option */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {Object.entries(skills).map(([skillId, level]) => {
                const tierInfo = resolveSkillEvidenceTier(skillId, credentials, diagnosticReport, challengeSessions);

                return (
                  <div
                    key={skillId}
                    className="p-4 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-brand-black dark:text-brand-cream uppercase tracking-wider">
                          {skillId.replace("_", " ")}
                        </span>
                        <SkillEvidenceBadge tier={tierInfo} lang={lang} size="sm" />
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-yellow text-brand-black">
                          Level {level} / 5
                        </span>
                        {/* Bug 1 Fix: Remove skill button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skillId)}
                          className="p-1 rounded-md text-brand-onyx/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Remove skill from profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={level}
                      onChange={(e) => handleSkillLevelChange(skillId, parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 font-medium">
                      <span>0: None</span>
                      <span>1: Aware</span>
                      <span>2: Basic</span>
                      <span>3: Guided</span>
                      <span>4: Fluent</span>
                      <span>5: Adv</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add More Skills */}
            <div className="pt-4 border-t border-brand-sage/40 dark:border-brand-onyx">
              <span className="text-xs font-bold text-brand-black dark:text-brand-cream block mb-2">
                {t("addSkillPrompt")}
              </span>
              <div className="flex flex-wrap gap-2">
                {availableSkillsList
                  .filter((s) => !(s.id in skills))
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleAddSkill(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-brand-onyx hover:bg-brand-sage/50 dark:hover:bg-brand-card text-[11px] font-semibold text-brand-black dark:text-brand-cream border border-brand-sage/70 dark:border-brand-onyx flex items-center space-x-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>{s.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Weekly Study Availability Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                {t("weeklyAvailabilityLabel")}
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black">
                {fmtNum(weeklyHours)} {t("hoursUnit")}
              </span>
            </div>
            <p className="text-xs text-brand-onyx dark:text-brand-sage mb-4">
              {t("weeklyAvailabilityHint")}
            </p>

            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={weeklyHours}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val !== weeklyHours) {
                  relockFutureSteps();
                  setWeeklyHours(val);
                }
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex justify-between text-xs text-brand-onyx/70 dark:text-brand-sage/70 font-medium mt-2">
              <span>2 hrs (Casual)</span>
              <span>8 hrs (Standard DIU Student)</span>
              <span>16 hrs (Part-time)</span>
              <span>40 hrs (Intensive)</span>
            </div>
          </div>

          {/* Step 1 Footer Navigation */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={async () => {
                await saveProfileDirect(skills, weeklyHours, careerGoal);
                unlockStep(2);
                setActiveStep(2);
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs flex items-center space-x-2 shadow-xs transition-all"
            >
              <span>{lang === "bn" ? "সংরক্ষণ ও ধাপ ২-এ চলুন (অ্যাসেসমেন্ট হাব)" : "Save & Continue to Step 2: Assessment Hub"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          STEP 2: Unified Assessment Hub (Knowledge MCQ & Practical Missions)
      ------------------------------------------------------------- */}
      {activeStep === 2 && (
        <div className="space-y-6">
          {/* Assessment Mode Sub-tabs */}
          <div className="p-4 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500 dark:text-brand-yellow" />
              <div>
                <h2 className="text-base font-bold text-brand-black dark:text-brand-cream">
                  {lang === "bn" ? "দক্ষতা মূল্যায়ন হাব" : "Skill Assessment Hub"}
                </h2>
                <span className="text-xs text-brand-onyx dark:text-brand-sage">
                  {lang === "bn" ? "তাত্ত্বিক ও প্র্যাকটিক্যাল দুই ধরনের মূল্যায়ন এক ছাতার নিচে" : "Evaluate theoretical knowledge and optional hands-on missions"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 p-1 rounded-xl bg-brand-cream dark:bg-brand-onyx border border-brand-sage/50 dark:border-brand-onyx">
              <button
                type="button"
                onClick={() => setAssessmentSubTab("mcq")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  assessmentSubTab === "mcq"
                    ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black shadow-xs"
                    : "text-brand-onyx dark:text-brand-cream hover:bg-brand-sage/40"
                }`}
              >
                {lang === "bn" ? "তাত্ত্বিক জ্ঞান যাচাই (MCQ)" : "Knowledge MCQ Diagnostic"}
              </button>
              <button
                type="button"
                onClick={() => setAssessmentSubTab("practical")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  assessmentSubTab === "practical"
                    ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black shadow-xs"
                    : "text-brand-onyx dark:text-brand-cream hover:bg-brand-sage/40"
                }`}
              >
                {lang === "bn" ? "প্র্যাকটিক্যাল মিশন (ঐচ্ছিক)" : "Mission Arena (Practical)"}
              </button>
            </div>
          </div>

          {/* SUB-TAB A: Knowledge Assessment (Diagnostic MCQ Check) */}
          {assessmentSubTab === "mcq" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-sage/40 dark:border-brand-onyx gap-3">
                <div>
                  <h3 className="text-base font-bold text-brand-black dark:text-brand-cream">
                    {t("diagnosticTitle")}
                  </h3>
                  <p className="text-xs text-brand-onyx dark:text-brand-sage">
                    {t("diagnosticSubtitle")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Demo: 1-Click Fill All Correct Answers */}
                  <button
                    type="button"
                    onClick={handleFillAllCorrectAnswers}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-brand-yellow border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
                    title="Fill all correct answers across all questions for rapid demonstration"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-brand-yellow" />
                    <span>⚡ {t("btnFillAllCorrect")}</span>
                  </button>

                  {/* Bug 2 Fix: Clear answers button */}
                  <button
                    type="button"
                    onClick={handleClearAnswers}
                    className="px-3 py-1.5 rounded-xl bg-brand-cream dark:bg-brand-onyx hover:bg-brand-sage/40 text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === "bn" ? "উত্তর পরিষ্কার করুন" : "Clear Answers"}</span>
                  </button>
                  <button
                    onClick={handleGradeDiagnostic}
                    disabled={gradingDiag || Object.keys(userAnswers).length === 0}
                    className="px-4 py-2 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 transition-all shadow-xs disabled:opacity-50"
                  >
                    {gradingDiag ? "Evaluating..." : t("btnSubmitDiagnostic")}
                  </button>
                </div>
              </div>

              {/* Diagnostic Validity Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-brand-yellow" />
                <span>{t("diagnosticNotice")}</span>
              </div>

              {/* Observational Evidence Output Box (if graded) */}
              {diagnosticReport && (
                <div className="p-4 rounded-xl bg-brand-cream/60 dark:bg-brand-onyx/50 border border-brand-sage dark:border-brand-onyx space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-brand-black dark:text-brand-cream uppercase tracking-wider">
                      {t("diagnosticScore", {
                        score: `${diagnosticReport.correctCount}/${diagnosticReport.totalQuestions}`,
                        pct: fmtNum(Math.round(diagnosticReport.overallAccuracy * 100)),
                      })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.values(diagnosticReport.skillEvidence || {}).map((ev: any) => (
                      <div
                        key={ev.skill_id}
                        className="p-2.5 rounded-lg bg-white dark:bg-brand-card border border-brand-sage/50 dark:border-brand-onyx flex items-center justify-between"
                      >
                        <span className="font-bold text-brand-black dark:text-brand-cream uppercase">
                          {ev.skill_id}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream">
                          {lang === "bn" ? ev.label_bn : ev.label_en} ({ev.correctCount}/{ev.totalQuestions})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Questions List */}
              <div className="space-y-6">
                {DIAGNOSTIC_QUESTIONS.filter((q) => q.skill_id in skills).map((q, idx) => (
                  <div
                    key={q.question_id}
                    className="p-5 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-sage/50 dark:bg-brand-onyx text-brand-black dark:text-brand-cream uppercase">
                          {q.skill_name}
                        </span>
                        {userAnswers[q.question_id] === q.correct_option_index && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{t("lblCorrectAnswerSelected")}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {userAnswers[q.question_id] !== q.correct_option_index && (
                          <button
                            type="button"
                            onClick={() => handleFillSingleCorrectAnswer(q.question_id)}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-brand-yellow border border-amber-500/30 flex items-center space-x-1 transition-all"
                            title="Select the verified correct answer for this question"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500 dark:text-brand-yellow" />
                            <span>⚡ {t("btnFillCorrect")}</span>
                          </button>
                        )}
                        <span className="text-[11px] text-brand-onyx/60 dark:text-brand-sage/60 font-medium">
                          {t("questionLabel", { current: fmtNum(idx + 1), total: fmtNum(DIAGNOSTIC_QUESTIONS.filter((item) => item.skill_id in skills).length) })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-brand-black dark:text-brand-cream leading-relaxed">
                      {lang === "bn" && q.question_bn ? q.question_bn : q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt: string, optIdx: number) => {
                        const selected = userAnswers[q.question_id] === optIdx;
                        const optText = lang === "bn" && q.options_bn ? q.options_bn[optIdx] : opt;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setUserAnswers((prev) => ({ ...prev, [q.question_id]: optIdx }))}
                            className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${
                              selected
                                ? "bg-brand-yellow/20 dark:bg-brand-yellow/10 border-brand-yellow text-brand-black dark:text-brand-yellow font-bold"
                                : "bg-white dark:bg-brand-card border-brand-sage/60 dark:border-brand-onyx text-brand-onyx dark:text-brand-sage hover:bg-brand-cream/60 dark:hover:bg-brand-onyx"
                            }`}
                          >
                            <span>{optText}</span>
                            {selected && <Check className="w-4 h-4 text-amber-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB B: Practical Assessment (Mission Arena - Optional) */}
          {assessmentSubTab === "practical" && (
            <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-6">
              <div className="pb-4 border-b border-brand-sage/40 dark:border-brand-onyx flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tier 3 Practical Credentials (Optional)</span>
                  </div>
                  <h3 className="text-base font-bold text-brand-black dark:text-brand-cream">
                    {lang === "bn" ? "প্র্যাকটিক্যাল মিশন এরিনা" : "SkillRoute Mission Arena"}
                  </h3>
                  <p className="text-xs text-brand-onyx dark:text-brand-sage">
                    {lang === "bn"
                      ? "বাস্তব কাজের পরিবেশে সিমুলেটেড প্র্যাকটিক্যাল কোডিং ও অ্যানালিটিক্স সমাধান করুন। এটি ঐচ্ছিক—আপনি এখনই সমাধান করতে পারেন অথবা পরেও করতে পারেন।"
                      : "Solve simulated real-world practical challenges in safe sandboxed environments. Optional: solve now or return later."}
                  </p>
                </div>
              </div>

              {/* Mission Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MISSION_CATALOG.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/60 dark:border-brand-onyx space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-yellow text-brand-black uppercase">
                          {m.category}
                        </span>
                        <span className="text-xs text-brand-onyx/70 dark:text-brand-sage/70 font-medium">
                          Passing: {fmtNum(m.passingScore)}%
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                        {lang === "bn" && m.title_bn ? m.title_bn : m.title}
                      </h4>
                      <p className="text-xs text-brand-onyx dark:text-brand-sage line-clamp-2 mt-1">
                        {lang === "bn" && m.scenario_bn ? m.scenario_bn : m.scenario}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-brand-sage/40 dark:border-brand-onyx flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-[11px] text-brand-onyx/60 dark:text-brand-sage/60 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>~{m.estimatedMinutes} mins</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOneClickSolveMission(m)}
                          disabled={missionSolvingId === m.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-brand-yellow border border-amber-500/40 text-xs font-bold flex items-center space-x-1 transition-all"
                          title="1-Click solve practical mission for demo and issue Tier 3 credential"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-brand-yellow" />
                          <span>{missionSolvingId === m.id ? "Solving..." : `⚡ ${t("btnOneClickSolveMission")}`}</span>
                        </button>

                        <Link
                          href={`/missions/${m.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black font-bold text-xs hover:opacity-90 flex items-center space-x-1.5 shadow-xs transition-all"
                        >
                          <span>{lang === "bn" ? "মিশনে প্রবেশ করুন" : "Open Mission Arena"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {missionSolvedMsg[m.id] && (
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1.5 border border-emerald-300 dark:border-emerald-800">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{missionSolvedMsg[m.id]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 Footer Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream text-xs font-semibold hover:bg-brand-sage/40 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "ধাপ ১: দক্ষতায় ফিরুন" : "Back to Step 1: Skills"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                unlockStep(3);
                setActiveStep(3);
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
            >
              <span>{lang === "bn" ? "ধাপ ৩-এ চলুন (ক্যারিয়ার ম্যাচিং)" : "Continue to Step 3: Career Matches"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          STEP 3: Career Pathway Matches & Skill Gap Analysis
      ------------------------------------------------------------- */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs">
            <div className="pb-4 mb-6 border-b border-brand-sage/40 dark:border-brand-onyx">
              <h2 className="text-lg font-bold text-brand-black dark:text-brand-cream">
                {t("careerMatchesTitle")}
              </h2>
              <p className="text-xs text-brand-onyx dark:text-brand-sage">
                {t("careerMatchesSubtitle")}
              </p>
            </div>

            {/* Career Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {effectiveCareerMatches.map((career: any) => {
                const isSelected = career.career_id === careerGoal;
                const matchPct = Number(career.match?.matchPercentage ?? career.matchPercentage ?? 0);
                const effortHrs = Number(career.effort?.totalEffortHours ?? career.totalEffortHours ?? 0);
                const estWeeks = Number(
                  career.effort?.estimatedWeeks ??
                  career.estimatedWeeks ??
                  Math.ceil(effortHrs / Math.max(1, weeklyHours || 8))
                );
                
                // Calculate missing skill gaps for this career
                const gapsCount = Array.isArray(career.skills)
                  ? career.skills.filter((req: any) => (skills[req.skill_id] || 0) < req.target_level).length
                  : (career.missingSkills?.length || 0);

                return (
                  <div
                    key={career.career_id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-brand-cream/60 dark:bg-brand-onyx/60 border-brand-yellow shadow-md"
                        : "bg-white dark:bg-brand-card border-brand-sage/60 dark:border-brand-onyx"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black uppercase">
                          {career.category}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-amber-600 dark:text-brand-yellow">
                            {fmtNum(matchPct)}%
                          </span>
                          <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 block -mt-1">
                            {t("matchScoreLabel")}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-brand-black dark:text-brand-cream">
                        {lang === "bn" && career.title_bn ? career.title_bn : career.title}
                      </h3>
                      <p className="text-xs text-brand-onyx dark:text-brand-sage mt-1 leading-relaxed">
                        {lang === "bn" && career.description_bn ? career.description_bn : career.description}
                      </p>

                      {/* Effort and Duration Metrics */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
                        <div className="p-2.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/40 dark:border-brand-onyx">
                          <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 block uppercase">
                            {t("estimatedEffortLabel")}
                          </span>
                          <span className="text-sm font-bold text-brand-black dark:text-brand-cream">
                            {fmtNum(effortHrs)} {lang === "bn" ? "ঘণ্টা" : "hrs"}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/40 dark:border-brand-onyx">
                          <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 block uppercase">
                            {t("estimatedDurationLabel")}
                          </span>
                          <span className="text-sm font-bold text-brand-black dark:text-brand-cream">
                            {fmtNum(estWeeks)} {t("weeksUnit")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-brand-sage/40 dark:border-brand-onyx flex items-center justify-between">
                      <button
                        onClick={() => handleSelectActiveCareer(career.career_id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-brand-yellow text-brand-black"
                            : "bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream hover:bg-brand-sage/50"
                        }`}
                      >
                        {isSelected ? (lang === "bn" ? "✓ সক্রিয় ক্যারিয়ার লক্ষ্য" : "✓ Active Target Track") : (lang === "bn" ? "ক্যারিয়ার লক্ষ্য নির্ধারণ করুন" : "Select as Career Goal")}
                      </button>

                      <span className="text-xs text-brand-onyx/70 dark:text-brand-sage/70 font-medium">
                        {fmtNum(gapsCount)} {lang === "bn" ? "টি ঘাটতি বাকি" : "gaps remaining"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Skill Gap Analysis Box */}
            <div className="p-5 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/50 dark:border-brand-onyx space-y-4">
              <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream uppercase tracking-wider">
                {t("skillGapTitle")} • {lang === "bn" && selectedCareer.title_bn ? selectedCareer.title_bn : selectedCareer.title}
              </h3>

              <div className="space-y-3">
                {selectedCareer.skills.map((req) => {
                  const currentLevel = skills[req.skill_id] || 0;
                  const gap = Math.max(0, req.target_level - currentLevel);
                  const isMet = currentLevel >= req.target_level;
                  const tierInfo = resolveSkillEvidenceTier(req.skill_id, credentials, diagnosticReport, challengeSessions);

                  return (
                    <div
                      key={req.skill_id}
                      className="p-3 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/50 dark:border-brand-onyx flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-brand-black dark:text-brand-cream uppercase">
                            {req.skill_id.replace("_", " ")}
                          </span>
                          <SkillEvidenceBadge tier={tierInfo} lang={lang} size="sm" />
                        </div>
                        <span className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70 block">
                          Current: {fmtNum(currentLevel)}/5 • Required: {fmtNum(req.target_level)}/5
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isMet ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            ✓ Requirement Satisfied
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Gap: -{fmtNum(gap)} levels
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3 Footer Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream text-xs font-semibold hover:bg-brand-sage/40 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "ধাপ ২: অ্যাসেসমেন্টে ফিরুন" : "Back to Step 2: Assessment"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                unlockStep(4);
                setActiveStep(4);
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all"
            >
              <span>{lang === "bn" ? "ধাপ ৪-এ চলুন (৪ সপ্তাহের রোডম্যাপ)" : "Continue to Step 4: 4-Week Roadmap"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          STEP 4: 4-Week Personalized Roadmap & Progress Tracker
      ------------------------------------------------------------- */}
      {activeStep === 4 && (
        <div className="space-y-6">
          {/* Roadmap Header Summary */}
          {effectiveRoadmap && (
            <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-sage/40 dark:border-brand-onyx">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-yellow text-brand-black uppercase">
                    Active Track
                  </span>
                  <h2 className="text-xl font-extrabold text-brand-black dark:text-brand-cream mt-1">
                    {lang === "bn" && effectiveRoadmap.careerTitleBn ? effectiveRoadmap.careerTitleBn : effectiveRoadmap.careerTitle}
                  </h2>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="text-right">
                    <span className="text-brand-onyx/70 dark:text-brand-sage/70 block uppercase text-[10px] font-bold">
                      {t("starterAllocationLabel")}
                    </span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-brand-yellow">
                      {fmtNum(effectiveRoadmap.fourWeekAllocatedHours)} {t("hoursUnit")}
                    </span>
                  </div>
                  <div className="text-right border-l border-brand-sage/50 dark:border-brand-onyx pl-3">
                    <span className="text-brand-onyx/70 dark:text-brand-sage/70 block uppercase text-[10px] font-bold">
                      {t("remainingEffortLabel")}
                    </span>
                    <span className="text-base font-extrabold text-brand-black dark:text-brand-cream">
                      {fmtNum(effectiveRoadmap.remainingHoursBeyondWeek4)} {t("hoursUnit")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roadmap Progress Status Bar */}
              <div className="p-4 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-brand-yellow/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-brand-yellow">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-brand-yellow block">
                      {t("roadmapProgressTitle")}
                    </span>
                    <span className="text-xs font-bold text-brand-black dark:text-brand-cream">
                      {fmtNum(completedTasksStats.completedTasks)} / {fmtNum(completedTasksStats.totalTasks)} {t("roadmapTasksCompleted")} • {fmtNum(completedTasksStats.completedHours)} / {fmtNum(completedTasksStats.totalAllocatedHours)} {t("hoursUnit")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-1 max-w-xs">
                  <div className="flex-1 h-2.5 rounded-full bg-brand-sage/40 dark:bg-brand-onyx overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${completedTasksStats.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {fmtNum(completedTasksStats.pct)}%
                  </span>
                </div>
              </div>

              {/* 4-Week Tasks Breakdown */}
              <div className="space-y-4">
                {effectiveRoadmap.weeks?.map((week: any) => (
                  <div
                    key={week.weekNumber}
                    className="p-5 rounded-2xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/60 dark:border-brand-onyx space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-brand-yellow text-brand-black font-extrabold text-xs flex items-center justify-center">
                          {fmtNum(week.weekNumber)}
                        </span>
                        <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                          {lang === "bn" && week.focusThemeBn ? week.focusThemeBn : week.focusTheme}
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-brand-onyx dark:text-brand-sage">
                        {fmtNum(week.allocatedHours)} {t("hoursUnit")}
                      </span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {week.activities?.map((act: any) => (
                        <div
                          key={act.id}
                          onClick={() => handleToggleActivity(act.id, !!act.completed)}
                          role="checkbox"
                          aria-checked={!!act.completed}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none group ${
                            act.completed
                              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs"
                              : "bg-white dark:bg-brand-card border-brand-sage/70 dark:border-brand-onyx text-brand-black dark:text-brand-cream hover:border-amber-400 dark:hover:border-brand-yellow/50 hover:bg-amber-50/30 dark:hover:bg-brand-onyx/40"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                                act.completed
                                  ? "bg-emerald-500 border-emerald-600 text-white"
                                  : "border-brand-sage dark:border-brand-onyx bg-white dark:bg-brand-black group-hover:border-amber-500"
                              }`}
                            >
                              {act.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <span
                                className={`text-xs font-semibold block transition-all ${
                                  act.completed ? "line-through opacity-70 text-emerald-800 dark:text-emerald-300" : ""
                                }`}
                              >
                                {lang === "bn" && act.titleBn ? act.titleBn : act.title}
                              </span>
                              <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 font-mono">
                                Skill: {(act.skill_id || act.skillId || "Core").replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {act.completed && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                                {lang === "bn" ? "সম্পন্ন ✓" : "Completed ✓"}
                              </span>
                            )}
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-cream/80 dark:bg-brand-onyx text-brand-black dark:text-brand-cream border border-brand-sage/40 dark:border-brand-onyx">
                              {fmtNum(act.hours)}h
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Session Logger & Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                {t("logSessionTitle")}
              </h3>
              <form onSubmit={handleLogStudySession} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-brand-onyx dark:text-brand-sage block mb-1">
                    {t("logSessionDuration")}
                  </label>
                  <select
                    value={studyMinutes}
                    onChange={(e) => setStudyMinutes(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage dark:border-brand-onyx text-xs text-brand-black dark:text-brand-cream"
                  >
                    <option value={30}>30 mins</option>
                    <option value={60}>60 mins (1 hour)</option>
                    <option value={90}>90 mins</option>
                    <option value={120}>120 mins (2 hours)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-brand-onyx dark:text-brand-sage block mb-1">
                    {t("logSessionNotes")}
                  </label>
                  <input
                    type="text"
                    value={studyNotes}
                    onChange={(e) => setStudyNotes(e.target.value)}
                    placeholder="e.g. Practiced SQL Window Functions & Aggregations"
                    className="w-full p-2.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage dark:border-brand-onyx text-xs text-brand-black dark:text-brand-cream"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs shadow-xs transition-colors"
                >
                  {t("btnLogSession")}
                </button>
              </form>
            </div>

            {/* AI Guidance Coach */}
            <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-brand-yellow uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>{t("aiCoachTitle")}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {geminiConfig.hasKey ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        <span>{geminiConfig.model || "Gemini Live"}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {t("aiFallbackBadge")}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowKeyModal(true)}
                      className="p-1.5 rounded-lg bg-brand-cream/60 dark:bg-brand-onyx/60 hover:bg-brand-cream dark:hover:bg-brand-onyx text-brand-onyx dark:text-brand-sage transition-colors border border-brand-sage/50 dark:border-brand-onyx"
                      title={t("geminiConfigTitle")}
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600 dark:text-brand-yellow" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                    {t("aiCoachSubtitle")}
                  </h3>
                  {aiGuidance && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      {t("aiSavedToProfile")}
                    </span>
                  )}
                </div>

                {/* Staleness Notice: Displayed whenever skills change */}
                {isGuidanceStale && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-brand-yellow mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">
                        {lang === "bn" ? "দক্ষতা প্রোফাইল পরিবর্তিত হয়েছে" : "Skills Profile Modified"}
                      </span>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {t("aiGuidanceStaleNotice")}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Success Feedback */}
                {aiSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{aiSuccessMsg}</span>
                  </div>
                )}

                {/* Detailed Guidance Content */}
                {aiGuidance ? (
                  <div className="mt-2 p-4 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/50 dark:border-brand-onyx text-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-brand-sage/40 dark:border-brand-onyx">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-brand-yellow tracking-wider block">
                          {aiGuidance.model ? `${aiGuidance.model.toUpperCase()} • CANONICAL ADVISOR` : "GEMINI 3.5 FLASH-LITE"}
                        </span>
                        <h4 className="font-extrabold text-brand-black dark:text-brand-cream text-sm mt-0.5">
                          {aiGuidance.heading || t("aiSectionTitle") || "Role Guidance & Learning Strategy"}
                        </h4>
                      </div>
                      <span className="text-[10px] text-brand-onyx/60 dark:text-brand-sage/60 font-mono">
                        {aiGuidance.generatedAt ? new Date(aiGuidance.generatedAt).toLocaleTimeString() : ""}
                      </span>
                    </div>

                    {/* 1. Role Suitability Block */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-brand-yellow tracking-wider block">
                        {t("aiSuitabilityTitle")}
                      </span>
                      <p className="text-brand-onyx dark:text-brand-sage text-xs leading-relaxed">
                        {aiGuidance.suitabilityExplanation || aiGuidance.suitability_explanation || aiGuidance.summary || aiGuidance.text}
                      </p>
                    </div>

                    {/* 2. Prerequisite Priority Block */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-brand-yellow tracking-wider block">
                        {t("aiPriorityTitle")}
                      </span>
                      <p className="text-brand-onyx dark:text-brand-sage text-xs leading-relaxed">
                        {aiGuidance.prioritySummary || aiGuidance.skill_gap_priorities || aiGuidance.gapAnalysis}
                      </p>
                    </div>

                    {/* 3. 4-Week Structured Coaching Grid */}
                    {((aiGuidance.weeklySuggestions && aiGuidance.weeklySuggestions.length > 0) || (aiGuidance.weekly_suggestions && aiGuidance.weekly_suggestions.length > 0)) && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-brand-black dark:text-brand-cream block uppercase tracking-wider">
                          {t("aiWeeklyTipsTitle")}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(aiGuidance.weeklySuggestions || aiGuidance.weekly_suggestions).map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/60 dark:border-brand-onyx space-y-1.5 flex flex-col justify-between"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brand-yellow text-brand-black">
                                    Week {item.week || idx + 1}
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-onyx dark:text-brand-sage">
                                    {item.focus_skill || item.skill || ""}
                                  </span>
                                </div>
                                <p className="text-[11px] text-brand-onyx dark:text-brand-sage leading-relaxed pt-0.5">
                                  {item.study_suggestion || item.practiceAdvice || item.focus || ""}
                                </p>
                              </div>
                              {(item.milestone_exercise || item.milestone) && (
                                <div className="p-1.5 rounded-lg bg-brand-cream/60 dark:bg-brand-onyx/40 text-[10px] font-medium text-brand-black dark:text-brand-cream border border-brand-sage/40 dark:border-brand-onyx">
                                  <span className="font-bold text-amber-700 dark:text-brand-yellow">{t("lblMilestone")}: </span>
                                  <span>{item.milestone_exercise || item.milestone}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Recommended Verified Resources */}
                    {((aiGuidance.recommendedResources && aiGuidance.recommendedResources.length > 0) || (aiGuidance.recommended_resources && aiGuidance.recommended_resources.length > 0)) && (
                      <div className="space-y-2 pt-1 border-t border-brand-sage/30 dark:border-brand-onyx">
                        <span className="text-[10px] font-bold text-brand-black dark:text-brand-cream block uppercase tracking-wider">
                          {t("aiResourcesTitle")}
                        </span>
                        <div className="space-y-1.5">
                          {(aiGuidance.recommendedResources || aiGuidance.recommended_resources).map((r: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-white dark:bg-brand-card border border-brand-sage/50 dark:border-brand-onyx flex items-start justify-between gap-2"
                            >
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream">
                                    {r.skill}
                                  </span>
                                  <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold text-xs text-amber-600 dark:text-brand-yellow hover:underline flex items-center space-x-1"
                                  >
                                    <span>{r.title}</span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                </div>
                                <p className="text-[11px] text-brand-onyx/80 dark:text-brand-sage/80">
                                  {r.advice}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disclosure Notice */}
                    <div className="pt-2 border-t border-brand-sage/30 dark:border-brand-onyx flex items-center space-x-1.5 text-[10px] text-brand-onyx/70 dark:text-brand-sage/70">
                      <span>{t("aiNoticeDisclosure")}</span>
                    </div>

                    {aiGuidance.apiNotice && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                        {aiGuidance.apiNotice}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-brand-onyx dark:text-brand-sage mt-2">
                    {lang === "bn"
                      ? "আপনার বর্তমান দক্ষতার ঘাটতি এবং সাপ্তাহিক অধ্যয়নের সময়ের সাথে মিল রেখে ব্যক্তিগতকৃত এআই পরামর্শ পেতে নিচের বোতামে ক্লিক করুন।"
                      : "Click below to generate personalized advice tailored to your current gaps and study hours."}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleFetchAiGuidance}
                  disabled={loadingAi}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all disabled:opacity-50 ${
                    isGuidanceStale
                      ? "bg-brand-yellow hover:bg-amber-400 text-brand-black ring-2 ring-amber-400/50 shadow-md"
                      : "bg-brand-cream dark:bg-brand-onyx hover:bg-brand-sage/50 text-brand-black dark:text-brand-cream border border-brand-sage/70 dark:border-brand-onyx"
                  }`}
                >
                  {isGuidanceStale ? (
                    <RefreshCw className={`w-3.5 h-3.5 text-brand-black ${loadingAi ? "animate-spin" : ""}`} />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>
                    {loadingAi
                      ? (lang === "bn" ? "এআই কোচের পরামর্শ তৈরি হচ্ছে..." : "Consulting AI Coach...")
                      : isGuidanceStale
                      ? (lang === "bn" ? "🔄 নতুন দক্ষতার ভিত্তিতে এআই গাইডেন্স রিফ্রেশ করুন" : "🔄 Refresh Guidance for Updated Skills")
                      : aiGuidance
                      ? (lang === "bn" ? "পুনরায় এআই গাইডেন্স রিফ্রেশ করুন" : "Refresh AI Guidance")
                      : t("btnGenerateAiGuidance")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowKeyModal(true)}
                  className="w-full py-1.5 text-[11px] font-semibold text-brand-onyx dark:text-brand-sage hover:text-amber-600 dark:hover:text-brand-yellow flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Key className="w-3 h-3" />
                  <span>
                    {geminiConfig.hasKey
                      ? (lang === "bn" ? `জেমিনাই সক্রিয় (${geminiConfig.maskedKey}) • সেটিংস পরিবর্তন করুন` : `Gemini Active (${geminiConfig.maskedKey}) • Manage Key`)
                      : (lang === "bn" ? "জেমিনাই এপিআই কী ও মডেল কনফিগার করুন" : "Configure Gemini API Key & Model")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 Footer Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream text-xs font-semibold hover:bg-brand-sage/40 transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lang === "bn" ? "ধাপ ৩: ক্যারিয়ার ম্যাচে ফিরুন" : "Back to Step 3: Career Matches"}</span>
            </button>

            <Link
              href="/skillproof"
              className="px-5 py-2.5 rounded-xl bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all hover:opacity-90"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === "bn" ? "স্কিলপ্রুফ পোর্টফোলিও দেখুন ও শেয়ার করুন" : "View SkillProof Portfolio"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
        </div>

        {/* Right Sticky Live Intelligence Sidebar (4 Cols on LG/XL, 3 Cols on 2XL) */}
        <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-5 lg:sticky lg:top-20">
          {/* Live Readiness Meter */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-brand-yellow">
                DIU Readiness Deck
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                ● Live Model
              </span>
            </div>

            <div>
              <span className="text-xs text-brand-onyx/70 dark:text-brand-sage/70 block">
                Target Role
              </span>
              <h3 className="text-sm font-extrabold text-brand-black dark:text-brand-cream">
                {lang === "bn" && selectedCareer.title_bn ? selectedCareer.title_bn : selectedCareer.title}
              </h3>
            </div>

            {/* Match Percentage Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-brand-onyx dark:text-brand-sage">
                  Employability Match
                </span>
                <span className="font-extrabold text-base text-amber-600 dark:text-brand-yellow">
                  {fmtNum(activeMatchScore)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-brand-cream dark:bg-brand-onyx overflow-hidden">
                <div
                  className="h-full bg-brand-yellow transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, activeMatchScore))}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-sage/40 dark:border-brand-onyx text-xs">
              <div>
                <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 block">Est. Effort</span>
                <span className="font-bold text-brand-black dark:text-brand-cream">
                  {fmtNum(activeTotalEffort)} hrs
                </span>
              </div>
              <div>
                <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 block">Timeline</span>
                <span className="font-bold text-brand-black dark:text-brand-cream">
                  {fmtNum(activeEstimatedWeeks)} weeks
                </span>
              </div>
            </div>
          </div>

          {/* Five-Tier Evidence Ledger Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-black dark:text-brand-cream">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Five-Tier Evidence Ledger</span>
            </div>
            <p className="text-[11px] text-brand-onyx/70 dark:text-brand-sage/70">
              Verified distribution of your profile competencies across the platform tiers:
            </p>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 flex items-center justify-between text-purple-900 dark:text-purple-300">
                <span className="font-semibold text-[11px]">Tier 5: Employer Verified</span>
                <span className="font-bold">{credentials.filter((c) => c.assessmentType === "EMPLOYER_VERIFIED").length}</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-blue-900 dark:text-blue-300">
                <span className="font-semibold text-[11px]">Tier 4: Project Reviewed</span>
                <span className="font-bold">{credentials.filter((c) => c.assessmentType === "PROJECT_REVIEWED").length}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                <span className="font-semibold text-[11px]">Tier 3: Practical Demonstrated</span>
                <span className="font-bold">{credentials.filter((c) => c.assessmentType === "PRACTICALLY_DEMONSTRATED" || (!c.assessmentType && c.score >= 70)).length}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between text-amber-900 dark:text-amber-200">
                <span className="font-semibold text-[11px]">Tier 2: Knowledge Assessed</span>
                <span className="font-bold">{Object.keys(diagnosticReport?.skillEvidence || {}).length}</span>
              </div>
              <div className="p-2 rounded-lg bg-brand-cream/60 dark:bg-brand-onyx/40 border border-brand-sage/50 dark:border-brand-onyx flex items-center justify-between text-brand-black dark:text-brand-cream">
                <span className="font-semibold text-[11px]">Tier 1: Self-Reported</span>
                <span className="font-bold">{Object.keys(skills).length}</span>
              </div>
            </div>
          </div>

          {/* Quick Benchmark Verifiers */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkCard border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-onyx/70 dark:text-brand-sage/70 block">
              Quick Benchmark Calibration
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleLoadDemoPersona}
                className="w-full p-2.5 rounded-xl bg-brand-cream/70 dark:bg-brand-onyx/60 hover:bg-brand-sage/50 dark:hover:bg-brand-onyx text-xs font-bold text-brand-black dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx flex items-center justify-between transition-colors"
              >
                <span>⚡ Benchmark A (SQL 2/5)</span>
                <span className="text-amber-600 dark:text-brand-yellow">58.33% / 80h</span>
              </button>
              <button
                type="button"
                onClick={handleTriggerBenchmarkB}
                className="w-full p-2.5 rounded-xl bg-brand-yellow/80 hover:bg-brand-yellow text-xs font-bold text-brand-black flex items-center justify-between transition-colors shadow-xs"
              >
                <span>⚡ Benchmark B (SQL 3/5)</span>
                <span>66.67% / 70h</span>
              </button>
            </div>
          </div>

          {/* Quick SkillProof Portfolio Share Link */}
          <div className="p-5 rounded-2xl bg-brand-black text-brand-cream border border-brand-onyx shadow-md space-y-3">
            <div className="flex items-center space-x-2 text-brand-yellow text-xs font-bold">
              <Award className="w-4 h-4" />
              <span>SkillProof™ Ready</span>
            </div>
            <p className="text-[11px] text-brand-sage leading-relaxed">
              Export your cryptographically verified portfolio or generate public sharing links for employers.
            </p>
            <Link
              href="/skillproof"
              className="w-full py-2 px-3 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-amber-400 transition-all shadow-xs"
            >
              <span>View SkillProof Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      {/* -------------------------------------------------------------
          Gemini API Key & Model Configuration Modal
      ------------------------------------------------------------- */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-brand-card border border-brand-sage dark:border-brand-onyx rounded-3xl p-6 shadow-2xl space-y-5 text-brand-black dark:text-brand-cream relative">
            <button
              onClick={() => {
                setShowKeyModal(false);
                setKeyFeedback("");
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-brand-cream dark:hover:bg-brand-onyx text-brand-onyx dark:text-brand-sage transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-brand-yellow text-xs font-bold uppercase">
                <Key className="w-4 h-4" />
                <span>{t("geminiConfigTitle")}</span>
              </div>
              <h3 className="text-base font-bold text-brand-black dark:text-brand-cream">
                {lang === "bn" ? "গুগল জেমিনাই এআই ইঞ্জিন সেটিংস" : "Google Gemini AI Engine Settings"}
              </h3>
              <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
                {lang === "bn"
                  ? "আপনার নিজস্ব জেমিনাই এপিআই কী ও পছন্দের মডেল নির্বাচন করুন। আপনার রোলের স্কিল গ্যাপ অনুযায়ী তাৎক্ষণিক এআই পরামর্শ তৈরি হবে এবং তা প্রোফাইলে সংরক্ষিত থাকবে।"
                  : "Connect your Google Gemini API key and select your preferred model. Real-time personalized career roadmaps and interview advice will be generated and saved to your profile."}
              </p>
            </div>

            {/* Current Status */}
            {geminiConfig.hasKey && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold">{t("geminiKeyActive")}:</span>
                  <span className="font-mono">{geminiConfig.maskedKey}</span>
                </div>
                <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60">
                  {geminiConfig.model}
                </span>
              </div>
            )}

            <form onSubmit={handleSaveGeminiConfig} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-black dark:text-brand-cream block mb-1">
                  {t("geminiApiKeyLabel")}
                </label>
                <input
                  type="text"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder={geminiConfig.maskedKey ? `Current: ${geminiConfig.maskedKey}` : t("geminiApiKeyPlaceholder")}
                  className="w-full p-2.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage dark:border-brand-onyx text-xs font-mono text-brand-black dark:text-brand-cream focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                />
                <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 block mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  {lang === "bn"
                    ? "✓ এপিআই কী কোডবেসে স্থায়ীভাবে যুক্ত আছে (AQ.Ab8RN6...SeUw)।"
                    : "✓ API Key is permanently hardcoded in codebase (AQ.Ab8RN6...SeUw)."}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-black dark:text-brand-cream block mb-1">
                  {t("geminiModelLabel")}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage dark:border-brand-onyx text-xs text-brand-black dark:text-brand-cream focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 font-medium"
                >
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Recommended • High Speed & Proven)</option>
                  <option value="gemini-flash-latest">Gemini Flash Latest</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                </select>
              </div>

              {keyFeedback && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  keyFeedback.startsWith("✓")
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                }`}>
                  {keyFeedback}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 gap-3">
                {geminiConfig.hasKey ? (
                  <button
                    type="button"
                    onClick={handleClearGeminiConfig}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    {t("btnClearGeminiKey")}
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowKeyModal(false);
                      setKeyFeedback("");
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream text-xs font-semibold hover:bg-brand-sage/40 transition-colors"
                  >
                    {lang === "bn" ? "বন্ধ করুন" : "Close"}
                  </button>
                  <button
                    type="submit"
                    disabled={savingKey || (!inputApiKey.trim() && !geminiConfig.hasKey)}
                    className="px-5 py-2 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-black font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {savingKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === "bn" ? "যাচাই করা হচ্ছে..." : "Testing & Saving..."}</span>
                      </>
                    ) : (
                      <span>{t("btnSaveGeminiKey")}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
