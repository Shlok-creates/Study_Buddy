"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("student_profile") ||
          localStorage.getItem("study_buddy_profile")
        : null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.full_name || parsed.id)) {
          window.location.href = "/dashboard";
          return;
        }
      } catch {}
    }

    const studentId =
      typeof window !== "undefined"
        ? localStorage.getItem("student_id") ||
          localStorage.getItem("study_buddy_user_id")
        : null;

    if (studentId) {
      window.location.href = "/dashboard";
      return;
    }

    window.location.href = "/login";
  }, []);

  return (
    <div className="min-h-screen bg-[#0A191E] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
