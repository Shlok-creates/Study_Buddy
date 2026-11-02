"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  fetchCareerRoadmaps,
  requestCareerAdvice,
  applyCareerMilestones,
  getStoredUserId,
  getStoredProfile,
  CareerTrack,
  CareerGuidance,
} from "@/lib/api";
import { STREAM_CATEGORIES, DEFAULT_STREAM } from "@/lib/streams";
import {
  Compass,
  Sparkles,
  Cpu,
  Stethoscope,
  TrendingUp,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Briefcase,
  Layers,
  Send,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  Tech: [
    "What are my high-ROI Plan B options if I don't crack JEE Advanced?",
    "How can I balance Class 12 PCM boards with BITSAT and State CETs?",
    "Which AI/ML and software engineering careers have the highest 5-year growth?",
    "How important are GitHub open-source contributions vs competitive exam ranks?",
  ],
  Medical: [
    "How should I structure my daily revision for NEET-UG 650+ target?",
    "What are top alternate clinical and research careers outside MBBS?",
    "How do CUET Life Sciences and Biomedical Engineering compare with BDS/BAMS?",
    "How can I master NCERT Biology line-by-line using active recall?",
  ],
  Management: [
    "How should I prepare for IPMAT (IIM 5-yr dual degree) alongside boards?",
    "What are the career exit opportunities of CUET DU (SRCC/SSCBS) vs IIMs?",
    "Can a Science/Commerce student break into FinTech & Product Management?",
    "Which foundational certifications (CFA / Financial Modeling) should I target?",
  ],
};

