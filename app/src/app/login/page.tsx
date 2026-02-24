"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  useEffect(() => {
    // If already logged in, go straight home
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        window.location.href = "/";
      }
    });
  }, []);

  // Redirect to home with auth modal trigger
  useEffect(() => {
    window.location.href = "/?auth=1";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <p className="text-white/40 text-sm">Redirecting...</p>
    </div>
  );
}
