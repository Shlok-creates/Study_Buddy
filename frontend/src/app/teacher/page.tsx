"use client";

import React, { useState, useRef, useEffect } from "react";
import AppShell from "@/components/AppShell";
import AudioPlayer from "@/components/AudioPlayer";
import { explainTeacherNotes, getStoredProfile } from "@/lib/api";
import { STREAM_CATEGORIES, DEFAULT_STREAM } from "@/lib/streams";
import {
  GraduationCap,
  Sparkles,
  Upload,
  FileText,
  Volume2,
  BookOpen,
  Headphones,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SAMPLE_NOTES = `Newton's Third Law and Conservation of Linear Momentum:
Every action has an equal and opposite reaction. In an isolated system with no external net force,
total momentum remains constant (P_initial = P_final).
For example, when a rocket expels exhaust gases backward with momentum p_gas,
the rocket propels forward with equal and opposite momentum p_rocket.
In elastic collisions, both linear momentum and kinetic energy are conserved.
In inelastic collisions, kinetic energy is partially converted into internal thermal energy or deformation,
though linear momentum is still conserved.`;

export default function TeacherPage() {
  const [file, setFile] = useState<File | null>(null);
  const [textNotes, setTextNotes] = useState(SAMPLE_NOTES);
  const [selectedStream, setSelectedStream] = useState<string>(DEFAULT_STREAM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"read" | "voice">("read");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const prof = getStoredProfile();
    if (prof?.grade_stream) {
      setSelectedStream(prof.grade_stream);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!file && !textNotes.trim()) {
      setErrorMessage("Please upload a PDF/TXT lecture note or provide text notes.");
      return;
    }

    setLoading(true);
    setResult(null);

    // Build FormData exactly matching the backend signature
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (textNotes.trim()) {
      formData.append("text_content", textNotes.trim());
    }
    formData.append("student_grade", selectedStream.split(" ")[0]);
    formData.append("student_stream", selectedStream);
    formData.append("grade_stream", selectedStream);

    try {
      const data = await explainTeacherNotes(formData);
      setResult(data);
    } catch (err: any) {
      console.error("Teacher explain error:", err);
      setErrorMessage(err.message || "Failed to process lecture notes. Ensure the file is not empty or corrupted.");
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
            <GraduationCap className="w-4 h-4 text-salmon-500" />
            <span>Dual Read / Voice Mode • Edge-TTS en-IN-NeerjaNeural</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            AI Teacher Explainer
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Upload dense PDF lecture notes or paste syllabus excerpts. Our Groq high-reasoning engine translates academic jargon into intuitive everyday analogies and generates natural spoken audio.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input & Upload Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-80">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Target Academic Stream / Level:
                </label>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-teal-500"
                >
                  {STREAM_CATEGORIES.map((cat) => (
                    <optgroup key={cat.category} label={`── ${cat.category} ──`}>
                      {cat.streams.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setTextNotes(SAMPLE_NOTES);
                  setErrorMessage(null);
                }}
                className="text-xs text-salmon-500 hover:text-salmon-600 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Mechanics Notes</span>
              </button>
            </div>

            {/* Drag/Drop PDF Upload or Paste Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDF Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                  file
                    ? "border-teal-500 bg-teal-50/20 dark:bg-teal-950/20"
                    : "border-gray-300 dark:border-[#1E333D] hover:border-teal-500 bg-gray-50/50 dark:bg-[#13232C]/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className={`w-8 h-8 ${file ? "text-teal-500" : "text-gray-400"}`} />
                <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {file ? file.name : "Upload PDF or TXT Notes"}
                </div>
                <p className="text-[11px] text-gray-400">
                  {file ? `${(file.size / 1024).toFixed(1)} KB selected` : "Click to select file from device"}
                </p>
                {file && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-[10px] text-red-500 underline"
                  >
                    Remove file
                  </button>
                )}
              </div>

              {/* Text Input Area */}
              <div>
                <textarea
                  rows={5}
                  value={textNotes}
                  onChange={(e) => {
                    setTextNotes(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Or paste study notes directly here..."
                  className="w-full h-full min-h-[140px] p-3.5 rounded-2xl text-xs bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white font-mono leading-relaxed focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!file && !textNotes.trim())}
              className="w-full py-3 rounded-2xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-salmon-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Analogies & Generating Voice Audio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Explain Like a World-Class Teacher (Voice + Text)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Dual Read / Voice Result Presentation */}
        {result && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-6 animate-fade-in">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#1E333D]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveMode("read")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeMode === "read"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Reading View</span>
                </button>

                <button
                  onClick={() => setActiveMode("voice")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeMode === "voice"
                      ? "bg-salmon-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Voice Mode (Audio Player)</span>
                </button>
              </div>

              <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold hidden sm:inline-block">
                Level: {result.grade_stream}
              </span>
            </div>

            {/* Audio Player Widget */}
            {result.audio_url && (
              <div className="max-w-xl mx-auto">
                <AudioPlayer
                  audioUrl={result.audio_url}
                  title="Teacher Audio Masterclass"
                  voiceName="en-IN-NeerjaNeural"
                />
              </div>
            )}

            {/* Reading View Text Container */}
            <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-teal-50/20 dark:bg-[#0A2328]/30 border border-teal-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                <span>Teacher Explanation (Spoken Prose)</span>
                <span className="text-gray-400 font-normal">Clean conversational English</span>
              </div>
              <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 leading-relaxed font-sans">
                {result.explanation_text}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
