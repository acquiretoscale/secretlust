"use client";

export default function Tabs({
  active = "explore",
  onTabChange,
}: {
  active?: "explore" | "mine";
  onTabChange?: (tab: "explore" | "mine") => void;
}) {
  return (
    <div className="fixed top-[56px] left-0 right-0 z-40 h-[44px] bg-[#0a0a0a] border-b border-white/[0.06] flex items-end px-5">
      <button
        onClick={() => onTabChange?.("explore")}
        className={`px-4 pb-2.5 text-[15px] font-bold uppercase tracking-wide border-b-2 transition-colors cursor-pointer ${
          active === "explore"
            ? "text-white border-rose-600"
            : "text-white/35 border-transparent hover:text-white/60"
        }`}
      >
        Explore
      </button>
      <button
        onClick={() => onTabChange?.("mine")}
        className={`px-4 pb-2.5 text-[15px] font-bold uppercase tracking-wide border-b-2 transition-colors cursor-pointer ${
          active === "mine"
            ? "text-white border-rose-600"
            : "text-white/35 border-transparent hover:text-white/60"
        }`}
      >
        Mine
      </button>
    </div>
  );
}
