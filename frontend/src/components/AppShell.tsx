"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import {
  fetchProfile,
  fetchAnalytics,
  getStoredUserId,
  getStoredProfile,
  UserProfile,
  AnalyticsData,
} from "@/lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const loadUserData = async (userId: string) => {
    try {
      const [profData, analData] = await Promise.all([
        fetchProfile(userId),
        fetchAnalytics(userId),
      ]);
      setProfile(profData);
      setAnalytics(analData);
    } catch (err) {
      console.error("AppShell data load error:", err);
      // Fallback to locally cached profile
      const local = getStoredProfile();
      if (local) setProfile(local);
    }
  };

  useEffect(() => {
    const storedId = getStoredUserId();

    // If user is not authenticated and not already on /onboarding, redirect to /onboarding
    if (!storedId) {
      if (pathname !== "/onboarding") {
        router.replace("/onboarding");
      }
      setCheckedAuth(true);
      return;
    }

    setCheckedAuth(true);
    loadUserData(storedId);
  }, [pathname, router]);

  if (!checkedAuth && pathname !== "/onboarding") {
    return (
      <div className="min-h-screen bg-[#0A191E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-[#0A191E]">
      <Sidebar
        studentName={profile?.full_name || "Scholar"}
        gradeStream={profile?.grade_stream || "Class 11 Science"}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader profile={profile} streakDays={analytics?.streak_days || 0} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
