"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Users, Award, Flame, UserPlus, RefreshCw } from "lucide-react";
import { fetchPodLeaderboard, joinPodRoom, PodLeaderboardItem } from "@/lib/api";

interface StudyPodLeaderboardProps {
  currentRoomCode?: string;
  onRoomChange?: (room: string) => void;
}

export default function StudyPodLeaderboard({
  currentRoomCode = "FOCUS-2026",
  onRoomChange,
}: StudyPodLeaderboardProps) {
  const [roomCode, setRoomCode] = useState(currentRoomCode);
  const [leaderboard, setLeaderboard] = useState<PodLeaderboardItem[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const loadLeaderboard = async (code: string) => {
    setLoading(true);
    try {
      const data = await fetchPodLeaderboard(code);
      setLeaderboard(data.leaderboard);
      setActiveCount(data.active_students_count);
    } catch (err) {
      console.error("Failed to load pod leaderboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(roomCode);
  }, [roomCode]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const cleanCode = inputCode.trim().toUpperCase();
    try {
      await joinPodRoom(cleanCode);
      setRoomCode(cleanCode);
      setInputCode("");
      setShowJoinModal(false);
      if (onRoomChange) onRoomChange(cleanCode);
    } catch (err) {
      console.error("Error joining pod", err);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-yellow-500 font-bold">🥇 1st</span>;
    if (rank === 2) return <span className="text-slate-400 font-bold">🥈 2nd</span>;
    if (rank === 3) return <span className="text-amber-600 font-bold">🥉 3rd</span>;
    return <span className="text-gray-400 font-medium">#{rank}</span>;
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#1E333D]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-salmon-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Study Pod Leaderboard
            </h3>
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <span>Room:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.2 rounded">
                {roomCode}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadLeaderboard(roomCode)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-gray-100 dark:hover:bg-[#1E333D] transition-colors"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-salmon-500/10 text-salmon-500 hover:bg-salmon-500/20 border border-salmon-500/30 flex items-center gap-1"
          >
            <UserPlus className="w-3 h-3" />
            <span>Switch</span>
          </button>
        </div>
      </div>

      {/* Join Room Inline Form */}
      {showJoinModal && (
        <form onSubmit={handleJoin} className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] flex gap-2">
          <input
            type="text"
            placeholder="Room code e.g. NEET-2026"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-[#1E333D] text-gray-800 dark:text-gray-100 uppercase font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white"
          >
            Join
          </button>
          <button
            type="button"
            onClick={() => setShowJoinModal(false)}
            className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Members List */}
      <div className="mt-3 divide-y divide-gray-100 dark:divide-[#1E333D]/60 space-y-1">
        {leaderboard.map((member) => {
          const isYou = member.student_id === "student-demo-01";
          return (
            <div
              key={member.student_id}
              className={`pt-2 pb-2 px-2 rounded-xl flex items-center justify-between transition-colors ${
                isYou
                  ? "bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/30"
                  : "hover:bg-gray-50 dark:hover:bg-[#13232C]/60"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 text-center text-xs font-bold">{getRankBadge(member.rank)}</div>
                <div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>{member.student_name}</span>
                    {isYou && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-salmon-500 text-white font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400">{member.last_active}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  {member.tasks_completed_count} tasks
                </div>
                <div className="text-[10px] text-gray-400">completed</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

