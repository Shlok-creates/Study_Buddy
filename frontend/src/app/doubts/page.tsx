"use client";

import React, { useState, useRef, useEffect } from "react";
import AppShell from "@/components/AppShell";
import Flashcard3D from "@/components/Flashcard3D";
import { snapSolveDoubt, fetchFlashcards, getStoredUserId, FlashcardSetItem } from "@/lib/api";
import { STREAM_CATEGORIES, DEFAULT_STREAM } from "@/lib/streams";
import {
  Camera,
  Sparkles,
  Youtube,
  MessageSquare,
  ExternalLink,
  BookOpen,
  Layers,
  AlertCircle,
  FileQuestion,
} from "lucide-react";

export default function DoubtsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gradeStream, setGradeStream] = useState(DEFAULT_STREAM);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pastFlashcards, setPastFlashcards] = useState<FlashcardSetItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const userId = getStoredUserId();
      if (!userId) return;
      const data = await fetchFlashcards(userId);
      setPastFlashcards(data);
    } catch (err) {
      console.error("Failed to load flashcard history", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
      setErrorMessage(null);
    }
  };

  const handleSampleBiologyQuestion = () => {
    // Generate a sample Biology question snapshot
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0A191E";
      ctx.fillRect(0, 0, 640, 320);
      ctx.fillStyle = "#20B2AA";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("Biology Question: Photosynthesis & Light Reactions", 30, 50);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "16px sans-serif";
      ctx.fillText("Explain the Z-scheme of light reactions in photosynthesis.", 30, 100);
      ctx.fillText("Where does photolysis of water occur and which photosystem", 30, 130);
      ctx.fillText("absorbs light at 680 nm versus 700 nm?", 30, 160);
      ctx.fillStyle = "#FFA07A";
      ctx.font = "italic 15px sans-serif";
      ctx.fillText("Keywords: PS I, PS II, Thylakoid membrane, ATP & NADPH synthesis", 30, 220);

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], "photosynthesis_doubt.jpg", { type: "image/jpeg" });
          setFile(sampleFile);
          setPreviewUrl(canvas.toDataURL("image/jpeg"));
          setErrorMessage(null);
        }
      }, "image/jpeg");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const userId = getStoredUserId();
    if (!userId) {
      setErrorMessage("Please complete onboarding first before solving doubts.");
      return;
    }

    setLoading(true);
    setResultData(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("student_id", userId);
    formData.append("grade_stream", gradeStream);

    try {
      const res = await snapSolveDoubt(formData);
      if (res.success === false || res.error) {
        setErrorMessage(res.error || res.detail || "Vision AI failed to analyze this image.");
      } else {
        setResultData(res.data);
        await loadFlashcards();
      }
    } catch (err: any) {
      console.error("Doubt solve error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while analyzing the snapshot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <Sparkles className="w-4 h-4 text-salmon-500" />
            <span>Vision AI + Socratic Extraction Core</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            Snap-to-Flashcard & Omni-Search Doubt Solver
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Upload or snapshot any question across Science, Coding, Math, Commerce, or Arts. Our multimodal Vision AI reads the actual question and produces a Socratic conceptual solution, active recall flashcards, and verified YouTube timestamps.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Uploader Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Target Stream:
                </label>
                <select
                  value={gradeStream}
                  onChange={(e) => setGradeStream(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-teal-500 max-w-xs"
                >
                  {STREAM_CATEGORIES.map((cat) => (
                    <optgroup key={cat.category} label={cat.category} className="bg-white dark:bg-[#0F172A] font-bold text-teal-600 dark:text-teal-400">
                      {cat.options.map((opt) => (
                        <option key={opt} value={opt} className="text-gray-900 dark:text-gray-100 font-normal">
                          {opt}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSampleBiologyQuestion}
                className="text-xs text-salmon-500 hover:text-salmon-600 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <FileQuestion className="w-3.5 h-3.5" />
                <span>Load Sample Biology / Photosynthesis Doubt</span>
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-500/40 dark:border-teal-500/30 hover:border-teal-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer bg-teal-50/20 dark:bg-[#0A2328]/20 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Question preview"
                    className="max-h-48 rounded-xl object-contain border border-teal-500/30 shadow-md"
                  />
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-2">
                    Click to choose a different photo
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-salmon-500" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Drop your question snapshot here, or <span className="text-teal-500">browse</span>
                  </div>
                  <p className="text-xs text-gray-400">Supports JPG, PNG, WEBP snapshot images</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full py-3 rounded-2xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-sm shadow-lg shadow-salmon-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Question with Vision AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Omni-Solve Question & Generate Flashcards</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Omni-Search 3-Card Split View */}
        {resultData && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Omni-Search Tri-View Synthesis
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1: AI Step-by-Step Breakdown + 3D Flip Flashcards */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <BookOpen className="w-4 h-4 text-salmon-500" />
                    <span>Card 1: Socratic Solution & Flashcards</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
                    Conceptual Breakdown
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-1">
                    {resultData.ai_breakdown}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-[#1E333D]">
                  <Flashcard3D
                    cards={resultData.flashcards || []}
                    topicTitle="Active Recall Sprint"
                  />
                </div>
              </div>

              {/* Card 2: YouTube Timestamp Snippet Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-2">
                    <Youtube className="w-4 h-4" />
                    <span>Card 2: Verified Video Snippet</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {resultData.youtube_resource?.title || "Recommended Video Lecture"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Targeted timestamp window indexed to this exact topic
                  </p>

                  <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Search Query:</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400 truncate max-w-[180px]">
                        {resultData.youtube_resource?.search_query}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Time Window:</span>
                      <span className="font-mono text-salmon-500 font-bold">
                        {Math.floor((resultData.youtube_resource?.start_seconds || 60) / 60)}:
                        {((resultData.youtube_resource?.start_seconds || 60) % 60)
                          .toString()
                          .padStart(2, "0")}{" "}
                        - {Math.floor((resultData.youtube_resource?.end_seconds || 240) / 60)}:
                        {((resultData.youtube_resource?.end_seconds || 240) % 60)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    resultData.youtube_resource?.search_query || "academic concept lecture"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Open Target Lecture on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Card 3: Community Forum Discussion Synthesis */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <MessageSquare className="w-4 h-4 text-salmon-500" />
                    <span>Card 3: Peer Consensus & Shortcuts</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Community Perspective
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Peer debates, common pitfalls, and conceptual tricks
                  </p>

                  <div className="mt-4 p-4 rounded-2xl bg-teal-50/40 dark:bg-[#0A2328]/40 border border-teal-500/20 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-60 overflow-y-auto">
                    {resultData.community_perspective}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-[11px] text-gray-500 flex items-center justify-between">
                  <span>Spaced Repetition Interval:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">Day 1 Review Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Flashcard Sets History */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Your Spaced Repetition Flashcard Decks
            </h2>
            <span className="text-xs text-gray-400">
              {pastFlashcards.length} decks saved
            </span>
          </div>

          {pastFlashcards.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1E333D] text-xs text-gray-500">
              No doubt decks saved yet. Upload a question above to generate your first active recall deck!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastFlashcards.map((set) => (
                <div
                  key={set.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-600 dark:text-teal-400 truncate max-w-[200px]">
                      {set.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-salmon-500/10 text-salmon-500 font-mono text-[11px]">
                      SRS {set.srs_interval}d
                    </span>
                  </div>

                  <Flashcard3D cards={set.cards} topicTitle={set.topic} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
