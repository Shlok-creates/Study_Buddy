"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  fetchMySquads,
  fetchSquadFeed,
  createSquad,
  joinSquad,
  reactSquadFeedItem,
  postSquadMessage,
  getStoredUserId,
  getStoredProfile,
  StudySquad,
  SquadFeedItem,
} from "@/lib/api";
import {
  Users,
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  UserPlus,
  Send,
  MessageSquare,
  Shield,
  Clock,
} from "lucide-react";

export default function SquadsPage() {
  const [squads, setSquads] = useState<StudySquad[]>([]);
  const [activeSquad, setActiveSquad] = useState<StudySquad | null>(null);
  const [feed, setFeed] = useState<SquadFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  // Modals & Inputs
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadDesc, setNewSquadDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadSquads = async () => {
    try {
      setLoading(true);
      const res = await fetchMySquads();
      setSquads(res.squads);
      if (res.squads.length > 0) {
        const current = activeSquad 
          ? res.squads.find((s) => s.id === activeSquad.id) || res.squads[0]
          : res.squads[0];
        setActiveSquad(current);
        loadFeed(current.id);
      }
    } catch (err) {
      console.error("Failed to load squads", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeed = async (squadId: number) => {
    try {
      setFeedLoading(true);
      const res = await fetchSquadFeed(squadId);
      setFeed(res.feed);
    } catch (err) {
      console.error("Failed to load squad feed", err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    loadSquads();
  }, []);

  const handleSelectSquad = (squad: StudySquad) => {
    setActiveSquad(squad);
    loadFeed(squad.id);
  };

  const handleCopyInviteCode = () => {
    if (!activeSquad) return;
    navigator.clipboard.writeText(activeSquad.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) return;
    setActionError(null);
    try {
      const res = await createSquad(newSquadName.trim(), newSquadDesc.trim());
      setActionSuccess(`Squad "${res.squad.name}" created! Invite code: ${res.squad.invite_code}`);
      setNewSquadName("");
      setNewSquadDesc("");
      setShowCreateModal(false);
      await loadSquads();
    } catch (err: any) {
      setActionError(err.message || "Failed to create squad");
    }
  };

  const handleJoinSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setActionError(null);
    try {
      const res = await joinSquad(joinCode.trim());
      setActionSuccess(res.message);
      setJoinCode("");
      setShowJoinModal(false);
      await loadSquads();
    } catch (err: any) {
      setActionError(err.message || "Failed to join squad");
    }
  };

  const handleReact = async (itemId: number, emoji: "🔥" | "👏" | "🎯") => {
    // Optimistic reaction update
    setFeed((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            reactions: {
              ...item.reactions,
              [emoji]: (item.reactions[emoji] || 0) + 1,
            },
          };
        }
        return item;
      })
    );

    try {
      await reactSquadFeedItem(itemId, emoji);
    } catch (err) {
      console.error("Failed to react", err);
    }
  };

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeSquad) return;

    const text = messageInput.trim();
    setMessageInput("");
    const userProfile = getStoredProfile();
    const studentName = userProfile?.full_name || "Scholar";
    const studentId = getStoredUserId() || "user";

    // Optimistic feed insert
    const tempItem: SquadFeedItem = {
      id: Date.now(),
      squad_id: activeSquad.id,
      student_id: studentId,
      student_name: studentName,
      event_type: "cheer",
      message: text,
      reactions: { "🔥": 0, "👏": 0, "🎯": 0 },
      created_at: new Date().toISOString(),
    };
    setFeed((prev) => [tempItem, ...prev]);

    try {
      const realItem = await postSquadMessage(activeSquad.id, text);
      setFeed((prev) => prev.map((it) => (it.id === tempItem.id ? realItem : it)));
    } catch (err) {
      console.error("Failed to post message", err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-[#005959] text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-salmon-500/20 text-salmon-400 border border-salmon-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Social Study Pods
              </span>
              <span className="text-teal-200 text-xs">Peer Accountability & Cheer Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Social Squads & Broadcast Feed
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm max-w-xl">
              Study alongside dedicated peers. Celebrate syllabus milestones, cheer study streaks, and stay disciplined together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setShowJoinModal(true);
                setActionError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-teal-200" />
              <span>Join with Code</span>
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setActionError(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-xs shadow-lg shadow-salmon-500/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Squad</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-semibold flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-teal-500 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Squad Selection Switcher */}
        {squads.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">My Squads:</span>
            {squads.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSquad(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeSquad?.id === s.id
                    ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                    : "bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] text-gray-700 dark:text-gray-300 hover:border-teal-500"
                }`}
              >
                {s.name} ({s.member_count})
              </button>
            ))}
          </div>
        )}

        {/* Main Grid: Squad Details + Live Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Active Squad Overview & Members */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-extrabold uppercase tracking-wide">
                    Active Study Pod
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Shield className="w-3.5 h-3.5 text-teal-500" />
                    <span>Invite-Only</span>
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1.5">
                  {activeSquad?.name || "Study Squad"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activeSquad?.description || "Daily mutual accountability and problem-solving hub."}
                </p>
              </div>

              {/* 1-Click Invite Code Box */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Squad Invite Code:</span>
                  {copiedCode && (
                    <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 animate-fade-in">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-extrabold text-base text-salmon-500 tracking-wider">
                    {activeSquad?.invite_code || "ALPHA-2026"}
                  </span>
                  <button
                    onClick={handleCopyInviteCode}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
                  <span>Squad Scholars ({activeSquad?.members?.length || activeSquad?.member_count || 1})</span>
                  <span className="text-teal-600 text-[11px]">Synchronized</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeSquad?.members?.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-[#13232C] border border-gray-200/60 dark:border-[#1E333D]/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                          {m.student_name.slice(0, 1)}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[130px]">
                          {m.student_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (2 Cols): Live Milestone & Broadcast Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-salmon-500" />
                    Live Milestone Feed
                  </h2>
                  <p className="text-xs text-gray-500">
                    Real-time peer celebrations, task completions, and streak broadcasts
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>Real-Time Sync</span>
                </div>
              </div>

              {/* Cheer & Win Input Box */}
              <form onSubmit={handlePostMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Broadcast a study win, share a concept breakthrough, or cheer your squad..."
                  className="flex-1 px-4 py-2.5 rounded-2xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>

              {/* Feed Items Stream */}
              {feedLoading ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-20 bg-gray-100 dark:bg-[#13232C] rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : feed.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>No activity recorded in this squad yet. Be the first to post a study sprint!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feed.map((item) => {
                    const isLevelUp = item.event_type === "level_up";
                    const isStreak = item.event_type === "streak_milestone";
                    const isTask = item.event_type === "task_completed";

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isLevelUp
                            ? "bg-gradient-to-r from-amber-50/50 to-salmon-50/50 dark:from-[#231E12] dark:to-[#221516] border-amber-300 dark:border-amber-800/60"
                            : isStreak
                            ? "bg-salmon-50/40 dark:bg-[#201318]/50 border-salmon-200 dark:border-salmon-900/60"
                            : isTask
                            ? "bg-teal-50/30 dark:bg-[#0A2328]/40 border-teal-200 dark:border-teal-900/60"
                            : "bg-gray-50 dark:bg-[#13232C] border-gray-200 dark:border-[#1E333D]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                isLevelUp
                                  ? "bg-amber-500 text-white"
                                  : isStreak
                                  ? "bg-salmon-500 text-white"
                                  : isTask
                                  ? "bg-teal-600 text-white"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {isLevelUp ? (
                                <Award className="w-4 h-4" />
                              ) : isStreak ? (
                                <Flame className="w-4 h-4" />
                              ) : isTask ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <MessageSquare className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-900 dark:text-white">
                                {item.student_name}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(item.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isLevelUp
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                                : isStreak
                                ? "bg-salmon-100 text-salmon-700 dark:bg-salmon-900/50 dark:text-salmon-300"
                                : isTask
                                ? "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {item.event_type.replace("_", " ")}
                          </span>
                        </div>

                        {/* Event Message */}
                        <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 mt-2 font-medium leading-relaxed">
                          {item.message}
                        </p>

                        {/* Reaction Buttons Bar */}
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100 dark:border-[#1E333D]/60">
                          {(["🔥", "👏", "🎯"] as const).map((emoji) => {
                            const count = item.reactions[emoji] || 0;
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleReact(item.id, emoji)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                                  count > 0
                                    ? "bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-[#1E333D] text-gray-800 dark:text-gray-200 shadow-sm"
                                    : "bg-gray-100/70 dark:bg-[#13232C] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#1E333D]"
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-mono text-[11px] font-bold">{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Create Squad */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create a Study Squad</h3>
              <p className="text-xs text-gray-500">
                Form an invite-only peer pod. You will receive a unique invite code to share with your study partners.
              </p>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-medium">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleCreateSquad} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Squad Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JEE Rankers 2026 / Medicos Focus Pod"
                    value={newSquadName}
                    onChange={(e) => setNewSquadName(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Daily sprint accountability across Physics and Calculus."
                    value={newSquadDesc}
                    onChange={(e) => setNewSquadDesc(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-xs shadow-md shadow-salmon-500/30"
                  >
                    Create Squad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Join Squad */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Join Squad with Invite Code</h3>
              <p className="text-xs text-gray-500">
                Enter the 6-character squad code shared by your friend (e.g. ALPHA-2026 or SQUAD-XXXXXX).
              </p>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-medium">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleJoinSquad} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Invite Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ALPHA-2026"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-900/30"
                  >
                    Join Squad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

