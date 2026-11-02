"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  fetchGlobalLeaderboard,
  LeaderboardResponse,
  LeaderboardItem,
  UserStanding,
} from "@/lib/api";
import {
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"xp" | "streak" | "tasks_done">("xp");
  const [timeframe, setTimeframe] = useState<"all-time" | "weekly">("all-time");

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetchGlobalLeaderboard(undefined, timeframe, metric);
      setData(res);
    } catch (err) {
      console.error("Failed to load leaderboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [metric, timeframe]);

  const topStudents: LeaderboardItem[] = data?.top_50 || [];
  const top1 = topStudents[0];
  const top2 = topStudents[1];
  const top3 = topStudents[2];
  const remaining = topStudents.slice(3);
  const userStanding: UserStanding | null = data?.user_standing || null;

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in pb-24">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-[#005959] text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-salmon-500/20 text-salmon-400 border border-salmon-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Competitive Arena
              </span>
              <span className="text-teal-200 text-xs">Verified Student Rankings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Global Competitive Leaderboard
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
              Ranked across Class 6 to Undergraduate streams. Level up, maintain streaks, and climb the percentile ranks.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-teal-900/40 border border-teal-500/30">
            <button
              onClick={() => setMetric("xp")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                metric === "xp"
                  ? "bg-salmon-500 text-white shadow-md shadow-salmon-500/30"
                  : "text-teal-100 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Highest XP</span>
            </button>
            <button
              onClick={() => setMetric("streak")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                metric === "streak"
                  ? "bg-salmon-500 text-white shadow-md shadow-salmon-500/30"
                  : "text-teal-100 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Streak Masters</span>
            </button>
            <button
              onClick={() => setMetric("tasks_done")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                metric === "tasks_done"
                  ? "bg-salmon-500 text-white shadow-md shadow-salmon-500/30"
                  : "text-teal-100 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tasks Done</span>
            </button>
          </div>
        </div>

        {/* Timeframe Switcher & Standing Quick Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Timeframe:
            </span>
            <div className="inline-flex rounded-xl bg-gray-100 dark:bg-[#13232C] p-1 border border-gray-200 dark:border-[#1E333D]">
              <button
                onClick={() => setTimeframe("all-time")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeframe === "all-time"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                All-Time Hall of Fame
              </button>
              <button
                onClick={() => setTimeframe("weekly")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeframe === "weekly"
                    ? "bg-salmon-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Weekly Sprint
              </button>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Total Competitors: <span className="font-extrabold text-teal-600 dark:text-teal-400 font-mono">{data?.total_students || 0}</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 py-12">
            <div className="h-48 bg-gray-100 dark:bg-[#13232C] rounded-3xl animate-pulse" />
            <div className="h-64 bg-gray-100 dark:bg-[#13232C] rounded-3xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium Showcase */}
            {topStudents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {/* 2nd Place Podium */}
                {top2 && (
                  <div className="order-2 md:order-1 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-salmon-400/60 shadow-lg text-center flex flex-col justify-between space-y-3 relative overflow-hidden">
                    <div className="absolute top-3 left-3 text-xs font-black uppercase text-salmon-500 bg-salmon-500/10 px-2.5 py-0.5 rounded-full">
                      #2 Silver
                    </div>
                    <div className="text-4xl pt-2">{top2.avatar}</div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                        {top2.student_name}
                      </h3>
                      <p className="text-xs text-gray-400">{top2.grade_stream}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-salmon-50/50 dark:bg-[#201318]/50 border border-salmon-200/60 dark:border-salmon-900/60">
                      <div className="text-xs font-bold text-salmon-600 dark:text-salmon-400 uppercase">
                        {metric === "xp" ? "Total XP" : metric === "streak" ? "Active Streak" : "Tasks Done"}
                      </div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">
                        {top2.score} {metric === "streak" ? "Days" : ""}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                      Level {top2.level} Scholar
                    </div>
                  </div>
                )}

                {/* 1st Place Podium (Elevated Champion Card) */}
                {top1 && (
                  <div className="order-1 md:order-2 p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-teal-50 to-white dark:from-[#0A2328] dark:to-[#0F172A] border-2 border-teal-500 shadow-xl text-center flex flex-col justify-between space-y-3 relative transform md:-translate-y-3">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-black uppercase text-white bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-1 rounded-full shadow-md shadow-teal-900/30 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>#1 Champion</span>
                    </div>
                    <div className="text-5xl pt-4 animate-bounce-gentle">{top1.avatar}</div>
                    <div>
                      <h3 className="font-black text-lg text-gray-900 dark:text-white truncate">
                        {top1.student_name}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{top1.grade_stream}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-900/30">
                      <div className="text-xs font-bold text-teal-100 uppercase tracking-wider">
                        {metric === "xp" ? "Championship XP" : metric === "streak" ? "Active Streak" : "Tasks Completed"}
                      </div>
                      <div className="text-3xl font-black font-mono">
                        {top1.score} {metric === "streak" ? "Days" : ""}
                      </div>
                    </div>
                    <div className="text-xs font-extrabold text-salmon-500 flex items-center justify-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>Level {top1.level} Grandmaster</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place Podium */}
                {top3 && (
                  <div className="order-3 md:order-3 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-teal-400/50 shadow-lg text-center flex flex-col justify-between space-y-3 relative overflow-hidden">
                    <div className="absolute top-3 left-3 text-xs font-black uppercase text-teal-600 bg-teal-500/10 px-2.5 py-0.5 rounded-full">
                      #3 Bronze
                    </div>
                    <div className="text-4xl pt-2">{top3.avatar}</div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                        {top3.student_name}
                      </h3>
                      <p className="text-xs text-gray-400">{top3.grade_stream}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-[#0A2328]/50 border border-teal-200/60 dark:border-teal-900/60">
                      <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">
                        {metric === "xp" ? "Total XP" : metric === "streak" ? "Active Streak" : "Tasks Done"}
                      </div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white font-mono">
                        {top3.score} {metric === "streak" ? "Days" : ""}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                      Level {top3.level} Scholar
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remaining Table (4th to 50th) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-[#1E333D]">
                <span>Rankings (4th - 50th)</span>
                <span>Standing Score</span>
              </div>

              {remaining.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  Top 3 scholars occupy the podium. Complete study sprints to populate the global roster!
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-[#1E333D]">
                  {remaining.map((item) => {
                    const isCurrentUser = userStanding && item.student_id === userStanding.student_id;
                    return (
                      <div
                        key={item.rank}
                        className={`py-3.5 px-3 rounded-2xl transition-all flex items-center justify-between ${
                          isCurrentUser
                            ? "bg-teal-50/80 dark:bg-[#0A2328] border-2 border-teal-500 font-semibold"
                            : "hover:bg-gray-50 dark:hover:bg-[#13232C]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-extrabold text-xs ${
                              isCurrentUser
                                ? "bg-teal-600 text-white"
                                : "bg-gray-100 dark:bg-[#1E333D] text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            #{item.rank}
                          </span>
                          <span className="text-xl">{item.avatar}</span>
                          <div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.student_name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-teal-500 text-white px-2 py-0.2 rounded-full font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-2">
                              <span>{item.grade_stream}</span>
                              <span>•</span>
                              <span className="text-salmon-500 font-semibold">Level {item.level}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-extrabold text-sm text-gray-900 dark:text-white">
                            {item.score}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {metric === "xp" ? "XP" : metric === "streak" ? "Days" : "Tasks"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Fixed Bottom Sticky Bar for Authenticated Student Standing */}
        {userStanding && (
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t-2 border-teal-500 shadow-2xl p-4 transition-all">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-salmon-500 text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0">
                  #{userStanding.rank}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{userStanding.student_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-salmon-500/10 text-salmon-500 text-[10px] font-bold">
                      Top {userStanding.percentile}% Percentile
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Level {userStanding.level} • {userStanding.xp} Total XP • {userStanding.streak} Day Streak
                  </div>
                </div>
              </div>

              {/* Dynamic distance to next tier message */}
              <div className="flex items-center space-x-3">
                {userStanding.xp_to_next_rank > 0 && userStanding.next_rank_name ? (
                  <div className="text-right text-xs">
                    <span className="text-gray-400">Next Target:</span>{" "}
                    <span className="font-extrabold text-salmon-500">
                      +{userStanding.xp_to_next_rank} {metric.toUpperCase()}
                    </span>{" "}
                    <span className="text-gray-500">to overtake {userStanding.next_rank_name}!</span>
                  </div>
                ) : (
                  <div className="text-xs font-extrabold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>You hold the highest rank in this tier!</span>
                  </div>
                )}

                <div className="hidden sm:block">
                  <span className="p-2 rounded-xl bg-teal-50 dark:bg-[#0A2328] text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Rank Live</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

