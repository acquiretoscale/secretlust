"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, Video } from "@/lib/supabase";
import VideoCard from "./VideoCard";
import PremiumCard from "./PremiumCard";

const PAGE_SIZE = 6;
const LOAD_DELAY_MS = 800;

export default function VideoGrid({
  initialVideos,
  onVideoGenerateClick,
  onPricingClick,
}: {
  initialVideos: Video[];
  onVideoGenerateClick: (video: Video) => void;
  onPricingClick: () => void;
}) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialVideos.length >= PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [{ data }] = await Promise.all([
        supabase
          .from("videos")
          .select("*")
          .eq("featured", false)
          .order("created_at", { ascending: false })
          .range(from, to),
        new Promise((r) => setTimeout(r, LOAD_DELAY_MS)),
      ]);

      const rows = (data as Video[]) || [];
      if (rows.length > 0) {
        setVideos((prev) => [...prev, ...rows]);
        setPage((p) => p + 1);
        if (rows.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "180px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="columns-2 sm:columns-3 md:columns-4 xl:columns-5 gap-3">
        {/* Premium promo as first card */}
        <PremiumCard onClick={onPricingClick} />

        {videos.map((video, i) => (
          <VideoCard
            key={video.id}
            video={video}
            index={i}
            onGenerateClick={onVideoGenerateClick}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-px mt-4" />

      {loading && (
        <div className="columns-2 sm:columns-3 md:columns-4 xl:columns-5 gap-3 mt-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-3 rounded-xl overflow-hidden"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div
                className="w-full bg-gradient-to-br from-[#1a1625] to-[#1e1a2a] animate-pulse"
                style={{ aspectRatio: "9/16" }}
              >
                <div className="w-full h-full relative overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
                      animation: "shimmer 1.8s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
