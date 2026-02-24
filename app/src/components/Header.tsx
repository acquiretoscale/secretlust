"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Header({ onAuthClick, onPricingClick }: { onAuthClick?: () => void; onPricingClick?: () => void }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("sl_videos");
    window.location.href = "/";
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[56px] bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 14.5v-4.5H8V10h4V7.5l3.5 3.5-3.5 3.5z" fill="white" />
            </svg>
          </span>
          <span className="text-white text-lg font-extrabold tracking-tight uppercase">
            SecretLust<span className="text-rose-500">AI</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Premium button */}
              <button
                onClick={onPricingClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold rounded-full cursor-pointer hover:brightness-110 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>
                PREMIUM
              </button>

              {/* User icon + dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center cursor-pointer hover:bg-white/[0.12] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-56 bg-[#1a1625] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-[11px] text-white/40 mb-0.5">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setDropdownOpen(false); onPricingClick?.(); }} className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>
                        Membership
                      </button>
                      <button className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Delete Account
                      </button>
                    </div>
                    <div className="border-t border-white/[0.06] py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-400"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onPricingClick || onAuthClick}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold rounded-full cursor-pointer hover:brightness-110 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>
                PREMIUM
              </button>
              <button
                onClick={onAuthClick}
                className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center cursor-pointer hover:bg-white/[0.12] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
