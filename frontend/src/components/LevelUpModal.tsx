"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Trophy, Award, X, Flame } from "lucide-react";

interface LevelUpDetail {
  new_level: number;
  badge_unlocked: string | null;
  total_xp: number;
}

export default function LevelUpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<LevelUpDetail | null>(null);

  useEffect(() => {
    const handleLevelUp = (e: Event) => {
      const customEvent = e as CustomEvent<LevelUpDetail>;
      if (customEvent.detail) {
        setData(customEvent.detail);
        setIsOpen(true);
      }
    };

    window.addEventListener("study-buddy-level-up", handleLevelUp);
    return () => {
      window.removeEventListener("study-buddy-level-up", handleLevelUp);
    };
  }, []);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-salmon-500 shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-scale-up overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-salmon-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1E333D] text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy / Level Badge Animation */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-salmon-500 via-salmon-400 to-amber-400 flex items-center justify-center shadow-lg shadow-salmon-500/40 animate-bounce-gentle">
          <Trophy className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-salmon-500/10 text-salmon-500 text-xs font-extrabold uppercase tracking-widest border border-salmon-500/20">
            <Flame className="w-3.5 h-3.5 fill-salmon-500 text-salmon-500" />
            Milestone Achieved
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            LEVEL UP!
          </h2>
          <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
            You reached Level {data.new_level}!
          </p>
        </div>

        {/* Badge Card */}
        {data.badge_unlocked && (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-[#0A2328] border border-teal-200 dark:border-teal-800 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold uppercase">
              <Award className="w-4 h-4 text-salmon-500" />
              <span>New Badge Unlocked</span>
            </div>
            <div className="text-base font-extrabold text-gray-900 dark:text-white">
              &ldquo;{data.badge_unlocked}&rdquo;
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Your active focus and continuous recall are compounding. Every completed sprint pushes you higher on the global leaderboard!
        </p>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-salmon-500 to-salmon-600 hover:from-salmon-600 hover:to-salmon-700 text-white font-extrabold text-sm shadow-xl shadow-salmon-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Keep Crushing It!</span>
        </button>
      </div>
    </div>
  );
}

