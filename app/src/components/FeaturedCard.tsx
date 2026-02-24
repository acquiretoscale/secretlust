"use client";

import Link from "next/link";
import { Video } from "@/lib/supabase";

export default function FeaturedCard({ video }: { video: Video }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden min-h-[280px] max-h-[360px] mb-5 bg-[#1a1625] cursor-pointer group">
      {/* Background video / fallback gradient */}
      <div className="absolute inset-0">
        {video.src ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            src={video.src}
            poster={video.thumb || undefined}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a1a35] via-[#1a1625] to-[#0f0c15]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c15]/15 via-[#0f0c15]/55 to-[#0f0c15]/90" />
      </div>

      {/* HOT corner badge */}
      <div className="absolute top-0 left-0 z-10 w-0 h-0 border-t-[64px] border-t-red-500 border-r-[64px] border-r-transparent">
        <span className="absolute -top-[54px] left-1 text-white text-[0.62rem] font-extrabold tracking-wide -rotate-45">
          {video.featured_label || "HOT"}
        </span>
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[13px] font-semibold w-fit">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="5.5" cy="4.5" r="2.5" stroke="white" strokeWidth="1.2" />
            <path d="M1 12c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {video.used || "0"} Users
        </span>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
          {video.title}
        </h1>
        <p className="text-sm text-white/55">{video.title}</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 mt-1 w-fit bg-gradient-to-br from-rose-500 to-rose-700 text-white text-[15px] font-bold rounded-lg no-underline transition-all hover:brightness-110 hover:shadow-[0_4px_20px_rgba(225,29,72,0.35)]"
        >
          ✦ Create Now
        </Link>
      </div>
    </div>
  );
}
