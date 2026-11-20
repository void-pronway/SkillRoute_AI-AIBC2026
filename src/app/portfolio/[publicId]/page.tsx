"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  Calendar, 
  ExternalLink, 
  Lock, 
  Layers, 
  ArrowLeft 
} from "lucide-react";
import { SkillEvidenceBadge } from "@/components/SkillEvidenceBadge";
import { resolveSkillEvidenceTier } from "@/logic/evidenceTier";

export default function PublicPortfolioPage() {
  const params = useParams();
  const publicId = params?.publicId as string;

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (publicId) {
      fetchPortfolio();
    }
  }, [publicId]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/public-profiles/${publicId}`);
      if (!res.ok) {
        setError("This portfolio is either private or access has been revoked by the student.");
        setLoading(false);
        return;
      }

      const json = await res.json();
      setPortfolio(json.portfolio);
    } catch (err: any) {
      setError(err.message || "Failed to load public portfolio");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs font-semibold text-brand-onyx dark:text-brand-sage">
        Loading verified public portfolio...
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx text-center space-y-4 shadow-sm">
          <Lock className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-brand-black dark:text-brand-cream">
            Portfolio Access Revoked
          </h2>
          <p className="text-xs text-brand-onyx dark:text-brand-sage leading-relaxed">
            {error || "This portfolio is no longer publicly accessible."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 w-full space-y-8">
      {/* -------------------------------------------------------------
          Public Portfolio Header
      ------------------------------------------------------------- */}
      <div className="p-8 rounded-3xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-sage/40 dark:border-brand-onyx">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-600 dark:text-brand-yellow uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SkillRoute AI Verified Public Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-black dark:text-brand-cream tracking-tight">
              {portfolio.student?.name || "Student Candidate"}
            </h1>
            {portfolio.student?.university && (
              <p className="text-xs text-brand-onyx dark:text-brand-sage flex items-center space-x-1.5 mt-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{portfolio.student.university} {portfolio.student.department && `• ${portfolio.student.department}`}</span>
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-brand-cream/60 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx text-right">
            <span className="text-[10px] uppercase font-bold text-brand-onyx/70 dark:text-brand-sage/70 block">
              Target Career Match
            </span>
            <div className="text-xl font-extrabold text-amber-600 dark:text-brand-yellow">
              {portfolio.targetCareer?.matchPercentage}%
            </div>
            <span className="text-[11px] font-semibold text-brand-black dark:text-brand-cream block">
              {portfolio.targetCareer?.title}
            </span>
          </div>
        </div>

        <p className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 leading-relaxed">
          {portfolio.disclaimer}
        </p>
      </div>

      {/* -------------------------------------------------------------
          Verified Credentials
      ------------------------------------------------------------- */}
      {portfolio.credentials?.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-sm space-y-4">
          <h2 className="text-base font-bold text-brand-black dark:text-brand-cream">
            Verified Practical Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.credentials.map((cred: any) => (
              <div
                key={cred.credentialId}
                className="p-5 rounded-2xl bg-brand-cream/30 dark:bg-brand-onyx/30 border border-brand-sage/60 dark:border-brand-onyx space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-brand-yellow">
                    {cred.credentialId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Score: {cred.score}/100
                  </span>
                </div>
                <h3 className="text-sm font-bold text-brand-black dark:text-brand-cream">
                  {cred.competencyTitle}
                </h3>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-brand-onyx/60 dark:text-brand-sage/60">
                    {new Date(cred.issuedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/verify/${cred.credentialId}`}
                    target="_blank"
                    className="font-bold text-amber-600 dark:text-brand-yellow hover:underline flex items-center space-x-1"
                  >
                    <span>Verify Authenticity</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          Demonstrated Skills Breakdown
      ------------------------------------------------------------- */}
      {Object.keys(portfolio.skills || {}).length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-sm space-y-4">
          <h2 className="text-base font-bold text-brand-black dark:text-brand-cream">
            Competency Profiling (0-5 Level)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
            {Object.entries(portfolio.skills).map(([skillId, level]: any) => {
              const tierInfo = resolveSkillEvidenceTier(skillId, portfolio.credentials || []);

              return (
                <div
                  key={skillId}
                  className="p-3 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/40 border border-brand-sage/50 dark:border-brand-onyx text-center space-y-1.5 flex flex-col justify-between items-center"
                >
                  <span className="font-bold uppercase text-brand-black dark:text-brand-cream block truncate w-full">
                    {skillId.replace("_", " ")}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-yellow text-brand-black inline-block">
                    Level {level} / 5
                  </span>
                  <SkillEvidenceBadge tier={tierInfo} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
