"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  CalendarDays,
  Youtube,
  GraduationCap,
  Network,
  Sparkles,
  BookOpen,
  LogOut,
  Users,
  Trophy,
  Compass,
  Award,
} from "lucide-react";
import { clearUserSession, fetchGamificationStatus, GamificationStatus } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doubts", label: "Snap Doubt Solver", icon: Camera },
  { href: "/planner", label: "Adaptive Planner", icon: CalendarDays },
  { href: "/youtube-lab", label: "YouTube Lab", icon: Youtube },
  { href: "/teacher", label: "AI Teacher Voice", icon: GraduationCap },
  { href: "/skill-tree", label: "Gamified Skills", icon: Network },
  { href: "/squads", label: "Social Squads", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/career-compass", label: "Career Compass", icon: Compass },
];

interface SidebarProps {
  studentName?: string;
  gradeStream?: string;
}

export default function Sidebar({
  studentName = "Shlok Sngh",
  gradeStream = "UG 1st Year B.Tech / Engineering",
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [gamStatus, setGamStatus] = useState<GamificationStatus | null>(null);

  useEffect(() => {
    fetchGamificationStatus()
      .then(setGamStatus)
      .catch(() => {});

    const refreshGam = () => {
      fetchGamificationStatus().then(setGamStatus).catch(() => {});
    };
    window.addEventListener("study-buddy-level-up", refreshGam);
    return () => window.removeEventListener("study-buddy-level-up", refreshGam);
  }, []);

  const handleResetSession = () => {
    if (confirm("Reset current student profile and return to Onboarding?")) {
      clearUserSession();
      router.push("/onboarding");
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-teal-700 dark:bg-[#0A191E] border-r border-teal-800 dark:border-[#1E333D] text-white flex flex-col justify-between h-screen sticky top-0 shadow-xl transition-all z-20">
      <div className="overflow-y-auto">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-teal-800/80 dark:border-[#1E333D]/60 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-salmon-500 to-salmon-400 flex items-center justify-center shadow-lg shadow-salmon-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              StudyBuddy<span className="text-salmon-400">.AI</span>
            </h1>
            <p className="text-xs text-teal-200 dark:text-teal-400 font-medium">Class 6 → 3rd Yr UG</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-teal-200/70 dark:text-teal-400/60">
            Study & Career Suite
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 group ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md shadow-teal-900/30 font-semibold border-l-4 border-salmon-400"
                    : "text-teal-100 dark:text-slate-300 hover:bg-teal-600/50 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-salmon-400" : "text-teal-300 dark:text-teal-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Mini-Card with Dynamic Identity & Gamification Level */}
      <div className="p-4 border-t border-teal-800/70 dark:border-[#1E333D]/60 space-y-2">
        <div className="p-3 rounded-xl bg-teal-800/50 dark:bg-[#0F172A]/80 border border-teal-600/30 dark:border-[#1E333D] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-teal-500/30 flex items-center justify-center text-teal-200 flex-shrink-0">
                <BookOpen className="w-4 h-4 text-teal-300" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{studentName}</div>
                <div className="text-[10px] text-salmon-400 font-medium truncate">{gradeStream}</div>
              </div>
            </div>
            <button
              onClick={handleResetSession}
              title="Switch / Reset Profile"
              className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-teal-700/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Level & XP Mini Progress Bar */}
          {gamStatus && (
            <div className="pt-1.5 border-t border-teal-700/50 dark:border-[#1E333D] space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-extrabold text-teal-300 flex items-center gap-1">
                  <Award className="w-3 h-3 text-salmon-400" />
                  Level {gamStatus.level}
                </span>
                <span className="font-mono text-teal-200/80">
                  {gamStatus.xp_into_level} / 500 XP
                </span>
              </div>
              <div className="w-full bg-teal-900/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-salmon-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (gamStatus.xp_into_level / 500) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
