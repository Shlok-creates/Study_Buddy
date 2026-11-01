"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import {
  fetchTasks,
  fetchAnalytics,
  fetchProfile,
  toggleTask,
  rescheduleBacklogs,
  getStoredUserId,
  PlannerTask,
  AnalyticsData,
  UserProfile,
} from "@/lib/api";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Flame,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadAllData = async () => {
    const userId = getStoredUserId();
    if (!userId) return;

    try {
      setLoading(true);
      const [tList, anal, prof] = await Promise.all([
        fetchTasks(userId),
        fetchAnalytics(userId),
        fetchProfile(userId),
      ]);
      setTasks(tList);
      setAnalytics(anal);
      setProfile(prof);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggle = async (task: PlannerTask) => {
    const userId = getStoredUserId();
    const nextCompleted = !task.is_completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextCompleted } : t))
    );

    try {
      await toggleTask(task.id, nextCompleted);
      if (userId) {
        const updatedAnal = await fetchAnalytics(userId);
        setAnalytics(updatedAnal);
      }
    } catch (err) {
      console.error("Failed to toggle task status", err);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_completed: task.is_completed } : t))
      );
    }
  };

  const handleReschedule = async () => {
    const userId = getStoredUserId();
    if (!userId) return;

    setRescheduling(true);
    setMessage(null);
    try {
      const res = await rescheduleBacklogs(userId);
      setMessage(res.message);
      await loadAllData();
    } catch (err) {
      console.error("Reschedule backlogs error:", err);
      setMessage("Failed to reschedule backlogs. Please try again.");
    } finally {
      setRescheduling(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const todayTasks = tasks.filter((t) => t.scheduled_date === todayStr);
  const backlogTasks = tasks.filter((t) => t.scheduled_date < todayStr && !t.is_completed);
  const upcomingTasks = tasks.filter((t) => t.scheduled_date > todayStr).slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome & High-Impact Summary Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-[#005959] text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-salmon-500/20 text-salmon-400 border border-salmon-400/30 text-xs font-bold uppercase tracking-wider">
                Chronobiology Engine Active
              </span>
              <span className="text-teal-200 text-xs">
                Peak Energy: <strong>{profile?.peak_energy || "Late Night"}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Scholar"}!
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
              Your personalized cognitive study roadmap is adjusted to your {profile?.focus_span_minutes || 45}-minute attention span and school schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {backlogTasks.length > 0 && (
              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="px-4 py-2.5 rounded-xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-xs shadow-lg shadow-salmon-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className={`w-4 h-4 ${rescheduling ? "animate-spin" : ""}`} />
                <span>Reschedule Backlogs ({backlogTasks.length})</span>
              </button>
            )}

            <Link
              href="/planner"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-teal-200" />
              <span>Full Roadmap</span>
            </Link>
          </div>
        </div>

        {/* Status Toast Alert */}
        {message && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-sm font-semibold flex items-center gap-2 animate-bounce-gentle">
            <Sparkles className="w-5 h-5 text-salmon-500" />
            <span>{message}</span>
          </div>
        )}

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Tasks</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {analytics?.total_tasks || 0}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5" /> All planned sprints
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Completed</div>
            <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
              {analytics?.completed_tasks || 0}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {analytics?.completion_rate || 0}% Completion Rate
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Streak</div>
            <div className="text-2xl font-extrabold text-salmon-500 mt-1 flex items-center gap-1.5">
              <Flame className="w-6 h-6 fill-salmon-500 text-salmon-500" />
              <span>{analytics?.streak_days || 0} Days</span>
            </div>
            <div className="text-[11px] text-salmon-500/80 mt-1">Consistent learner</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Missed Backlogs</div>
            <div className="text-2xl font-extrabold text-amber-500 mt-1">
              {backlogTasks.length}
            </div>
            <div className="text-[11px] text-amber-500/80 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Balance with 1-click
            </div>
          </div>
        </div>

        {/* Consistency Activity Heatmap Component */}
        <ActivityHeatmap heatmapData={analytics?.heatmap || {}} daysToShow={42} />

        {/* Main Content Split: Today's Schedule & Overdue Backlogs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule Checklist (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Today&apos;s Focus Schedule
                </h2>
                <p className="text-xs text-gray-500">
                  Targeted chunks calibrated to your {profile?.focus_span_minutes || 45}m focus span
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                {todayTasks.filter((t) => t.is_completed).length} / {todayTasks.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {todayTasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1E333D]">
                  <p className="text-xs text-gray-500">No study tasks scheduled for today yet.</p>
                  <Link
                    href="/planner"
                    className="inline-block mt-3 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-900/30"
                  >
                    Generate Adaptive Roadmap
                  </Link>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggle(task)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      task.is_completed
                        ? "bg-teal-50/50 dark:bg-[#0A2328]/40 border-teal-200 dark:border-teal-900/60 opacity-80"
                        : "bg-white dark:bg-[#0F172A] border-gray-200 dark:border-[#1E333D] hover:border-teal-500 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => {}}
                        className="w-5 h-5 rounded-md accent-teal-600 cursor-pointer"
                      />
                      <div>
                        <div
                          className={`text-sm font-semibold transition-all ${
                            task.is_completed
                              ? "line-through text-gray-400 dark:text-gray-500"
                              : "text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400"
                          }`}
                        >
                          {task.topic_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-teal-500" />
                            {task.duration_minutes} mins
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                            {profile?.peak_energy === "Late Night" ? "Evening Peak Slot" : "Morning Peak Slot"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        task.is_completed
                          ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                          : "bg-gray-100 dark:bg-[#1E333D] text-gray-500"
                      }`}
                    >
                      {task.is_completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Upcoming Roadmap Peek */}
            {upcomingTasks.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Upcoming Next 5 Sprints
                  </h3>
                  <Link href="/planner" className="text-xs text-teal-500 hover:underline flex items-center gap-1">
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {upcomingTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-[#13232C]/60 border border-gray-200 dark:border-[#1E333D] flex items-center justify-between text-xs"
                    >
                      <div className="truncate max-w-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.topic_name}
                      </div>
                      <span className="font-mono text-gray-400 text-[11px] ml-2 flex-shrink-0">
                        {t.scheduled_date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Overdue Backlog & Chronobiology Hub */}
          <div className="space-y-5">
            {/* Backlog Action Panel */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1E333D]">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Overdue Backlogs ({backlogTasks.length})
                </h3>
              </div>

              {backlogTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  <Sparkles className="w-8 h-8 mx-auto text-teal-500 mb-2 opacity-60" />
                  Zero backlogs! Your study rhythm is clean.
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  <p className="text-xs text-gray-500">
                    Missed tasks from previous days that require adaptive rebalancing:
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {backlogTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                      >
                        <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {task.topic_name}
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                          Was due: {task.scheduled_date}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleReschedule}
                    disabled={rescheduling}
                    className="w-full mt-2 py-2.5 rounded-xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-xs shadow-md shadow-salmon-500/25 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${rescheduling ? "animate-spin" : ""}`} />
                    <span>Auto-Balance Across Next 4 Days</span>
                  </button>
                </div>
              )}
            </div>

            {/* Chronobiology Profile Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-900 to-[#0F172A] border border-teal-800/60 text-white shadow-lg">
              <div className="flex items-center space-x-2 text-salmon-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Zap className="w-4 h-4" />
                <span>Adaptive Bio-Clock</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {profile?.peak_energy === "Late Night" ? "Night Owl Rhythm" : "Early Bird Rhythm"}
              </h4>

              <div className="mt-3 space-y-2 text-xs text-teal-100">
                <div className="flex justify-between py-1 border-b border-teal-800/40">
                  <span className="text-teal-300">School/Coaching:</span>
                  <span className="font-mono font-semibold">
                    {profile?.school_start_time || "08:00"} - {profile?.school_end_time || "14:30"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-800/40">
                  <span className="text-teal-300">Sleep Schedule:</span>
                  <span className="font-mono font-semibold">
                    {profile?.sleep_start_time || "23:30"} onwards
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-teal-800/40">
                  <span className="text-teal-300">Optimal Span:</span>
                  <span className="font-semibold text-salmon-400">
                    {profile?.focus_span_minutes || 45} mins / session
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-teal-800/40 border border-teal-700/50 text-[11px] text-teal-200 leading-relaxed">
                Adaptive algorithms match hard concepts to your peak energy intervals.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
