"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userId = getStoredUserId();
    if (userId) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A191E] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
