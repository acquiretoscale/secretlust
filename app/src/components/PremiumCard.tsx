"use client";

export default function PremiumCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="break-inside-avoid mb-3 rounded-xl overflow-hidden cursor-pointer relative group"
    >
      <div className="bg-gradient-to-br from-rose-700 via-rose-600 to-rose-800 p-6 flex flex-col items-center justify-center min-h-[260px] transition-all group-hover:brightness-110">
        {/* Crown icon */}
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
          </svg>
        </div>

        <h3 className="text-white text-lg font-extrabold tracking-tight mb-1.5">
          PREMIUM ACCESS
        </h3>
        <p className="text-white/60 text-xs text-center leading-relaxed mb-5 max-w-[180px]">
          Endless Scenarios · Your Vision · Instant Creation
        </p>

        <div className="px-5 py-2.5 bg-white/15 border border-white/20 rounded-lg text-white text-sm font-bold hover:bg-white/25 transition-colors">
          GET STARTED
        </div>
      </div>
    </div>
  );
}
