"use client";

import React, { useState } from "react";
import { SubjectProgressData, SubjectProgressItem } from "@/lib/api";
import { BookOpen, CheckCircle, Clock, Sparkles } from "lucide-react";

interface SubjectProgressGraphProps {
  data: SubjectProgressData | null;
  loading?: boolean;
}

export default function SubjectProgressGraph({ data, loading = false }: SubjectProgressGraphProps) {
  const [timeframe, setTimeframe] = useState<"today" | "week">("today");

  if (loading) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-gray-200 dark:bg-[#1E333D] rounded-lg w-48" />
        <div className="h-28 bg-gray-100 dark:bg-[#13232C] rounded-2xl" />
      </div>
    );
  }

  const subjects: SubjectProgressItem[] = data?.subjects || [];
  const overallPct = timeframe === "today" 
    ? (data?.overall_today_percentage ?? 0)
    : (data?.overall_week_percentage ?? 0);

  const completedCount = timeframe === "today"
    ? (data?.total_today_completed ?? 0)
    : (data?.total_week_completed ?? 0);

  const totalCount = timeframe === "today"
    ? (data?.total_today_tasks ?? 0)
    : (data?.total_week_tasks ?? 0);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-6">
      {/* Header and Filter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-salmon-500" />
              Real-Time Subject Mastery
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Subject-Wise Progress Graph
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {timeframe === "today" 
              ? `Today's schedule distribution (${data?.today_date || "Live"})`
              : `Current sprint breakdown (${data?.week_range || "Past 7 days"})`}
          </p>
        </div>

        {/* Timeframe Toggle Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === "today"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Today&apos;s Focus
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === "week"
                ? "bg-salmon-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Sprint Week
          </button>
        </div>
      </div>

      {/* Aggregate Metric Highlight Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-teal-100/50 dark:from-[#0A2328] dark:to-[#0D2F35] border border-teal-200 dark:border-teal-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-900/30 flex-shrink-0">
            {overallPct}%
          </div>
          <div>
            <div className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wide">
              {timeframe === "today" ? "Today's Aggregate Velocity" : "Weekly Sprint Velocity"}
            </div>
            <div className="text-xs text-teal-700 dark:text-teal-300">
              {completedCount} of {totalCount} tasks completed • {Math.max(0, totalCount - completedCount)} remaining
            </div>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full sm:w-48 bg-teal-200/60 dark:bg-teal-900/40 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-salmon-500 transition-all duration-500"
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>
      </div>

      {/* Subject-Wise Bars List */}
      {subjects.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400">
          No scheduled tasks found for this period. Generate your syllabus sprint in the Adaptive Planner.
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((item) => {
            const pct = timeframe === "today" ? item.today_percentage : item.week_percentage;
            const completed = timeframe === "today" ? item.today_completed : item.week_completed;
            const total = timeframe === "today" ? item.today_total : item.week_total;

            return (
              <div key={item.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {item.subject}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="text-gray-400">
                      {completed} / {total} done
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Styled Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-[#13232C] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend and Encouragement Note */}
      <div className="pt-2 border-t border-gray-100 dark:border-[#1E333D] flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
          <span>Checkbox toggles update this graph instantly via optimistic UI.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-salmon-500" />
          <span>Balanced across your active chronobiology focus slot</span>
        </div>
      </div>
    </div>
  );
}