export default function CareerCompassPage() {
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<"Tech" | "Medical" | "Management">("Tech");
  const [studentStream, setStudentStream] = useState<string>(DEFAULT_STREAM);
  const [queryInput, setQueryInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCareerRoadmaps()
      .then((res) => {
        setTracks(res.tracks);
      })
      .catch((err) => console.error("Failed to fetch roadmaps", err));

    const prof = getStoredProfile();
    if (prof?.grade_stream) {
      setStudentStream(prof.grade_stream);
    }
  }, []);

  const handleConsult = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setAppliedCount(null);
    try {
      const contextualQuery = studentStream
        ? `${queryText.trim()} [Student Profile Stream: ${studentStream}]`
        : queryText.trim();
      const res = await requestCareerAdvice(selectedTrack, contextualQuery);
      setGuidance(res.guidance);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate career guidance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMilestones = async () => {
    if (!guidance?.actionable_tasks) return;
    setApplying(true);
    try {
      const res = await applyCareerMilestones(guidance.actionable_tasks);
      setAppliedCount(res.added_count);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to apply milestones to planner");
    } finally {
      setApplying(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in pb-16">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-[#005959] text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-salmon-500/20 text-salmon-400 border border-salmon-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> Career Navigator & Strategist
              </span>
              <span className="text-teal-200 text-xs">Class 6 → 3rd Year UG</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Career & Academic Counsellor Hub
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
              Cross-domain strategic guidance covering Technology, Healthcare & Medical, and Management. Pragmatic Dual Strategy: bold Tier-1 plans paired with realistic high-ROI backups.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-teal-100 font-semibold border border-white/20">
              Personalized to Your Study Data
            </span>
            {studentStream && (
              <span className="text-[11px] text-teal-200 font-medium">
                Stream: {studentStream}
              </span>
            )}
          </div>
        </div>

        {/* 3 Domain Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Track 1: Tech */}
          <div
            onClick={() => {
              setSelectedTrack("Tech");
              setGuidance(null);
            }}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedTrack === "Tech"
                ? "bg-white dark:bg-[#0F172A] border-teal-500 shadow-xl shadow-teal-900/10"
                : "bg-white/60 dark:bg-[#0F172A]/60 border-gray-200 dark:border-[#1E333D] hover:border-teal-400 opacity-90"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                STEM • High Growth
              </span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-3">
              Technology & Engineering
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              Software Engineering, AI/ML, Cloud Systems, ECE, JEE Main/Adv, BITSAT, and State CETs.
            </p>
            {selectedTrack === "Tech" && (
              <div className="mt-3 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                <span>Active Track</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Track 2: Medical */}
          <div
            onClick={() => {
              setSelectedTrack("Medical");
              setGuidance(null);
            }}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedTrack === "Medical"
                ? "bg-white dark:bg-[#0F172A] border-salmon-500 shadow-xl shadow-salmon-500/10"
                : "bg-white/60 dark:bg-[#0F172A]/60 border-gray-200 dark:border-[#1E333D] hover:border-salmon-400 opacity-90"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-salmon-500/20 text-salmon-500 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-salmon-500/10 text-salmon-500">
                Healthcare • Impact
              </span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-3">
              Medical & Healthcare Sciences
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              MBBS, BDS, Biotechnology, Biomedical Engineering, NEET-UG timelines, and alternate clinical routes.
            </p>
            {selectedTrack === "Medical" && (
              <div className="mt-3 text-xs font-bold text-salmon-500 flex items-center gap-1">
                <span>Active Track</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Track 3: Management */}
          <div
            onClick={() => {
              setSelectedTrack("Management");
              setGuidance(null);
            }}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedTrack === "Management"
                ? "bg-white dark:bg-[#0F172A] border-purple-500 shadow-xl shadow-purple-500/10"
                : "bg-white/60 dark:bg-[#0F172A]/60 border-gray-200 dark:border-[#1E333D] hover:border-purple-400 opacity-90"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Business • Leadership
              </span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-3">
              Management & Financial Strategy
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              IPMAT (IIM 5-yr dual degree), CUET (BBA, BMS, B.Com Hons), FinTech, Product Management, CFA/CA.
            </p>
            {selectedTrack === "Management" && (
              <div className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span>Active Track</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Socratic Chatbot Consultation Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-salmon-500" />
                Ask Your AI Career & Academic Strategist
              </h2>
              <p className="text-xs text-gray-500">
                Type any dilemma or choose from curated domain questions below
              </p>
            </div>
            <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-full">
              {selectedTrack} Domain Active
            </span>
          </div>

          {/* Academic Stream Context Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#13232C]/60 border border-gray-200 dark:border-[#1E333D]">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Personalize Strategy for Academic Stream / Level:
            </span>
            <select
              value={studentStream}
              onChange={(e) => setStudentStream(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-teal-500"
            >
              {STREAM_CATEGORIES.map((cat) => (
                <optgroup key={cat.category} label={`── ${cat.category} ──`}>
                  {cat.streams.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Quick Stream-Aware Suggestion Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-gray-400 py-1 font-medium">Quick Prompts:</span>
            {SUGGESTED_PROMPTS[selectedTrack]?.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQueryInput(prompt);
                  handleConsult(prompt);
                }}
                className="px-3 py-1 rounded-xl text-xs bg-gray-100 dark:bg-[#13232C] hover:bg-teal-50 dark:hover:bg-teal-900/30 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-300 font-medium transition-colors border border-gray-200/60 dark:border-[#1E333D] text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* User Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConsult(queryInput);
            }}
            className="flex gap-2 pt-2"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={`Ask anything about ${selectedTrack} prep, backup options, target scores, or timelines...`}
              className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="px-6 py-3 rounded-2xl bg-salmon-500 hover:bg-salmon-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-salmon-500/30 transition-all flex items-center gap-2 flex-shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Strategizing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Consult</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Guidance Results Showcase */}
        {guidance && (
          <div className="space-y-6 animate-scale-up">
            {/* 1. Socratic Advice Hero Callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 to-teal-100/60 dark:from-[#0A2328] dark:to-[#0D2F35] border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-salmon-500" />
                <span>Strategist Socratic Advice</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 leading-relaxed font-medium">
                {guidance.socratic_advice}
              </p>
            </div>

            {/* 2. Dual Strategy Split: Plan A vs Plan B */}
            {guidance.dual_strategy && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan A (Tier 1 Dream) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-teal-500/60 shadow-lg space-y-3 relative overflow-hidden">
                  <div className="inline-block text-[10px] font-black uppercase text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-3 py-1 rounded-full">
                    Plan A • Tier-1 Dream Track
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    {guidance.dual_strategy.plan_a.title}
                  </h3>
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                    Target: {guidance.dual_strategy.plan_a.target_institutes}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {guidance.dual_strategy.plan_a.strategy_summary}
                  </p>
                </div>

                {/* Plan B (High-ROI Pragmatic Backup) */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-salmon-400/60 shadow-lg space-y-3 relative overflow-hidden">
                  <div className="inline-block text-[10px] font-black uppercase text-salmon-700 dark:text-salmon-300 bg-salmon-100 dark:bg-salmon-900/50 px-3 py-1 rounded-full">
                    Plan B • High-ROI Pragmatic Backup
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                    {guidance.dual_strategy.plan_b.title}
                  </h3>
                  <div className="text-xs text-salmon-500 font-semibold">
                    Target: {guidance.dual_strategy.plan_b.target_institutes}
                  </div>
                  <div className="p-2.5 rounded-xl bg-salmon-50/50 dark:bg-[#201318]/50 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                    <strong>ROI Advantage:</strong> {guidance.dual_strategy.plan_b.roi_advantage}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {guidance.dual_strategy.plan_b.strategy_summary}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Top Career Matches */}
            {guidance.career_matches && guidance.career_matches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Profile-Fit Career Matches</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {guidance.career_matches.map((cm, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-2.5"
                    >
                      <div className="text-[10px] font-bold uppercase text-salmon-500">
                        {cm.domain}
                      </div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {cm.title}
                      </h4>
                      <div className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
                        {cm.salary_outlook}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {cm.fit_reason}
                      </p>
                      <div className="pt-2 border-t border-gray-100 dark:border-[#1E333D] flex flex-wrap gap-1">
                        {cm.required_skills?.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-gray-100 dark:bg-[#13232C] text-gray-700 dark:text-gray-300 font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Target Exams & Eligibility */}
            {guidance.target_exams && guidance.target_exams.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-teal-500" />
                  <span>Target Entrance Exams & Eligibility Criteria</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {guidance.target_exams.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] space-y-1.5 text-xs"
                    >
                      <div className="font-extrabold text-gray-900 dark:text-white flex items-center justify-between">
                        <span>{ex.name}</span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                          {ex.difficulty_tier}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        <span className="text-gray-500 font-semibold">Eligibility:</span> {ex.eligibility}
                      </div>
                      <div className="text-salmon-500 font-medium text-[11px]">
                        Timeline: {ex.exam_period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Actionable Tasks + One-Click Apply Button */}
            {guidance.actionable_tasks && guidance.actionable_tasks.length > 0 && (
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-teal-900/20 via-teal-800/10 to-salmon-900/10 border-2 border-teal-500/40 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-salmon-500">
                      Step-By-Step Execution
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                      3 Immediate Recommended Study Milestones
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Calibrated to your attention span and ready for direct import into your daily planner.
                    </p>
                  </div>

                  <button
                    onClick={handleApplyMilestones}
                    disabled={applying || appliedCount !== null}
                    className="px-5 py-3 rounded-2xl bg-salmon-500 hover:bg-salmon-600 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-salmon-500/30 transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    {appliedCount !== null ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Milestones Added!</span>
                      </>
                    ) : applying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding Tasks...</span>
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="w-4 h-4" />
                        <span>Add Recommended Milestones to Planner</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Applied success banner */}
                {appliedCount !== null && (
                  <div className="p-4 rounded-2xl bg-teal-500/20 border border-teal-500 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center justify-between animate-fade-in">
                    <span>
                      🚀 Successfully scheduled {appliedCount} strategic milestones! They appear in your Today and Sprint schedules.
                    </span>
                    <Link
                      href="/planner"
                      className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors flex items-center gap-1"
                    >
                      <span>View in Planner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {guidance.actionable_tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold text-[10px]">
                          {task.subject}
                        </span>
                        <span className="font-mono text-gray-400 text-[11px]">
                          {task.duration_minutes}m Sprint
                        </span>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white leading-snug">
                        {task.topic_name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

