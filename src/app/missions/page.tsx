"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Code2, 
  Terminal, 
  Lock, 
  Palette, 
  ShieldCheck, 
  Sparkles,
  Filter
} from "lucide-react";

export default function MissionArenaIndexPage() {
  const { lang, t, fmtNum } = useApp();
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/missions");
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions || []);
      }
    } catch (err) {
      console.error("Fetch missions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: Record<string, any> = {
    data: Database,
    backend: Code2,
    frontend: Terminal,
    security: Lock,
    design: Palette,
  };

  const filteredMissions = selectedCategory === "ALL"
    ? missions
    : missions.filter((m) => m.category === selectedCategory);

  return (
    <div className="flex-1 w-full max-w-[96%] 2xl:max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* -------------------------------------------------------------
          Header Banner
      ------------------------------------------------------------- */}
      <div className="p-8 rounded-3xl bg-brand-black text-brand-cream border border-brand-onyx shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-onyx text-brand-yellow text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>AIBC Practical Assessment Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t("arenaTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-brand-sage leading-relaxed">
            {t("arenaSubtitle")}
          </p>

          <div className="pt-2 flex items-center space-x-2 text-xs text-brand-cream/80 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t("arenaNotice")}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Category Filter Pills
      ------------------------------------------------------------- */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-brand-onyx/70 dark:text-brand-sage/70 mr-2 flex items-center space-x-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>

        {[
          { id: "ALL", label: t("filterAll") },
          { id: "data", label: t("filterData") },
          { id: "backend", label: t("filterBackend") },
          { id: "frontend", label: t("filterFrontend") },
          { id: "security", label: t("filterSecurity") },
          { id: "design", label: t("filterDesign") },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-brand-black text-brand-yellow dark:bg-brand-yellow dark:text-brand-black shadow-xs"
                : "bg-white dark:bg-brand-card text-brand-onyx dark:text-brand-cream border border-brand-sage/60 dark:border-brand-onyx hover:bg-brand-cream/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------
          Missions Grid
      ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMissions.map((mission) => {
          const Icon = categoryIcons[mission.category] || Award;

          return (
            <div
              key={mission.id}
              className="p-6 rounded-2xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-cream dark:bg-brand-onyx text-brand-black dark:text-brand-yellow flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {mission.isPassed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        ✓ Passed ({mission.bestScore}%)
                      </span>
                    )}
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-sage/40 dark:bg-brand-onyx text-brand-onyx dark:text-brand-sage">
                      {mission.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-brand-black dark:text-brand-cream mb-2 leading-snug">
                  {lang === "bn" && mission.title_bn ? mission.title_bn : mission.title}
                </h3>
                <p className="text-xs text-brand-onyx/80 dark:text-brand-sage/80 leading-relaxed mb-4 line-clamp-3">
                  {lang === "bn" && mission.scenario_bn ? mission.scenario_bn : mission.scenario}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-sage/40 dark:border-brand-onyx space-y-3">
                <div className="flex items-center justify-between text-xs text-brand-onyx/70 dark:text-brand-sage/70 font-medium">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{fmtNum(mission.estimatedMinutes)} mins</span>
                  </span>
                  <span>Threshold: {fmtNum(mission.passingScore)}%</span>
                </div>

                <Link
                  href={`/missions/${mission.id}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs hover:bg-amber-400 transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <span>{t("btnStartMission")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
