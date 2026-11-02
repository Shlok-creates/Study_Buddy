"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import SkillTreeModal from "@/components/SkillTreeModal";
import StudyPodLeaderboard from "@/components/StudyPodLeaderboard";
import {
  fetchSkillTracks,
  fetchSkillTree,
  submitSkillQuiz,
  SkillNodeItem,
} from "@/lib/api";
import {
  Network,
  Lock,
  Unlock,
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
} from "lucide-react";

export default function SkillTreePage() {
  const [tracks, setTracks] = useState<string[]>([
    "Web Development",
    "NEET Biology",
    "Financial Accounting",
  ]);
  const [selectedTrack, setSelectedTrack] = useState("Web Development");
  const [nodes, setNodes] = useState<SkillNodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeModalNode, setActiveModalNode] = useState<SkillNodeItem | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
    if (selectedTrack) {
      loadTree(selectedTrack);
    }
  }, [selectedTrack]);

  const loadTracks = async () => {
    try {
      const data = await fetchSkillTracks();
      if (data.tracks && data.tracks.length > 0) {
        setTracks(data.tracks);
        setSelectedTrack(data.tracks[0]);
      }
    } catch (err) {
      console.error("Tracks load error:", err);
    }
  };

  const loadTree = async (track: string) => {
    try {
      setLoading(true);
      const items = await fetchSkillTree(track);
      // Strictly sort by level_order ascending
      const sorted = [...items].sort((a, b) => a.level_order - b.level_order);
      setNodes(sorted);
    } catch (err) {
      console.error("Tree load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node: SkillNodeItem) => {
    if (!node.is_unlocked) {
      setBannerMessage(
        `🔒 Level ${node.level_order} ("${node.title}") is locked. Complete Level ${node.level_order - 1} with >= 80% score to unlock!`
      );
      return;
    }
    setActiveModalNode(node);
  };

  const handleScoreSubmit = async (nodeId: string, percentage: number) => {
    try {
      const res = await submitSkillQuiz(nodeId, percentage);
      setBannerMessage(res.message);
      // Immediately re-fetch and update local state so the UI reflects unlocked green status
      const updated = await fetchSkillTree(selectedTrack);
      const sorted = [...updated].sort((a, b) => a.level_order - b.level_order);
      setNodes(sorted);
    } catch (err) {
      console.error("Submit quiz error:", err);
    }
  };

  const sortedNodes = [...nodes].sort((a, b) => a.level_order - b.level_order);

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4 text-salmon-500" />
              <span>Duolingo-Style Mastery Trees & Pods</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              Gamified Skill Trees & Pods
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              Progress sequentially through circular mastery nodes. Complete level-gate quizzes with 80%+ score to unlock the subsequent tier and climb the peer study pod ranks.
            </p>
          </div>

          {/* Track Selector Dropdown / Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Track:</span>
            <div className="flex bg-gray-100 dark:bg-[#13232C] p-1 rounded-2xl border border-gray-200 dark:border-[#1E333D]">
              {tracks.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTrack(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedTrack === t
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Alert on unlock or locked attempt */}
        {bannerMessage && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-sm font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-salmon-500 flex-shrink-0" />
              <span>{bannerMessage}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-xs underline text-gray-400 hover:text-gray-600 dark:hover:text-white ml-2 flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Split View: Vertical Tree on Left & Study Pod Leaderboard on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vertical Tree (Duolingo Style) */}
          <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm flex flex-col items-center relative overflow-hidden">
            {/* Track Info Badge */}
            <div className="w-full flex items-center justify-between pb-6 border-b border-gray-100 dark:border-[#1E333D] mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-salmon-500">
                  Active Skill Path
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {selectedTrack} Mastery Track
                </h3>
              </div>
              <div className="text-xs font-mono px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                {sortedNodes.filter((n) => n.is_completed).length} Mastered • {sortedNodes.filter((n) => n.is_unlocked).length} / {sortedNodes.length} Unlocked
              </div>
            </div>

            {/* Tree Nodes List */}
            <div className="relative flex flex-col items-center space-y-12 my-4 w-full max-w-md">
              {/* Connecting background vertical winding line */}
              <div className="absolute top-8 bottom-8 w-1.5 bg-gradient-to-b from-teal-500 via-teal-600 to-gray-300 dark:to-gray-700 rounded-full z-0" />

              {sortedNodes.map((node, index) => {
                const isUnlocked = node.is_unlocked;
                const isCompleted = Boolean(node.is_completed);
                // Alternate subtle left/right offset for Duolingo winding feel
                const xOffset = index % 2 === 0 ? "-translate-x-6 sm:-translate-x-12" : "translate-x-6 sm:translate-x-12";

                return (
                  <div
                    key={node.id}
                    className={`relative z-10 flex flex-col items-center transition-all transform ${xOffset}`}
                  >
                    {/* Circular Node Button */}
                    <button
                      type="button"
                      onClick={() => handleNodeClick(node)}
                      title={isUnlocked ? `Open Level ${node.level_order} Assessment` : `Locked (Complete Level ${node.level_order - 1} first)`}
                      className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold shadow-xl transition-all duration-300 transform group relative ${
                        isCompleted
                          ? "bg-teal-600 hover:bg-teal-500 text-white border-4 border-teal-300 ring-4 ring-teal-500/30 hover:scale-105"
                          : isUnlocked
                          ? "bg-salmon-500 hover:bg-salmon-600 text-white shadow-salmon-500/40 border-4 border-salmon-300 ring-4 ring-salmon-500/30 hover:scale-105 active:scale-95"
                          : "bg-gray-200 dark:bg-[#1E333D] text-gray-400 border-4 border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
                          <span className="text-[10px] font-extrabold mt-0.5 uppercase tracking-wide">Mastered</span>
                        </>
                      ) : isUnlocked ? (
                        <>
                          <Unlock className="w-6 h-6 text-white transition-transform group-hover:rotate-12" />
                          <span className="text-[11px] font-extrabold mt-0.5">Lvl {node.level_order}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 text-gray-500" />
                          <span className="text-[10px] text-gray-400 mt-0.5">Locked</span>
                        </>
                      )}

                      {/* Glowing halo for unlocked frontier node */}
                      {isUnlocked && !isCompleted && (
                        <div className="absolute -inset-1.5 rounded-full bg-salmon-400/30 animate-pulse -z-10" />
                      )}
                    </button>

                    {/* Node Title Card */}
                    <div
                      onClick={() => handleNodeClick(node)}
                      className={`mt-2.5 px-3 py-1.5 rounded-xl text-center max-w-[200px] transition-colors border ${
                        isUnlocked
                          ? "bg-teal-50 dark:bg-[#0A2328] border-teal-200 dark:border-teal-800 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-teal-400"
                          : "bg-gray-100 dark:bg-[#13232C] border-gray-200 dark:border-[#1E333D] text-gray-400 cursor-not-allowed opacity-70"
                      }`}
                    >
                      <div className="text-xs font-bold truncate">
                        {isCompleted && "✓ "}Level {node.level_order}: {node.title}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-0.5">
                        <span>{node.quiz?.length || 10} Questions</span>
                        {isUnlocked ? (
                          <ChevronRight className="w-3 h-3 text-teal-500" />
                        ) : (
                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Collaborative Study Pod Leaderboard */}
          <div>
            <StudyPodLeaderboard
              currentRoomCode="FOCUS-2026"
              onRoomChange={(newRoom) => {}}
            />
          </div>
        </div>

        {/* Modal for Level-Unlock Quiz */}
        {activeModalNode && activeModalNode.is_unlocked && (
          <SkillTreeModal
            node={activeModalNode}
            isOpen={Boolean(activeModalNode)}
            onClose={() => setActiveModalNode(null)}
            onSubmitScore={handleScoreSubmit}
          />
        )}
      </div>
    </AppShell>
  );
}
