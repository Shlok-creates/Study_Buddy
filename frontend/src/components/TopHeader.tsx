"use client";

import React, { useEffect, useState } from "react";
import { Flame, Moon, Sun, GraduationCap, Clock, Award } from "lucide-react";
import { UserProfile } from "@/lib/api";

interface TopHeaderProps {
  profile?: UserProfile | null;
  streakDays?: number;
}

export default function TopHeader({ profile, streakDays = 7 }: TopHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <header className="h-16 px-6 bg-white/80 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#1E333D] flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center space-x-3">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">
          AI Academic Operating System
        </h2>
        <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold border border-teal-500/20">
          Groq Llama 3.3 Core
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Streak Counter with Salmon Pink Flame */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-salmon-500/10 dark:bg-salmon-500/15 border border-salmon-500/30 text-salmon-500 font-bold text-sm shadow-sm animate-pulse-slow">
          <Flame className="w-5 h-5 text-salmon-500 fill-salmon-500" />
          <span>{streakDays} Day Streak</span>
        </div>

        {/* Academic Profile Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-xs">
          <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {profile?.grade_stream || "Class 11 Science (PCM)"}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {profile?.focus_span_minutes || 45}m span
          </span>
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Dark Mode"
          className="p-2 rounded-xl bg-gray-100 dark:bg-[#13232C] hover:bg-gray-200 dark:hover:bg-[#1E333D] text-gray-600 dark:text-gray-300 transition-colors border border-gray-200 dark:border-[#1E333D]"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-salmon-400" />
          ) : (
            <Moon className="w-4 h-4 text-teal-600" />
          )}
        </button>
      </div>
    </header>
  );
}

