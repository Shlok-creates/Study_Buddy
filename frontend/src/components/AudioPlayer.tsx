"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, FastForward, Sparkles } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  voiceName?: string;
}

export default function AudioPlayer({
  audioUrl,
  title = "AI Teacher Audio Lecture",
  voiceName = "en-IN-NeerjaNeural",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const fullAudioSrc = audioUrl.startsWith("http") ? audioUrl : `${API_BASE}${audioUrl}`;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-[#0F172A] border border-teal-700/60 text-white shadow-xl">
      <audio
        ref={audioRef}
        src={fullAudioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Volume2 className="w-5 h-5 text-salmon-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-salmon-500/20 text-salmon-400 border border-salmon-500/30 font-semibold">
                Voice Mode
              </span>
            </div>
            <div className="text-xs text-teal-300/80">Edge-TTS • {voiceName}</div>
          </div>
        </div>

        {/* Animated wave bars during playing */}
        <div className="flex items-end gap-1 h-6">
          {[4, 8, 12, 16, 10, 6, 14, 10].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-teal-400 transition-all duration-200 ${
                isPlaying ? "animate-pulse" : "opacity-40"
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (h * (i % 2 === 0 ? 1.2 : 0.8)))}px` : "6px",
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Scrubber */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-teal-950 rounded-lg appearance-none cursor-pointer accent-salmon-500"
        />
        <div className="flex justify-between text-[11px] text-teal-300 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-teal-800/40">
        <button
          onClick={() => {
            if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10);
          }}
          className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-teal-800/50 transition-colors"
          title="Rewind 10s"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-salmon-500 to-salmon-600 hover:from-salmon-600 hover:to-salmon-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-salmon-500/25 transition-all transform active:scale-95"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause Teacher</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Listen to Teacher</span>
            </>
          )}
        </button>

        <button
          onClick={cyclePlaybackRate}
          className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-teal-200 bg-teal-800/60 hover:bg-teal-700 border border-teal-600/40 transition-colors flex items-center gap-1"
          title="Change playback speed"
        >
          <FastForward className="w-3 h-3 text-salmon-400" />
          <span>{playbackRate}x</span>
        </button>
      </div>
    </div>
  );
}

