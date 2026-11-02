"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveProfile, setStoredUserId, setStoredProfile } from "@/lib/api";
import { STREAM_CATEGORIES, DEFAULT_STREAM } from "@/lib/streams";
import {
  Sparkles,
  GraduationCap,
  Clock,
  Moon,
  Sun,
  ArrowRight,
  BookOpen,
  User,
  Mail,
  Zap,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gradeStream, setGradeStream] = useState(DEFAULT_STREAM);
  const [focusSpan, setFocusSpan] = useState(45);
  const [schoolStart, setSchoolStart] = useState("08:00");
  const [schoolEnd, setSchoolEnd] = useState("14:30");
  const [sleepStart, setSleepStart] = useState("23:30");
  const [peakEnergy, setPeakEnergy] = useState("Late Night");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = fullName.trim();
    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    setError(null);

    // Prepare profileData immediately
    const userProfile = {
      id: `user-${Date.now().toString(36)}`,
      full_name: name,
      email: email.trim(),
      grade_stream: gradeStream,
      focus_span_minutes: Number(focusSpan),
      school_start_time: schoolStart,
      school_end_time: schoolEnd,
      sleep_start_time: sleepStart,
      peak_energy: peakEnergy,
    };

    // 1. Immediately persist to localStorage
    localStorage.setItem("student_profile", JSON.stringify(userProfile));
    localStorage.setItem("student_id", userProfile.id || "shlok");
    setStoredProfile(userProfile);

    // 2. Safe non-blocking API call to persist to SQLite backend
    try {
      saveProfile({
        full_name: name,
        email: email.trim(),
        grade_stream: gradeStream,
        focus_span_minutes: Number(focusSpan),
        school_start_time: schoolStart,
        school_end_time: schoolEnd,
        sleep_start_time: sleepStart,
        peak_energy: peakEnergy,
      }).then((res) => {
        if (res?.profile) {
          localStorage.setItem("student_profile", JSON.stringify(res.profile));
          localStorage.setItem("student_id", res.user_id || "shlok");
          setStoredProfile(res.profile);
        }
      }).catch((err) => {
        console.warn("Background onboarding save notice:", err);
      });
    } catch (err) {
      console.warn("Direct saveProfile error ignored for instant navigation", err);
    }

    // 3. Immediately execute navigation with zero delay!
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A191E] via-[#0F172A] to-[#13232C] text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-[#0F172A]/90 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-fade-in">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-salmon-500 to-salmon-400 mx-auto flex items-center justify-center shadow-lg shadow-salmon-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to StudyBuddy<span className="text-salmon-400">.AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/80 max-w-md mx-auto">
            Set up your academic profile and bio-clock preferences so our AI engine can tailor learning sprints to your schedule.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal & Academic Stream */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 pb-2 border-b border-teal-900/60">
              <User className="w-4 h-4 text-salmon-400" />
              <span>1. Student Identity & Stream</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300">Full Name *</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma or Priya Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#13232C] border border-[#1E333D] text-white placeholder-gray-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Email Address (Optional)</label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#13232C] border border-[#1E333D] text-white placeholder-gray-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300">Grade & Academic Stream *</label>
              <select
                value={gradeStream}
                onChange={(e) => setGradeStream(e.target.value)}
                className="mt-1 w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#13232C] border border-[#1E333D] text-white focus:ring-1 focus:ring-teal-500 font-medium"
              >
                {STREAM_CATEGORIES.map((cat) => (
                  <optgroup key={cat.category} label={cat.category} className="bg-[#0F172A] text-teal-400 font-bold">
                    {cat.options.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#13232C] text-white font-normal">
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Chronobiology & Daily Routine */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 pb-2 border-b border-teal-900/60">
              <Clock className="w-4 h-4 text-salmon-400" />
              <span>2. Attention Span & Bio-Clock Routine</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300">Uninterrupted Focus Span *</label>
                <select
                  value={focusSpan}
                  onChange={(e) => setFocusSpan(Number(e.target.value))}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#13232C] border border-[#1E333D] text-white focus:ring-1 focus:ring-teal-500"
                >
                  <option value={25}>25 Minutes (Pomodoro Burst)</option>
                  <option value={45}>45 Minutes (Balanced Sprint - Recommended)</option>
                  <option value={60}>60 Minutes (Deep Flow Block)</option>
                  <option value={90}>90 Minutes (Advanced Competitive Exam Prep)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Peak Focus Energy Window *</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setPeakEnergy("Morning")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      peakEnergy === "Morning"
                        ? "bg-teal-600 border-teal-400 text-white shadow-md shadow-teal-900/30"
                        : "bg-[#13232C] border-[#1E333D] text-gray-400 hover:text-white"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-salmon-400" />
                    <span>Early Bird</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeakEnergy("Late Night")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      peakEnergy === "Late Night"
                        ? "bg-teal-600 border-teal-400 text-white shadow-md shadow-teal-900/30"
                        : "bg-[#13232C] border-[#1E333D] text-gray-400 hover:text-white"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-salmon-400" />
                    <span>Night Owl</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300">School / College Starts</label>
                <input
                  type="time"
                  value={schoolStart}
                  onChange={(e) => setSchoolStart(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-[#13232C] border border-[#1E333D] text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">School / College Ends</label>
                <input
                  type="time"
                  value={schoolEnd}
                  onChange={(e) => setSchoolEnd(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-[#13232C] border border-[#1E333D] text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Target Bedtime / Sleep</label>
                <input
                  type="time"
                  value={sleepStart}
                  onChange={(e) => setSleepStart(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-[#13232C] border border-[#1E333D] text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-salmon-500 hover:bg-salmon-600 text-white font-extrabold text-sm shadow-xl shadow-salmon-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Personalized Workspace...</span>
              </>
            ) : (
              <>
                <span>Launch My AI Study & Career Buddy</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2 border-t border-[#1E333D]">
            <p className="text-xs text-gray-400">
              Already have a profile?{" "}
              <Link
                href="/login"
                className="font-bold text-teal-400 hover:text-teal-300 underline underline-offset-2"
              >
                Sign in to existing account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

