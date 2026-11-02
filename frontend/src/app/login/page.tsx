"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  loginProfile,
  setStoredProfile,
  getStoredProfile,
  clearUserSession,
  UserProfile,
} from "@/lib/api";
import { STREAM_CATEGORIES, DEFAULT_STREAM } from "@/lib/streams";
import {
  Sparkles,
  ArrowRight,
  User,
  GraduationCap,
  LogOut,
  AlertCircle,
  Zap,
} from "lucide-react";

const DEMO_PRESETS = [
  {
    name: "Shlok Sngh",
    stream: "UG 1st Year B.Tech / Engineering",
    email: "iamshloksingh@gmail.com",
  },
  {
    name: "Aarav Sharma",
    stream: "Class 11-12 Science (PCM/JEE)",
    email: "aarav@school.edu",
  },
  {
    name: "Priya Patel",
    stream: "UG MBBS, BDS, Pharmacy, Nursing, Biotechnology",
    email: "priya@med.edu",
  },
];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [selectedStream, setSelectedStream] = useState(DEFAULT_STREAM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prof = getStoredProfile();
    if (prof && prof.id && prof.full_name) {
      setCurrentProfile(prof);
      setIdentifier(prof.full_name || prof.email || "");
      if (prof.grade_stream) {
        setSelectedStream(prof.grade_stream);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ident = identifier.trim() || currentProfile?.full_name || "Shlok Sngh";

    setLoading(true);
    setError(null);

    // Create an immediate valid profile payload
    const immediateProfile: UserProfile = {
      id: `user-${ident.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "shlok"}`,
      full_name: ident.includes("@")
        ? ident
            .split("@")[0]
            .replace(/[\._]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : ident,
      email: ident.includes("@") ? ident : "",
      grade_stream: selectedStream,
      focus_span_minutes: 45,
      school_start_time: "08:00",
      school_end_time: "14:30",
      sleep_start_time: "23:30",
      peak_energy: "Late Night",
    };

    // 2. Immediately save user data to localStorage
    localStorage.setItem("student_profile", JSON.stringify(immediateProfile));
    localStorage.setItem("student_id", immediateProfile.id || "shlok");
    setStoredProfile(immediateProfile);

    // 3. Fire background sync without blocking client navigation
    loginProfile(ident)
      .then((res) => {
        if (res?.profile) {
          localStorage.setItem("student_profile", JSON.stringify(res.profile));
          localStorage.setItem("student_id", res.user_id || "shlok");
          setStoredProfile(res.profile);
        }
      })
      .catch((err) => {
        console.warn("Background login sync notice:", err);
      });

    // 4. Immediately execute navigation with zero delay (0ms)
    window.location.href = "/dashboard";
  };

  const handleContinueAsCurrent = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prof = currentProfile || {
      id: "user-9308da7fc2e9",
      full_name: "Shlok Sngh",
      email: "iamshloksingh@gmail.com",
      grade_stream: "UG 1st Year B.Tech / Engineering",
      focus_span_minutes: 45,
      school_start_time: "08:00",
      school_end_time: "14:30",
      sleep_start_time: "23:30",
      peak_energy: "Late Night",
    };
    localStorage.setItem("student_profile", JSON.stringify(prof));
    localStorage.setItem("student_id", prof.id || "shlok");
    setStoredProfile(prof);
    window.location.href = "/dashboard";
  };

  const handleQuickPreset = (preset: (typeof DEMO_PRESETS)[0]) => {
    const qProf: UserProfile = {
      id: `user-${preset.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)}`,
      full_name: preset.name,
      email: preset.email,
      grade_stream: preset.stream,
      focus_span_minutes: 45,
      school_start_time: "08:00",
      school_end_time: "14:30",
      sleep_start_time: "23:30",
      peak_energy: "Late Night",
    };
    localStorage.setItem("student_profile", JSON.stringify(qProf));
    localStorage.setItem("student_id", qProf.id);
    setStoredProfile(qProf);
    window.location.href = "/dashboard";
  };

  const handleSwitchAccount = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    clearUserSession();
    setCurrentProfile(null);
    setIdentifier("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A191E] via-[#0F172A] to-[#13232C] text-white flex items-center justify-center p-4 sm:p-6 py-10">
      <div className="max-w-md w-full bg-[#0F172A]/90 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-salmon-500 to-salmon-400 mx-auto flex items-center justify-center shadow-lg shadow-salmon-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            StudyBuddy<span className="text-salmon-400">.AI</span> Login
          </h1>
          <p className="text-xs text-teal-200/80">
            Access your personalized chronobiology study planner and career roadmap.
          </p>
        </div>

        {/* Existing active profile card (if already logged in) */}
        {mounted && currentProfile && (
          <div className="p-4 rounded-2xl bg-teal-900/30 border border-teal-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-teal-300 font-bold uppercase tracking-wider">
                Active Local Session
              </span>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="text-[11px] text-gray-400 hover:text-salmon-400 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogOut className="w-3 h-3" /> Switch Account
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 font-black flex items-center justify-center text-sm">
                {currentProfile.full_name?.slice(0, 1) || "S"}
              </div>
              <div className="overflow-hidden">
                <div className="font-extrabold text-sm text-white truncate">
                  {currentProfile.full_name}
                </div>
                <div className="text-xs text-salmon-400 truncate">
                  {currentProfile.grade_stream}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleContinueAsCurrent}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-900/30 cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Divider if active session is present */}
        {mounted && currentProfile && (
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#1E333D] w-full" />
            <span className="bg-[#0F172A] px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
              or sign in below
            </span>
            <div className="border-t border-[#1E333D] w-full" />
          </div>
        )}

        {/* Quick Demo Preset Pills for 1-Click Instant Login */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-salmon-400" />
            <span>Quick 1-Click Demo Profiles:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleQuickPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-[#13232C] hover:bg-teal-900/40 border border-[#1E333D] hover:border-teal-500/50 text-[11px] font-semibold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{p.name.split(" ")[0]}</span>
                <span className="text-[10px] text-teal-400">({p.stream.split(" ")[0]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Email Address or Full Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Shlok Sngh or your.email@domain.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm bg-[#13232C] border border-[#1E333D] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5 mb-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-salmon-400" />
              <span>Target Academic Stream / Level</span>
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-[#13232C] border border-[#1E333D] text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
            >
              {STREAM_CATEGORIES.map((cat) => (
                <optgroup
                  key={cat.category}
                  label={cat.category}
                  className="bg-[#0F172A] text-teal-400 font-bold"
                >
                  {cat.options.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#13232C] text-white font-normal">
                      {opt}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-salmon-500 hover:bg-salmon-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-salmon-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Entering Workspace...</span>
              </>
            ) : (
              <>
                <span>Sign In to StudyBuddy</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Onboarding */}
        <div className="text-center pt-2 border-t border-[#1E333D]">
          <p className="text-xs text-gray-400">
            First time using StudyBuddy?{" "}
            <Link
              href="/onboarding"
              className="font-bold text-salmon-400 hover:text-salmon-300 underline underline-offset-2"
            >
              Complete Onboarding Wizard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
