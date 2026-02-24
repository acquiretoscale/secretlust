"use client";

import { useState } from "react";
import { Video } from "@/lib/supabase";

const PLANS = [
  { id: "10k",  credits: "10K",  price: "$9.99",   bonus: "" },
  { id: "20k",  credits: "20K",  price: "$19.99",  bonus: "" },
  { id: "59k",  credits: "59K",  price: "$49.99",  bonus: "+18%" },
  { id: "149k", credits: "149K", price: "$99.99",  bonus: "+49%", popular: true },
  { id: "269k", credits: "269K", price: "$149.99", bonus: "+79%" },
  { id: "630k", credits: "630K", price: "$299.99", bonus: "+110%" },
];

export default function PricingModal({
  video,
  onClose,
}: {
  video?: Video | null;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState("149k");
  const plan = PLANS.find((p) => p.id === selected)!;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[440px] max-h-[94vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#09090c] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/55 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="block">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start gap-3.5 mb-4">
            {video?.src && (
              <div className="w-14 h-[75px] rounded-lg overflow-hidden border border-white/[0.1] flex-shrink-0 bg-black">
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
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-white text-lg font-extrabold tracking-tight leading-tight">
                Get Credits to Generate
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                Select a package below
              </p>
              {video && (
                <p className="text-white/25 text-[10px] mt-1 truncate">
                  Template: {video.title}
                </p>
              )}
            </div>
          </div>

          {/* Lifetime badge */}
          <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            No monthly payment — credits with LIFETIME use
          </div>

          {/* Plan list */}
          <div className="flex flex-col gap-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={`relative w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                  selected === p.id
                    ? "border-rose-500/70 bg-rose-600/[0.08] shadow-[0_0_16px_rgba(225,29,72,0.1)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                {/* Radio circle */}
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected === p.id ? "border-rose-500" : "border-white/20"
                  }`}
                >
                  {selected === p.id && <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />}
                </span>

                {/* Credits */}
                <div className="flex-1 min-w-0">
                  <span className="text-white text-base font-extrabold">{p.credits}</span>
                  <span className="text-white/40 text-xs ml-1">Credits</span>
                </div>

                {/* Bonus badge */}
                {p.bonus && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold leading-none flex-shrink-0">
                    {p.bonus}
                  </span>
                )}

                {/* Popular badge */}
                {p.popular && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider flex-shrink-0">
                    Popular
                  </span>
                )}

                {/* Price */}
                <span className="text-white text-base font-extrabold flex-shrink-0">{p.price}</span>
              </button>
            ))}
          </div>

          {/* Payment buttons for selected plan */}
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
            <p className="text-white/50 text-[11px] font-semibold mb-3 text-center">
              Pay <span className="text-white font-extrabold">{plan.price}</span> for <span className="text-white font-extrabold">{plan.credits} Credits</span>
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-bold cursor-pointer hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/80">
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                CARD WITH TELEGRAM
              </button>

              <button
                type="button"
                className="w-full py-3 rounded-lg border border-white/[0.12] bg-white/[0.03] text-white/80 text-sm font-bold cursor-pointer hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                  <circle cx="8" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="16" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                PAY VIA CRYPTO
              </button>
            </div>
          </div>

          <p className="mt-3 text-center text-white/25 text-[10px]">
            Credits never expire. All payments are securely processed.
          </p>
        </div>
      </div>
    </div>
  );
}
