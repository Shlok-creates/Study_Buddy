"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import LevelUpModal from "@/components/LevelUpModal";
import {
  fetchProfile,
  fetchAnalytics,
  getStoredUserId,
  getStoredProfile,
  setStoredProfile,
  clearUserSession,
  UserProfile,
  AnalyticsData,
} from "@/lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Initialize with null so server HTML and initial client hydration match 100%
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const loadUserData = async (userId: string) => {
    try {
      const [profData, analData] = await Promise.all([
        fetchProfile(userId).catch(() => null),
        fetchAnalytics(userId).catch(() => null),
      ]);
      if (profData) {
        setProfile(profData);
        setStoredProfile(profData);
      }
      if (analData) {
        setAnalytics(analData);
      }
    } catch (err) {
      console.warn("AppShell background sync notice:", err);
    }
  };

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("student_profile") ||
          localStorage.getItem("study_buddy_profile")
        : null;

    if (!raw) {
      const fallbackId =
        typeof window !== "undefined"
          ? localStorage.getItem("student_id") ||
            localStorage.getItem("study_buddy_user_id")
          : null;

      if (!fallbackId) {
        if (pathname !== "/onboarding" && pathname !== "/login") {
          window.location.href = "/login";
        }
        return;
      }
    }

    try {
      const parsed = raw ? JSON.parse(raw) : {};
      const studentId =
        parsed.id ||
        (typeof window !== "undefined" ? localStorage.getItem("student_id") : null) ||
        "shlok";
      const studentName = parsed.full_name || parsed.name || "Shlok Sngh";
      const validProfile: UserProfile = {
        id: studentId,
        full_name: studentName,
        email: parsed.email || "",
        grade_stream: parsed.grade_stream || "UG 1st Year B.Tech / Engineering",
        focus_span_minutes: parsed.focus_span_minutes || 45,
        school_start_time: parsed.school_start_time || "08:00",
        school_end_time: parsed.school_end_time || "14:30",
        sleep_start_time: parsed.sleep_start_time || "23:30",
        peak_energy: parsed.peak_energy || "Late Night",
      };
      setProfile(validProfile);
      loadUserData(validProfile.id);
    } catch {
      if (pathname !== "/onboarding" && pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-[#0A191E]">
      <Sidebar
        studentName={profile?.full_name || "Shlok Sngh"}
        gradeStream={profile?.grade_stream || "UG 1st Year B.Tech / Engineering"}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader profile={profile} streakDays={analytics?.streak_days || 0} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
      <LevelUpModal />
    </div>
  );
}
