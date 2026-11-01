"use client";

import React, { useState } from "react";

interface ActivityHeatmapProps {
  heatmapData?: Record<string, number>;
  daysToShow?: number;
}

export default function ActivityHeatmap({ heatmapData = {}, daysToShow = 35 }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; label: string; count: number } | null>(null);

  // Generate date array for the past N days up to today
  const days: { date: string; label: string; count: number }[] = [];
  const today = new Date();

  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = heatmapData[dateStr] || 0;
    days.push({
      date: dateStr,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    });
  }

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-200 dark:bg-[#1E333D]/60 hover:ring-1 hover:ring-gray-400";
    if (count === 1) return "bg-teal-500/50 hover:bg-teal-500/70";
    if (count === 2) return "bg-teal-500 hover:bg-teal-400";
    if (count >= 3) return "bg-teal-600 dark:bg-teal-500 shadow-sm shadow-teal-500/30 hover:bg-teal-400";
    return "bg-teal-700";
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Consistency Activity Heatmap
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Daily task completions over the last {daysToShow} days
          </p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-[#1E333D]/60" />
          <div className="w-3 h-3 rounded-sm bg-teal-500/50" />
          <div className="w-3 h-3 rounded-sm bg-teal-500" />
          <div className="w-3 h-3 rounded-sm bg-teal-600" />
          <span>More</span>
        </div>
      </div>

      {/* Grid of Blocks */}
      <div className="flex flex-wrap gap-2 items-center">
        {days.map((day) => (
          <div
            key={day.date}
            onMouseEnter={() => setHoveredDay(day)}
            onMouseLeave={() => setHoveredDay(null)}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md transition-all duration-150 cursor-pointer ${getColorClass(
              day.count
            )}`}
            title={`${day.label}: ${day.count} tasks completed`}
          />
        ))}
      </div>

      {/* Tooltip / Active Day Status */}
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 min-h-[1.25rem] flex items-center">
        {hoveredDay ? (
          <span>
            <strong className="text-teal-600 dark:text-teal-400">{hoveredDay.label}</strong>:{" "}
            {hoveredDay.count} task{hoveredDay.count === 1 ? "" : "s"} completed
          </span>
        ) : (
          <span className="text-gray-400">Hover over any block to view day detail</span>
        )}
      </div>
    </div>
  );
}

