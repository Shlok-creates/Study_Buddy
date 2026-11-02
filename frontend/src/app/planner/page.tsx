"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  fetchTasks,
  fetchProfile,
  saveProfile,
  generateRoadmap,
  rescheduleBacklogs,
  toggleTask,
  getStoredUserId,
  getStoredProfile,
  setStoredProfile,
  PlannerTask,
  UserProfile,
} from "@/lib/api";
import { STREAM_CATEGORIES, DEFAULT_STREAM } from "@/lib/streams";
import {
  CalendarDays,
  Sparkles,
  Clock,
  RotateCcw,
  Sliders,
  Zap,
} from "lucide-react";

export default function PlannerPage() {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [targetGoal, setTargetGoal] = useState("C++ Data Types & Memory Layout");
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [dailyHours, setDailyHours] = useState(2.0);

  // Bio-clock & academic settings
  const [gradeStream, setGradeStream] = useState<string>(DEFAULT_STREAM);
  const [focusSpan, setFocusSpan] = useState(45);
  const [peakEnergy, setPeakEnergy] = useState("Late Night");
  const [schoolStart, setSchoolStart] = useState("08:00");
  const [schoolEnd, setSchoolEnd] = useState("14:30");
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userId = getStoredUserId();
    if (!userId) return;

    try {
      setLoading(true);
      const [tList, p] = await Promise.all([
        fetchTasks(userId),
        fetchProfile(userId),
      ]);
      setTasks(tList);
      setProfile(p);
      if (p) {
        setFocusSpan(p.focus_span_minutes);
        setPeakEnergy(p.peak_energy);
        setSchoolStart(p.school_start_time);
        setSchoolEnd(p.school_end_time);
        if (p.grade_stream) {
          setGradeStream(p.grade_stream);
        }
      }
    } catch (err) {
      console.error("Failed to load planner data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = getStoredUserId();
    if (!userId) return;

    setGenerating(true);
    setMessage(null);
    try {
      const res = await generateRoadmap({
        student_id: userId,
        target_goal: targetGoal.trim(),
        deadline_date: deadlineDate,
        daily_hours: dailyHours,
      });
      setMessage(res.message);
      await loadData();
    } catch (err: any) {
      console.error("Roadmap generation error", err);
      setMessage(err.message || "Failed to generate roadmap. Please verify details.");
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  const handleSaveProfile = async () => {
    const userId = getStoredUserId();
    if (!userId) return;

    try {
      await saveProfile({
        id: userId,
        grade_stream: gradeStream,
        focus_span_minutes: Number(focusSpan),
        peak_energy: peakEnergy,
        school_start_time: schoolStart,
        school_end_time: schoolEnd,
      });
      if (profile) {
        const updated = {
          ...profile,
          grade_stream: gradeStream,
          focus_span_minutes: Number(focusSpan),
          peak_energy: peakEnergy,
          school_start_time: schoolStart,
          school_end_time: schoolEnd,
        };
        setStoredProfile(updated);
        setProfile(updated);
      }
      setMessage("Chronobiology & academic preferences saved successfully!");
      setShowConfig(false);
      await loadData();
    } catch (err) {
      console.error("Profile update error", err);
    }
  };

  const handleToggle = async (task: PlannerTask) => {
    const nextCompleted = !task.is_completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextCompleted } : t))
    );
    try {
      await toggleTask(task.id, nextCompleted);
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  const handleReschedule = async () => {
    const userId = getStoredUserId();
    if (!userId) return;

    setRescheduling(true);
    try {
      const res = await rescheduleBacklogs(userId);
      setMessage(res.message);
      await loadData();
    } catch (err) {
      console.error("Reschedule error", err);
    } finally {
      setRescheduling(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const groupedTasks: Record<string, PlannerTask[]> = {};
  tasks.forEach((t) => {
    if (!groupedTasks[t.scheduled_date]) {
      groupedTasks[t.scheduled_date] = [];
    }
    groupedTasks[t.scheduled_date].push(t);
  });

  const sortedDates = Object.keys(groupedTasks).sort();

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4 text-salmon-500" />
              <span>Chronobiology & Adaptive Optimization Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1 flex flex-wrap items-center gap-2">
              <span>Adaptive Study Planner</span>
              {(profile?.grade_stream || gradeStream) && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {profile?.grade_stream || gradeStream}
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              Dynamically maps syllabi into progressive daily study sprints based on your attention span, school schedule, and peak cognitive energy hours.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-[#13232C] hover:bg-gray-200 dark:hover:bg-[#1E333D] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-200 dark:border-[#1E333D]"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-500" />
              <span>Bio-Clock Settings</span>
            </button>
            <button
              onClick={handleReschedule}
              disabled={rescheduling}
              className="px-3.5 py-2 rounded-xl bg-salmon-500 hover:bg-salmon-600 text-white text-xs font-bold shadow-md shadow-salmon-500/30 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${rescheduling ? "animate-spin" : ""}`} />
              <span>Balance Backlogs</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-salmon-500" />
            <span>{message}</span>
          </div>
        )}

        {/* Bio-Clock Settings Dropdown Panel */}
        {showConfig && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-teal-500/30 shadow-lg space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1E333D]">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-salmon-500" />
                Customize Chronobiology & Academic Profile
              </h3>
              <span className="text-xs text-gray-400">Used by AI to schedule sprints</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Target Academic Stream / Level:
                </label>
                <select
                  value={gradeStream}
                  onChange={(e) => setGradeStream(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-teal-500"
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

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">Focus Span (Mins):</label>
                  <select
                    value={focusSpan}
                    onChange={(e) => setFocusSpan(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white"
                  >
                    <option value={25}>25 mins (Pomodoro)</option>
                    <option value={45}>45 mins (Recommended)</option>
                    <option value={60}>60 mins (Deep Flow)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">Peak Energy Window:</label>
                  <select
                    value={peakEnergy}
                    onChange={(e) => setPeakEnergy(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white"
                  >
                    <option value="Morning">Morning Peak (05:00 - 11:00)</option>
                    <option value="Late Night">Late Night Peak (21:00 - 01:00)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">School/College Start:</label>
                  <input
                    type="time"
                    value={schoolStart}
                    onChange={(e) => setSchoolStart(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">School/College End:</label>
                  <input
                    type="time"
                    value={schoolEnd}
                    onChange={(e) => setSchoolEnd(e.target.value)}
                    className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Generate New Sprints Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Target Academic Goal / Syllabus
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. C++ Data Types or Genetics & DNA"
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Target Exam / Finish Deadline
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Daily Study Hours Available
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Adaptive Schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-salmon-400" />
                  <span>Generate Day-by-Day Adaptive Learning Roadmap</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Day-by-Day Learning Roadmap Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Day-by-Day Learning Timeline
            </h2>
            <span className="text-xs font-mono text-gray-400">
              {tasks.length} total scheduled sprints
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0F172A] border-2 border-dashed border-gray-200 dark:border-[#1E333D] space-y-3">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                You have no active study sprints yet.
              </p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Enter any chapter or topic above (e.g. &quot;C++ Data Types&quot; or &quot;Photosynthesis&quot;) and click generate to create your personalized roadmap!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateStr) => {
                const dayTasks = groupedTasks[dateStr];
                const isPast = dateStr < new Date().toISOString().split("T")[0];
                const isToday = dateStr === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={dateStr}
                    className={`p-5 rounded-3xl border transition-all ${
                      isToday
                        ? "bg-teal-50/30 dark:bg-[#0A2328]/30 border-teal-500/50 shadow-md ring-1 ring-teal-500/20"
                        : "bg-white dark:bg-[#0F172A] border-gray-200 dark:border-[#1E333D]"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1E333D] mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white font-mono">
                          {dateStr}
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-salmon-500 text-white text-[10px] font-bold uppercase tracking-wider">
                            Today
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[10px] text-gray-400 font-medium">Past Session</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {dayTasks.filter((t) => t.is_completed).length} / {dayTasks.length} Done
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggle(task)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            task.is_completed
                              ? "bg-teal-50/50 dark:bg-[#0A2328]/40 border-teal-200 dark:border-teal-900/60 opacity-80"
                              : "bg-gray-50 dark:bg-[#13232C] border-gray-200 dark:border-[#1E333D] hover:border-teal-500"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={task.is_completed}
                              onChange={() => {}}
                              className="w-4 h-4 rounded accent-teal-600"
                            />
                            <div>
                              <div
                                className={`text-xs sm:text-sm font-semibold ${
                                  task.is_completed
                                    ? "line-through text-gray-400 dark:text-gray-500"
                                    : "text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {task.topic_name}
                              </div>
                              <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-teal-500" />
                                <span>{task.duration_minutes} minutes sprint</span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.is_completed
                                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                                : "bg-gray-200 dark:bg-[#1E333D] text-gray-500"
                            }`}
                          >
                            {task.is_completed ? "Completed" : "Scheduled"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
