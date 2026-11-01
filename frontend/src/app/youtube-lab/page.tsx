"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import Flashcard3D from "@/components/Flashcard3D";
import { analyzeYoutubeVideo } from "@/lib/api";
import {
  Youtube,
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Play,
  RotateCcw,
} from "lucide-react";

const SAMPLE_VIDEOS = [
  {
    label: "Calculus - Essence of Calculus (3Blue1Brown)",
    url: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
  },
  {
    label: "Physics - Basic Introduction",
    url: "https://www.youtube.com/watch?v=b1t41Q3xRM8",
  },
  {
    label: "Biology - DNA Structure & Replication",
    url: "https://www.youtube.com/watch?v=TNKWgcFPHqw",
  },
];

export default function YoutubeLabPage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=WUvTyaaNkzM");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "flashcards" | "quiz">("summary");

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleAnalyze = async (videoUrl: string = url) => {
    if (!videoUrl) return;
    setLoading(true);
    setAnalysis(null);
    setQuizSubmitted(false);
    setSelectedAnswers({});

    try {
      const data = await analyzeYoutubeVideo(videoUrl);
      setAnalysis(data);
      setActiveTab("summary");
    } catch (err) {
      console.error("YouTube analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    if (!analysis?.quiz) return 0;
    let correct = 0;
    analysis.quiz.forEach((q: any, i: number) => {
      if (selectedAnswers[i] === q.correct_index) correct++;
    });
    return Math.round((correct / analysis.quiz.length) * 100);
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
            <Youtube className="w-4 h-4" />
            <span>YouTube Study Suite & Subtitle Extractor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            YouTube Video Study Lab
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Converts any YouTube lecture or tutorial directly into a high-yield Markdown summary, 5 spaced-repetition flashcards, and an interactive mastery quiz.
          </p>
        </div>

        {/* Input Bar & Preset Buttons */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Youtube className="w-5 h-5 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-salmon-500/30 transition-all flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Lecture</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Sample Videos */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-gray-400">Quick Test Lectures:</span>
            {SAMPLE_VIDEOS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(item.url);
                  handleAnalyze(item.url);
                }}
                className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-[#13232C] hover:bg-gray-200 dark:hover:bg-[#1E333D] text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        {analysis && (
          <div className="space-y-6">
            {/* Video Player + Stats Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-gray-200 dark:border-[#1E333D] bg-black shadow-lg aspect-video">
                <iframe
                  src={analysis.embed_url}
                  title="YouTube video player"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
                    Analysis Completed
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Lecture Synthesis Ready
                  </h3>
                  <div className="mt-4 space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#1E333D]">
                      <span className="text-gray-400">Video ID:</span>
                      <span className="font-mono font-semibold">{analysis.video_id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#1E333D]">
                      <span className="text-gray-400">Flashcards Created:</span>
                      <span className="font-semibold text-salmon-500">
                        {analysis.flashcards?.length || 5} cards
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-[#1E333D]">
                      <span className="text-gray-400">Quiz Questions:</span>
                      <span className="font-semibold text-teal-500">
                        {analysis.quiz?.length || 3} MCQs
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={analysis.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-[#13232C] hover:bg-gray-200 dark:hover:bg-[#1E333D] text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 3 Tabs: [Summary], [Flashcards], [Interactive Quiz with instant scoring] */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] shadow-sm space-y-6">
              {/* Tab Navigation */}
              <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-[#1E333D] pb-3">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "summary"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Structured Summary</span>
                </button>

                <button
                  onClick={() => setActiveTab("flashcards")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "flashcards"
                      ? "bg-salmon-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Flashcards ({analysis.flashcards?.length || 5})</span>
                </button>

                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "quiz"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Interactive Quiz ({analysis.quiz?.length || 3})</span>
                </button>
              </div>

              {/* Tab 1: Summary */}
              {activeTab === "summary" && (
                <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line space-y-4 max-w-4xl">
                  {analysis.summary}
                </div>
              )}

              {/* Tab 2: Flashcards */}
              {activeTab === "flashcards" && (
                <div className="max-w-2xl mx-auto py-4">
                  <Flashcard3D
                    cards={analysis.flashcards || []}
                    topicTitle="YouTube Lecture Flashcards"
                  />
                </div>
              )}

              {/* Tab 3: Interactive Quiz with instant scoring */}
              {activeTab === "quiz" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {!quizSubmitted ? (
                    <div className="space-y-5">
                      {analysis.quiz?.map((q: any, qIdx: number) => (
                        <div
                          key={qIdx}
                          className="p-5 rounded-2xl bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D] space-y-3"
                        >
                          <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {qIdx + 1}
                            </span>
                            <span>{q.question}</span>
                          </div>

                          <div className="space-y-2">
                            {q.options?.map((opt: string, optIdx: number) => {
                              const isSelected = selectedAnswers[qIdx] === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                                    isSelected
                                      ? "bg-teal-600 text-white font-semibold shadow-sm"
                                      : "bg-white dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1E333D] hover:border-teal-500"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                      isSelected
                                        ? "border-white bg-white text-teal-600"
                                        : "border-gray-400"
                                    }`}
                                  >
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-teal-600" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(selectedAnswers).length < (analysis.quiz?.length || 1)}
                        className="w-full py-3 rounded-2xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-salmon-500/30 transition-all disabled:opacity-50"
                      >
                        Submit Quiz & Calculate Score
                      </button>
                    </div>
                  ) : (
                    /* Instant Scoring View */
                    <div className="space-y-5 animate-fade-in">
                      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-700 to-[#005959] text-white text-center shadow-xl space-y-2">
                        <div className="text-xs uppercase font-bold tracking-wider text-teal-200">
                          Quiz Results
                        </div>
                        <div className="text-3xl font-extrabold">{calculateScore()}%</div>
                        <p className="text-xs text-teal-100">
                          Instant evaluation with step-by-step conceptual explanations below.
                        </p>
                      </div>

                      {analysis.quiz?.map((q: any, qIdx: number) => {
                        const userChoice = selectedAnswers[qIdx];
                        const isCorrect = userChoice === q.correct_index;

                        return (
                          <div
                            key={qIdx}
                            className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                              isCorrect
                                ? "bg-teal-50 dark:bg-[#0A2328] border-teal-200 dark:border-teal-800"
                                : "bg-red-50 dark:bg-[#201318] border-red-200 dark:border-red-900"
                            }`}
                          >
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                              {isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span>
                                Q{qIdx + 1}: {q.question}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              <div>
                                <span className="text-gray-400">Your Answer:</span>{" "}
                                <span className={isCorrect ? "text-teal-600 font-bold" : "text-red-500 font-bold"}>
                                  {q.options[userChoice] ?? "None"}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div>
                                  <span className="text-gray-400">Correct Answer:</span>{" "}
                                  <span className="text-teal-600 font-bold">
                                    {q.options[q.correct_index]}
                                  </span>
                                </div>
                              )}
                              {q.explanation && (
                                <p className="text-gray-500 dark:text-gray-400 italic pt-1">
                                  {q.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setSelectedAnswers({});
                        }}
                        className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-[#13232C] text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-200 flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Quiz</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

