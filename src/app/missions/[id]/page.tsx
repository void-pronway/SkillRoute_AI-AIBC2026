"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  Award, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Play, 
  Terminal, 
  FileText, 
  Sparkles,
  ExternalLink,
  Table,
  Zap
} from "lucide-react";

export default function MissionWorkspacePage() {
  const { lang, t, fmtNum } = useApp();
  const params = useParams();
  const router = useRouter();
  const missionId = params?.id as string;

  const [challenge, setChallenge] = useState<any>(null);
  const [submission, setSubmission] = useState("");
  const [mode, setMode] = useState<"INDEPENDENT" | "AI_ASSISTED">("INDEPENDENT");
  const [aiNotes, setAiNotes] = useState("");
  const [blurredCount, setBlurredCount] = useState(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [issuedCredential, setIssuedCredential] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Focus blur telemetry listener
  useEffect(() => {
    const handleBlur = () => {
      setBlurredCount((prev) => prev + 1);
    };
    window.addEventListener("blur", handleBlur);

    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.removeEventListener("blur", handleBlur);
      clearInterval(timer);
    };
  }, []);

  // Fetch challenge on mount
  useEffect(() => {
    if (missionId) {
      fetchChallenge();
    }
  }, [missionId]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/missions/${missionId}`);
      if (res.ok) {
        const data = await res.json();
        setChallenge(data.challenge);
        setSubmission(data.challenge.initialCode || "");
      }
    } catch (err) {
      console.error("Fetch challenge error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/api/missions/${missionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission,
          mode,
          aiNotes,
          blurredCount,
          timeSpentSeconds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluationResult(data.evaluation);
        if (data.issuedCredential) {
          setIssuedCredential(data.issuedCredential);
        }
      }
    } catch (err) {
      console.error("Submit evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || !challenge) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs font-semibold text-brand-onyx dark:text-brand-sage">
        Loading Mission Arena workspace...
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* -------------------------------------------------------------
          Top Navigation Bar
      ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-sage/50 dark:border-brand-onyx">
        <div className="flex items-center space-x-3">
          <Link
            href="/missions"
            className="p-2 rounded-xl bg-white dark:bg-brand-card hover:bg-brand-sage/50 dark:hover:bg-brand-onyx border border-brand-sage/60 dark:border-brand-onyx text-brand-black dark:text-brand-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-yellow text-brand-black uppercase">
                {challenge.category}
              </span>
              <span className="text-xs text-brand-onyx/70 dark:text-brand-sage/70 font-medium">
                Passing: {fmtNum(challenge.passingScore)}%
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
              {lang === "bn" && challenge.title_bn ? challenge.title_bn : challenge.title}
            </h1>
          </div>
        </div>

        {/* Telemetry Indicator */}
        <div className="flex items-center space-x-3 text-xs text-brand-onyx/80 dark:text-brand-sage/80 font-medium">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Time: {Math.floor(timeSpentSeconds / 60)}m {timeSpentSeconds % 60}s</span>
          </div>
          {blurredCount > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              Tab switches: {blurredCount}
            </span>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          Main Workspace Grid (2 Columns)
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Problem Scenario & Instructions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scenario Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-black dark:text-brand-cream">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>{t("missionScenario")}</span>
            </div>
            <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
              {lang === "bn" && challenge.scenario_bn ? challenge.scenario_bn : challenge.scenario}
            </p>
          </div>

          {/* Instructions Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-black dark:text-brand-cream">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{t("missionInstructions")}</span>
            </div>
            <ul className="space-y-2 text-xs text-brand-onyx dark:text-brand-sage">
              {(lang === "bn" && challenge.instructions_bn ? challenge.instructions_bn : challenge.instructions).map(
                (inst: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-4 h-4 rounded-full bg-brand-sage/50 dark:bg-brand-onyx text-brand-black dark:text-brand-cream text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                      {fmtNum(idx + 1)}
                    </span>
                    <span>{inst}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Seed Dataset / Context Preview */}
          {challenge.seedData && (
            <div className="p-5 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-black dark:text-brand-cream">
                <Table className="w-4 h-4 text-blue-500" />
                <span>Seed Dataset Environment</span>
              </div>
              <div className="p-3 rounded-xl bg-brand-black text-brand-sage font-mono text-[11px] overflow-x-auto max-h-56">
                <pre>{JSON.stringify(challenge.seedData, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Rubric Criteria */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs space-y-3">
            <div className="text-xs font-bold text-brand-black dark:text-brand-cream uppercase tracking-wider">
              Assessment Rubrics (100 Pts Total)
            </div>
            <div className="space-y-2 text-xs">
              {challenge.rubric.map((r: any) => (
                <div
                  key={r.id}
                  className="p-2.5 rounded-lg bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/40 dark:border-brand-onyx flex items-center justify-between"
                >
                  <span className="text-brand-onyx dark:text-brand-sage pr-2">{r.criterion}</span>
                  <span className="font-bold text-amber-600 dark:text-brand-yellow flex-shrink-0">
                    {fmtNum(r.points)} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Editor, Integrity Mode & Submission */}
        <div className="lg:col-span-7 space-y-4">
          {/* Integrity Mode Selector */}
          <div className="p-4 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-brand-black dark:text-brand-cream">Assessment Integrity:</span>
              <div className="flex items-center space-x-1 bg-brand-cream dark:bg-brand-onyx p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode("INDEPENDENT")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    mode === "INDEPENDENT"
                      ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black shadow-xs"
                      : "text-brand-onyx dark:text-brand-cream hover:bg-brand-sage/40"
                  }`}
                >
                  Mode A: Independent
                </button>
                <button
                  type="button"
                  onClick={() => setMode("AI_ASSISTED")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    mode === "AI_ASSISTED"
                      ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black shadow-xs"
                      : "text-brand-onyx dark:text-brand-cream hover:bg-brand-sage/40"
                  }`}
                >
                  Mode B: AI-Assisted
                </button>
              </div>
            </div>
          </div>

          {mode === "AI_ASSISTED" && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                AI Tool Disclosure:
              </span>
              <input
                type="text"
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder="Describe how you used AI tools (e.g., 'Generated initial boilerplate query')"
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-brand-card border border-amber-300 dark:border-amber-800 text-brand-black dark:text-brand-cream text-xs"
              />
            </div>
          )}

          {/* Interactive Code Editor */}
          <div className="rounded-2xl bg-brand-black text-brand-cream border border-brand-onyx shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-brand-darkCard border-b border-brand-onyx">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-brand-yellow" />
                <span className="text-xs font-mono text-brand-sage">workspace_editor</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (challenge.fullMarkSolution) {
                      setSubmission(challenge.fullMarkSolution);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-brand-yellow text-[11px] font-bold border border-amber-500/40 flex items-center space-x-1 transition-all"
                  title="Loads verified full-mark solution for live demo evaluation"
                >
                  <Zap className="w-3 h-3 text-brand-yellow" />
                  <span>{lang === "bn" ? "১০০ নম্বরের সমাধান লোড করুন" : "Load Verified Solution (100 Pts)"}</span>
                </button>
                <button
                  onClick={() => setSubmission(challenge.initialCode || "")}
                  className="text-[11px] text-brand-sage hover:text-white transition-colors"
                >
                  {lang === "bn" ? "শুরুর কোড রিস্টোর" : "Reset Starter Code"}
                </button>
              </div>
            </div>

            <textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              rows={14}
              className="w-full p-4 bg-brand-black text-brand-cream font-mono text-xs focus:outline-hidden resize-y leading-relaxed"
              placeholder="Write your solution here..."
            />

            <div className="p-3 bg-brand-darkCard border-t border-brand-onyx flex items-center justify-between">
              <span className="text-[11px] text-brand-sage">
                {submission.split("\n").length} lines • Safe server-side evaluation
              </span>
              <button
                onClick={handleSubmitEvaluation}
                disabled={evaluating}
                className="px-4 py-2 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{evaluating ? t("evaluatingText") : t("btnRunEvaluation")}</span>
              </button>
            </div>
          </div>

          {/* Evaluation Results Card */}
          {evaluationResult && (
            <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-brand-sage/40 dark:border-brand-onyx">
                <div>
                  <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                    {t("evalScoreLabel", { score: fmtNum(evaluationResult.totalScore) })}
                  </h3>
                  <span className="text-xs text-brand-onyx dark:text-brand-sage">
                    {evaluationResult.overallFeedback}
                  </span>
                </div>
                <div>
                  {evaluationResult.passed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                      {t("evalPassedBadge")}
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs">
                      {t("evalFailedBadge")}
                    </span>
                  )}
                </div>
              </div>

              {/* Academic Integrity & AI Disclosure Signal Banner */}
              {evaluationResult.aiDisclosureFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 ${
                    evaluationResult.aiIntegrityFlag === "FLAGGED_UNDECLARED_AI"
                      ? "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-900"
                      : evaluationResult.aiIntegrityFlag === "VERIFIED_DISCLOSED_AI"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-900"
                      : "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-900"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">
                      {evaluationResult.aiIntegrityFlag === "FLAGGED_UNDECLARED_AI"
                        ? "Academic Integrity Flag"
                        : evaluationResult.aiIntegrityFlag === "VERIFIED_DISCLOSED_AI"
                        ? "Transparent AI Disclosure Verified"
                        : "Integrity Verification"}
                    </span>
                    <span className="leading-relaxed block">{evaluationResult.aiDisclosureFeedback}</span>
                  </div>
                </div>
              )}

              {/* Criteria Points Breakdown */}
              <div className="space-y-2">
                {evaluationResult.detailedResults?.map((res: any) => (
                  <div
                    key={res.criterionId}
                    className="p-3 rounded-xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/40 dark:border-brand-onyx text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand-black dark:text-brand-cream">
                        {res.criterionText}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-brand-yellow">
                        {fmtNum(res.awardedPoints)} / {fmtNum(res.maxPoints)} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-onyx/80 dark:text-brand-sage/80">
                      {res.feedback}
                    </p>
                  </div>
                ))}
              </div>

              {/* SQL Query Output Preview (if applicable) */}
              {evaluationResult.queryOutput && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-brand-black dark:text-brand-cream block mb-2">
                    Query Execution Results (Verified Database Output):
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-brand-sage/60 dark:border-brand-onyx">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-cream font-bold">
                        <tr>
                          <th className="p-2.5">Region Name</th>
                          <th className="p-2.5">Order Count</th>
                          <th className="p-2.5">Total Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-sage/40 dark:divide-brand-onyx">
                        {evaluationResult.queryOutput.map((row: any, i: number) => (
                          <tr key={i} className="bg-white dark:bg-brand-card">
                            <td className="p-2.5 font-semibold">{row.region_name}</td>
                            <td className="p-2.5">{fmtNum(row.order_count)}</td>
                            <td className="p-2.5 font-bold text-amber-600 dark:text-brand-yellow">${fmtNum(row.total_revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Claim Credential Link */}
              {evaluationResult.passed && issuedCredential && (
                <div className="pt-3 flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold block">Verified Credential Issued!</span>
                    <span className="font-mono text-[11px]">{issuedCredential.credentialId}</span>
                  </div>
                  <Link
                    href={`/verify/${issuedCredential.credentialId}`}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
