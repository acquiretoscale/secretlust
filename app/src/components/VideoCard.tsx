"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Video } from "@/lib/supabase";
import { captureThumbnail, persistThumbnail } from "@/lib/thumbnail";

const MAX_ACTIVE_VIDEOS = 6;
const activeVideos: HTMLVideoElement[] = [];

function registerActiveVideo(videoEl: HTMLVideoElement) {
  const existing = activeVideos.indexOf(videoEl);
  if (existing !== -1) {
    activeVideos.splice(existing, 1);
  }

  while (activeVideos.length >= MAX_ACTIVE_VIDEOS) {
    const oldest = activeVideos.shift();
    if (!oldest || oldest === videoEl) continue;
    oldest.pause();
    oldest.currentTime = 0;
  }

  activeVideos.push(videoEl);
}

function unregisterActiveVideo(videoEl: HTMLVideoElement) {
  const idx = activeVideos.indexOf(videoEl);
  if (idx !== -1) activeVideos.splice(idx, 1);
}

export default function VideoCard({
  video,
  onGenerateClick,
  index = 0,
}: {
  video: Video;
  onGenerateClick: (video: Video) => void;
  index?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [thumb, setThumb] = useState(video.thumb || "");
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const thumbCaptured = useRef(false);
  const saveData =
    typeof navigator !== "undefined"
      ? Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
      : false;

  const ensureVideoLoaded = useCallback(() => {
    const v = videoRef.current;
    if (!v || !video.src) return;

    if (!videoLoaded) {
      v.src = video.src;
      v.load();
      setVideoLoaded(true);
    }
  }, [video.src, videoLoaded]);

  const stopPreview = useCallback((reset = false) => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    unregisterActiveVideo(v);
    if (reset) v.currentTime = 0;
    setIsPlaying(false);
  }, []);

  const startPreview = useCallback(async () => {
    const v = videoRef.current;
    if (!v || !video.src) return;
    if (saveData) return;

    ensureVideoLoaded();
    registerActiveVideo(v);
    try {
      await v.play();
      setIsPlaying(true);
    } catch {
      unregisterActiveVideo(v);
      setIsPlaying(false);
    }
  }, [ensureVideoLoaded, saveData, video.src]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          revealObserver.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "40px 0px" }
    );
    revealObserver.observe(card);
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries[0]?.isIntersecting ?? false;
        setIsVisible(inView);
        if (inView) {
          void startPreview();
        } else {
          stopPreview(true);
        }
      },
      { threshold: 0.15, rootMargin: "80px 0px" }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [revealed, startPreview, stopPreview]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        stopPreview(true);
      } else if (isVisible) {
        startPreview();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isVisible, startPreview, stopPreview]);

  useEffect(() => {
    return () => stopPreview(true);
  }, [stopPreview]);

  async function handleMouseEnter() {
    await startPreview();

    // Thumbnail generation is deferred to desktop hover only.
    if (!thumb && !thumbCaptured.current) {
      thumbCaptured.current = true;
      const dataUrl = await captureThumbnail(video.src);
      if (dataUrl) {
        setThumb(dataUrl);
        persistThumbnail(video.id, dataUrl);
      }
    }
  }

  function handleMouseLeave() {
    // Keep viewport-driven playback active while pointer moves across cards.
    // Playback will stop when the card leaves the viewport.
  }

  return (
    <div
      ref={cardRef}
      className={`break-inside-avoid mb-3 rounded-xl overflow-hidden bg-[#1a1625] relative cursor-pointer transition-transform hover:scale-[1.01] group ${
        revealed ? "" : "opacity-0"
      }`}
      style={
        revealed
          ? {
              animation: "card-reveal 0.6s cubic-bezier(0.16,1,0.3,1) both",
              animationDelay: `${(index % 6) * 150}ms`,
            }
          : undefined
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onGenerateClick(video)}
    >
      <div className="relative w-full">
        {/* Thumbnail */}
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            loading="lazy"
            className={`w-full block object-cover transition-opacity ${isPlaying ? "opacity-0" : "opacity-100"}`}
          />
        ) : (
          <div className="w-full aspect-[9/16] bg-gradient-to-br from-[#1a1625] to-[#23202c] flex items-center justify-center">
            <div className="w-9 h-9 opacity-[0.18] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2024%2024%27%20fill=%27white%27%3E%3Cpath%20d=%27M8%205v14l11-7z%27/%3E%3C/svg%3E')] bg-center bg-contain bg-no-repeat" />
          </div>
        )}

        {/* Video (hidden until hover) */}
        <video
          ref={videoRef}
          preload="none"
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* GENERATE hover CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-rose-900/40">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            GENERATE
          </span>
        </div>

        {/* Card info */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pointer-events-none">
          {/* Label badge */}
          {video.featured_label && (
            <span className="inline-block px-2 py-0.5 mb-1.5 bg-rose-600/80 text-white text-[10px] font-bold rounded-md uppercase">
              {video.featured_label}
            </span>
          )}
          <div className="text-[13px] font-semibold leading-snug truncate text-white mb-0.5">
            {video.title}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/50">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
              <circle cx="5.5" cy="4.5" r="2.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
              <path d="M1 12c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {video.used || "0"} Users
          </div>
        </div>
      </div>
    </div>
  );
}
