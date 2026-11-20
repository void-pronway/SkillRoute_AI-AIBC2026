"use client";

import React from "react";
import { ShieldCheck, Award, CheckCircle, Sparkles, UserCheck } from "lucide-react";
import { SkillEvidenceTierInfo, SkillEvidenceTier, EVIDENCE_TIERS } from "@/logic/evidenceTier";

interface Props {
  tier: SkillEvidenceTierInfo | SkillEvidenceTier;
  lang?: "en" | "bn";
  showDescription?: boolean;
  size?: "sm" | "md";
}

export function SkillEvidenceBadge({
  tier,
  lang = "en",
  showDescription = false,
  size = "sm",
}: Props) {
  const info: SkillEvidenceTierInfo =
    typeof tier === "string" ? EVIDENCE_TIERS[tier] || EVIDENCE_TIERS.SELF_REPORTED : tier;

  const renderIcon = () => {
    switch (info.tierNumber) {
      case 5:
        return <UserCheck className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case 4:
        return <Award className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case 3:
        return <CheckCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case 2:
        return <Sparkles className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      default:
        return <ShieldCheck className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
    }
  };

  const title = lang === "bn" ? info.titleBn : info.titleEn;
  const desc = lang === "bn" ? info.descriptionBn : info.descriptionEn;

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        title={desc}
        className={`inline-flex items-center space-x-1 font-bold rounded-md border tracking-tight ${
          size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
        } ${info.badgeClass}`}
      >
        {renderIcon()}
        <span>{title}</span>
      </span>
      {showDescription && (
        <span className="text-[10px] text-brand-onyx/70 dark:text-brand-sage/70 font-normal">
          {desc}
        </span>
      )}
    </div>
  );
}
