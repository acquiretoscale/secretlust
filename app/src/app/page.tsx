"use client";

import { useEffect, useState } from "react";
import { ensureVideosSeeded, supabase, Video } from "@/lib/supabase";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import VideoGrid from "@/components/VideoGrid";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import GenerateModal from "@/components/GenerateModal";
import PricingModal from "@/components/PricingModal";

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState<"explore" | "mine">("explore");

  useEffect(() => {
    async function load() {
      await ensureVideosSeeded();

      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .eq("featured", false)
        .order("created_at", { ascending: false })
        .range(0, 5);

      setVideos((vids as Video[]) || []);
      setLoading(false);

      // Auto-open auth modal if redirected from /login
      if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("auth")) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) setShowAuth(true);
        // Clean URL
        window.history.replaceState({}, "", "/");
      }
    }
    load();
  }, []);

  function handleGenerateClick(video: Video) {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setShowAuth(true);
        return;
      }
      setSelectedVideo(video);
      setShowGenerate(true);
    });
  }

  function handleTabChange(tab: "explore" | "mine") {
    if (tab === "mine") {
      supabase.auth.getUser().then(({ data }) => {
        if (!data.user) { setShowAuth(true); return; }
        setActiveTab("mine");
      });
    } else {
      setActiveTab("explore");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onAuthClick={() => setShowAuth(true)} onPricingClick={() => setShowPricing(true)} />
        <Tabs active="explore" />
        <main className="flex-1 pt-[110px] pb-10 max-w-[1440px] mx-auto px-3 w-full" />
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onAuthClick={() => setShowAuth(true)} onPricingClick={() => setShowPricing(true)} />
      <Tabs active={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 pt-[110px] pb-10 max-w-[1440px] mx-auto px-3 w-full">
        {activeTab === "explore" ? (
          <VideoGrid
            initialVideos={videos}
            onVideoGenerateClick={handleGenerateClick}
            onPricingClick={() => setShowPricing(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="text-white/60 text-lg font-semibold mb-1">No generations yet</h3>
            <p className="text-white/30 text-sm mb-5">Generate your first video from the Explore tab</p>
            <button
              onClick={() => setActiveTab("explore")}
              className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-bold rounded-lg cursor-pointer hover:brightness-110 transition-all"
            >
              Explore Templates
            </button>
          </div>
        )}
      </main>

      <Footer />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showGenerate && selectedVideo && (
        <GenerateModal
          video={selectedVideo}
          onClose={() => {
            setShowGenerate(false);
            setSelectedVideo(null);
          }}
          onUpgrade={() => setShowPricing(true)}
        />
      )}
      {showPricing && (
        <PricingModal
          video={selectedVideo}
          onClose={() => setShowPricing(false)}
        />
      )}
    </div>
  );
}
