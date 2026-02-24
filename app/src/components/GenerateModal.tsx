"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Video } from "@/lib/supabase";

function SettingsPopup({ onClose }: { onClose: () => void }) {
  const [quality, setQuality] = useState("medium");
  const [fps, setFps] = useState("16");
  const [duration, setDuration] = useState("5s");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const pill = (active: boolean, label: string, tag?: string) => (
    <span
      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
        active
          ? "bg-rose-600 text-white"
          : "bg-white/[0.04] text-white/50 hover:text-white/70"
      }`}
    >
      {label}
      {tag && <span className="ml-1 text-[9px] text-amber-300 font-semibold">{tag}</span>}
    </span>
  );

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-[260px] rounded-xl border border-white/[0.1] bg-[#111015] shadow-2xl p-4 z-30"
    >
      <h3 className="text-white text-sm font-extrabold mb-1">Generation Settings</h3>
      <p className="text-white/40 text-[10px] leading-snug mb-3">
        High quality and longer videos require more processing time
      </p>

      <div className="mb-3">
        <p className="text-white/60 text-[10px] font-bold mb-1.5">Video Quality</p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setQuality("medium")}>{pill(quality === "medium", "Medium")}</button>
          <button type="button" onClick={() => setQuality("high")}>{pill(quality === "high", "High")}</button>
          <button type="button" onClick={() => setQuality("ultra")}>{pill(quality === "ultra", "Ultra", "Ultra")}</button>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-white/60 text-[10px] font-bold mb-1.5">Frame Rate</p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setFps("16")}>{pill(fps === "16", "16")}</button>
          <button type="button" onClick={() => setFps("24")}>{pill(fps === "24", "24", "Deluxe")}</button>
          <button type="button" onClick={() => setFps("32")}>{pill(fps === "32", "32", "Ultra")}</button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-white/60 text-[10px] font-bold mb-1.5">Duration</p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setDuration("5s")}>{pill(duration === "5s", "5s")}</button>
          <button type="button" onClick={() => setDuration("7s")}>{pill(duration === "7s", "7s", "Deluxe")}</button>
          <button type="button" onClick={() => setDuration("10s")}>{pill(duration === "10s", "10s", "Ultra")}</button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold cursor-pointer hover:brightness-110 transition-all"
      >
        Confirm Settings
      </button>
    </div>
  );
}

function InfoPopup({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-2 w-[220px] rounded-xl border border-white/[0.1] bg-[#111015] shadow-2xl p-3 z-30"
    >
      <p className="text-white/80 text-[10px] leading-relaxed">
        The uploaded image will be used as the first frame of the generated video.
      </p>
      <p className="text-white/60 text-[10px] leading-relaxed mt-1.5">
        For best results, match the original image. The AI follows basic physics — objects not in the input image are unlikely to appear in the generated video.
      </p>
    </div>
  );
}

export default function GenerateModal({
  video,
  onClose,
  onUpgrade,
}: {
  video: Video;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const previewImage = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  function onPickFile(file: File | null) {
    if (!file) return;
    setImageFile(file);
    setImageUrl(file.name);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#09090c] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/55 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="block">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-3.5">
          <h2 className="text-white text-base font-extrabold uppercase tracking-tight leading-none pr-10">
            {video.title}
          </h2>
          <p className="mt-1 text-white/45 text-[10px] font-semibold tracking-wider uppercase">
            Customize your fantasy
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-stretch">
            <label className="w-full max-w-[170px] sm:max-w-[155px] mx-auto rounded-xl border border-dashed border-white/20 bg-white/[0.02] aspect-[3/4] flex flex-col items-center justify-center text-center px-2.5 cursor-pointer hover:bg-white/[0.03] transition-colors">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Selected source"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-white/70">
                      <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-bold leading-tight">Click to upload image</p>
                  <p className="text-white/40 text-[11px] mt-1">JPG, PNG up to 10MB</p>
                  <span className="mt-3 px-2.5 py-1 rounded-md border border-white/[0.12] bg-black/40 text-white/70 text-[10px] font-bold tracking-widest">
                    SOURCE
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="hidden sm:flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-amber-400/60 bg-amber-500/10 flex items-center justify-center text-amber-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>

            <div className="w-full max-w-[170px] sm:max-w-[155px] mx-auto rounded-xl border border-white/[0.1] overflow-hidden bg-black aspect-[3/4] relative">
              <video
                src={video.src}
                poster={video.thumb || undefined}
                muted
                playsInline
                autoPlay
                loop
                preload="metadata"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-amber-400 text-black text-[10px] font-extrabold whitespace-nowrap leading-none">
                Gen Result
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-white/45 text-[10px]">
            <span className="text-rose-400">•</span> 18+ Only. Ensure compliance with local regulations.
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300/40 bg-amber-400/10 text-amber-300 font-bold text-sm">
            <span className="w-6 h-6 rounded-md bg-amber-400 text-black flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
              </svg>
            </span>
            <span>Fast Mode</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {/* Settings gear — left */}
            <div className="relative">
              <button
                className="h-10 w-10 rounded-lg border border-white/[0.12] bg-white/[0.03] text-white/70 cursor-pointer hover:bg-white/[0.05] flex items-center justify-center"
                type="button"
                onClick={() => { setShowSettings(!showSettings); setShowInfo(false); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="block">
                  <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              {showSettings && <SettingsPopup onClose={() => setShowSettings(false)} />}
            </div>

            <button
              type="button"
              className="h-10 flex-1 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-extrabold tracking-wider hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 cursor-pointer"
              disabled={!imageFile}
              onClick={onUpgrade}
            >
              GENERATE
            </button>

            {/* Info — right */}
            <div className="relative">
              <button
                className="h-10 w-10 rounded-lg border border-white/[0.12] bg-white/[0.03] text-white/70 cursor-pointer hover:bg-white/[0.05] flex items-center justify-center"
                type="button"
                onClick={() => { setShowInfo(!showInfo); setShowSettings(false); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="block">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="8" r="1" fill="currentColor" />
                  <rect x="11" y="11" width="2" height="6" rx="1" fill="currentColor" />
                </svg>
              </button>
              {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}
            </div>
          </div>

          {imageUrl && <p className="mt-1.5 text-[10px] text-white/40 truncate">Selected: {imageUrl}</p>}
        </div>
      </div>
    </div>
  );
}
