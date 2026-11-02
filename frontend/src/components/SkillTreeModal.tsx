"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Award, ArrowRight, HelpCircle } from "lucide-react";
import { SkillNodeItem, QuizQuestion } from "@/lib/api";

interface SkillTreeModalProps {
  node: SkillNodeItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmitScore: (nodeId: string, percentage: number) => void;
}

export default function SkillTreeModal({
  node,
  isOpen,
  onClose,
  onSubmitScore,
}: SkillTreeModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);
  const [correctTotal, setCorrectTotal] = useState(0);

  if (!isOpen || !node || !node.is_unlocked) return null;

  const quiz: QuizQuestion[] = node.quiz || [];
  const totalQuestions = quiz.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (totalQuestions === 0) {
      onSubmitScore(node.id, 100);
      onClose();
      return;
    }

    let correctCount = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    setCorrectTotal(correctCount);
    setScorePercentage(percentage);
    setSubmitted(true);
    onSubmitScore(node.id, percentage);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScorePercentage(0);
    setCorrectTotal(0);
  };

  const passed = scorePercentage >= 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#1E333D] rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#1E333D]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Level {node.level_order} Assessment • {node.track}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{node.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-[#1E333D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!submitted ? (
          <div className="mt-5 space-y-6">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs">
              <span className="text-teal-700 dark:text-teal-300">
                Passing Requirement: <strong>80% Score (at least {Math.ceil(totalQuestions * 0.8)}/{totalQuestions} correct)</strong>
              </span>
              <span className="font-mono font-bold text-salmon-500">
                {answeredCount} / {totalQuestions} Answered
              </span>
            </div>

            <div className="space-y-4">
              {quiz.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-[#13232C] border border-gray-200 dark:border-[#1E333D]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400 font-mono">
                      Question {qIdx + 1} of {totalQuestions}
                    </span>
                    {selectedAnswers[qIdx] !== undefined && (
                      <span className="text-[10px] text-teal-500 font-semibold">Answered</span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {q.question}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(qIdx, optIdx)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-teal-600 text-white font-semibold shadow-sm"
                              : "bg-white dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1E333D] hover:border-teal-500"
                          }`}
                        >
                          <span>{opt}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-white bg-white text-teal-600" : "border-gray-400"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions}
              className="w-full py-3.5 rounded-2xl bg-salmon-500 hover:bg-salmon-600 text-white font-bold text-sm shadow-lg shadow-salmon-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Submit & Evaluate Level Mastery ({answeredCount}/{totalQuestions})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Result View */
          <div className="mt-5 text-center space-y-4">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-xl ${
                passed
                  ? "bg-teal-500 text-white shadow-teal-500/30"
                  : "bg-salmon-500 text-white shadow-salmon-500/30"
              }`}
            >
              {passed ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {passed ? "Level Gate Unlocked!" : "Mastery Gate Locked"}
              </h3>
              <p className="text-sm font-semibold mt-1">
                Your Score:{" "}
                <span className={passed ? "text-teal-600 dark:text-teal-400 font-bold" : "text-salmon-500 font-bold"}>
                  {scorePercentage}% ({correctTotal}/{totalQuestions} Correct)
                </span>{" "}
                • Required: 80%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                {passed
                  ? "Outstanding mastery! The subsequent level node on this path has been unlocked."
                  : "Score fell below 80%. Review the explanations below and retake the quiz to unlock the next level."}
              </p>
            </div>

            {/* Answer Explanations */}
            <div className="text-left space-y-3 mt-4 max-h-72 overflow-y-auto pr-1">
              {quiz.map((q, idx) => {
                const wasCorrect = selectedAnswers[idx] === q.correct_index;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs ${
                      wasCorrect
                        ? "bg-teal-50 dark:bg-[#0A2328] border-teal-200 dark:border-teal-800"
                        : "bg-red-50 dark:bg-[#201318] border-red-200 dark:border-red-900"
                    }`}
                  >
                    <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 mb-1">
                      {wasCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span>Question {idx + 1} of {totalQuestions}: {q.question}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mt-1">
                      <strong>Your Answer:</strong> {q.options[selectedAnswers[idx]] ?? "None"} |{" "}
                      <strong>Correct Answer:</strong>{" "}
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{q.options[q.correct_index]}</span>
                    </div>
                    {q.explanation && (
                      <div className="text-gray-500 dark:text-gray-400 mt-1 italic">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-3">
              {!passed && (
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-[#13232C] text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-200"
                >
                  Retry Assessment
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30"
              >
                Close & Return to Tree
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
