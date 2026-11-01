"use client";

import React, { useState } from "react";
import { RotateCw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Brain } from "lucide-react";
import { Flashcard } from "@/lib/api";

interface Flashcard3DProps {
  cards: Flashcard[];
  topicTitle?: string;
}

export default function Flashcard3D({ cards, topicTitle = "Active Recall Sprint" }: Flashcard3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-[#1E333D] rounded-2xl">
        <Brain className="w-10 h-10 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">No active recall flashcards generated yet.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleRate = (level: "easy" | "good" | "hard") => {
    if (level === "easy" || level === "good") {
      setMasteredCount((c) => c + 1);
    }
    handleNext();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {topicTitle}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#1E333D] font-mono">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-64 cursor-pointer perspective-1000 select-none"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-2xl shadow-lg border border-gray-200 dark:border-[#1E333D] ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full backface-hidden p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-[#0F172A] dark:to-[#13232C] flex flex-col justify-between border-t-4 border-salmon-500">
            <div className="flex items-center justify-between text-xs text-salmon-500 font-bold uppercase tracking-wider">
              <span>Question / Challenge</span>
              <span className="flex items-center gap-1 text-gray-400 text-[11px] font-normal normal-case">
                <RotateCw className="w-3 h-3" /> Click card to flip
              </span>
            </div>

            <div className="text-gray-800 dark:text-gray-100 font-medium text-base sm:text-lg leading-relaxed text-center px-4 overflow-y-auto">
              {currentCard?.front}
            </div>

            <div className="text-center text-xs text-gray-400">
              Spaced Repetition Sprint • Active Recall
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-white dark:from-[#0A2328] dark:to-[#0F172A] flex flex-col justify-between border-t-4 border-teal-500">
            <div className="flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
              <span>Verified Solution & Derivation</span>
              <span className="text-xs text-gray-400 font-normal">SRS Day 1</span>
            </div>

            <div className="text-gray-900 dark:text-gray-100 font-medium text-sm sm:text-base leading-relaxed text-center px-4 overflow-y-auto">
              {currentCard?.back}
            </div>

            <div className="flex justify-center items-center gap-2 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("hard");
                }}
                className="px-3 py-1 rounded-md text-xs bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
              >
                Hard (1d)
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("good");
                }}
                className="px-3 py-1 rounded-md text-xs bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 hover:bg-teal-500/20"
              >
                Good (3d)
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("easy");
                }}
                className="px-3 py-1 rounded-md text-xs bg-salmon-500/10 text-salmon-500 border border-salmon-500/30 hover:bg-salmon-500/20"
              >
                Easy (7d)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full flex items-center justify-between mt-4">
        <button
          onClick={handlePrev}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#13232C] hover:bg-gray-200 dark:hover:bg-[#1E333D] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
        >
          <RotateCw className="w-3.5 h-3.5" /> Flip Card
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#13232C] hover:bg-gray-200 dark:hover:bg-[#1E333D] transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

