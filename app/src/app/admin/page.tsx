"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ensureVideosSeeded, supabase, Video } from "@/lib/supabase";
import { captureThumbnail } from "@/lib/thumbnail";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [section, setSection] = useState<"videos" | "add" | "settings">("videos");

  // Form state
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [thumb, setThumb] = useState("");
  const [used, setUsed] = useState("");
  const [label, setLabel] = useState("");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [generatingThumb, setGeneratingThumb] = useState(false);
  const thumbDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const loadVideos = useCallback(async () => {
    const { data } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    setVideos((data as Video[]) || []);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email === adminEmail) {
        await ensureVideosSeeded();
        setAuthed(true);
        loadVideos();
      }
      setChecking(false);
    }
    checkAuth();
  }, [adminEmail, loadVideos]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleSrcChange(url: string) {
    setSrc(url);
    if (thumbDebounce.current) clearTimeout(thumbDebounce.current);
    if (!url) return;
    thumbDebounce.current = setTimeout(async () => {
      setGeneratingThumb(true);
      const dataUrl = await captureThumbnail(url);
      if (dataUrl) setThumb(dataUrl);
      setGeneratingThumb(false);
    }, 800);
  }

  function resetForm() {
    setEditId(null);
    setTitle("");
    setSrc("");
    setThumb("");
    setUsed("");
    setLabel("");
    setFeatured(false);
  }

  function editVideo(v: Video) {
    setEditId(v.id);
    setTitle(v.title);
    setSrc(v.src);
    setThumb(v.thumb || "");
    setUsed(v.used || "");
    setLabel(v.featured_label || "");
    setFeatured(v.featured);
    setSection("add");
  }

  async function saveVideo(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (featured) {
      await supabase.from("videos").update({ featured: false }).eq("featured", true);
    }

    const row = {
      title,
      src,
      thumb,
      used,
      featured_label: label || "HOT",
      featured,
    };

    if (editId) {
      await supabase.from("videos").update(row).eq("id", editId);
    } else {
      await supabase.from("videos").insert(row);
    }

    setSaving(false);
    resetForm();
    setSection("videos");
    loadVideos();
    showToast(editId ? "Video updated!" : "Video added!");
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    loadVideos();
    showToast("Deleted");
  }

  async function setFeaturedVideo(id: string) {
    await supabase.from("videos").update({ featured: false }).eq("featured", true);
    await supabase.from("videos").update({ featured: true }).eq("id", id);
    loadVideos();
    showToast("Featured updated");
  }

  // ── Auth check ──
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0c15]">
        <p className="text-white/50">Checking access...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0c15] gap-4">
        <p className="text-white/60 text-lg">Admin access required</p>
        <p className="text-white/40 text-sm">Sign in with your admin email first</p>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-gradient-to-br from-rose-500 to-rose-700 text-white font-bold rounded-lg no-underline"
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Admin UI ──
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0c15]">
      {/* Admin header */}
      <div className="h-[60px] bg-[#13111a] border-b border-white/[0.06] flex items-center justify-between px-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="w-7 h-7 rounded-md bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 14.5v-4.5H8V10h4V7.5l3.5 3.5-3.5 3.5z" fill="white" />
            </svg>
          </span>
          <span className="text-white font-bold">SecretlustAI</span>
        </Link>
        <span className="px-3 py-1 bg-rose-600/20 border border-rose-600 text-rose-400 text-xs font-bold rounded-full">
          ADMIN
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[200px] bg-[#13111a] border-r border-white/[0.06] py-4 flex-shrink-0 hidden md:block">
          {[
            { id: "videos" as const, label: "Videos", icon: "📹" },
            { id: "add" as const, label: "Add video", icon: "➕" },
            { id: "settings" as const, label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); if (item.id !== "add") resetForm(); }}
              className={`flex items-center gap-2 w-full px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                section === item.id
                  ? "text-white bg-white/[0.04] border-l-2 border-rose-600"
                  : "text-white/50 hover:text-white border-l-2 border-transparent"
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* ── VIDEOS LIST ── */}
          {section === "videos" && (
            <div>
              <h2 className="text-lg font-bold mb-4 pb-3 border-b border-white/[0.06]">
                All Videos ({videos.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/50">
                      <th className="px-3 py-2 bg-[#13111a]">Thumb</th>
                      <th className="px-3 py-2 bg-[#13111a]">Title</th>
                      <th className="px-3 py-2 bg-[#13111a]">Video URL</th>
                      <th className="px-3 py-2 bg-[#13111a]">Used</th>
                      <th className="px-3 py-2 bg-[#13111a]">Featured</th>
                      <th className="px-3 py-2 bg-[#13111a]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v) => (
                      <tr key={v.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="px-3 py-2">
                          {v.thumb ? (
                            <img src={v.thumb} alt="" className="w-12 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-16 bg-[#1a1625] rounded flex items-center justify-center text-xs text-white/20">N/A</div>
                          )}
                        </td>
                        <td className="px-3 py-2 font-semibold">{v.title}</td>
                        <td className="px-3 py-2 text-white/40 text-xs max-w-[200px] truncate">{v.src}</td>
                        <td className="px-3 py-2 text-white/50">{v.used || "—"}</td>
                        <td className="px-3 py-2">
                          {v.featured && (
                            <span className="px-2 py-0.5 bg-rose-600/15 border border-rose-600 text-rose-400 text-xs font-bold rounded-full">
                              ★ FEATURED
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button onClick={() => editVideo(v)} className="px-2 py-1 text-xs bg-white/[0.06] border border-white/[0.06] rounded cursor-pointer text-white/60 hover:text-white transition-colors">Edit</button>
                            <button onClick={() => setFeaturedVideo(v.id)} className="px-2 py-1 text-xs bg-white/[0.06] border border-white/[0.06] rounded cursor-pointer text-white/60 hover:text-white transition-colors">★ Feature</button>
                            <button onClick={() => deleteVideo(v.id)} className="px-2 py-1 text-xs bg-white/[0.06] border border-white/[0.06] rounded cursor-pointer text-rose-400 hover:bg-rose-600/15 hover:border-rose-600 transition-colors">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {videos.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-white/30">
                          No videos yet. Click &quot;Add video&quot; to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ADD / EDIT VIDEO ── */}
          {section === "add" && (
            <div>
              <h2 className="text-lg font-bold mb-4 pb-3 border-b border-white/[0.06]">
                {editId ? "Edit Video" : "Add Video"}
              </h2>

              <div className="p-4 bg-rose-600/[0.08] border border-rose-600/25 rounded-lg text-sm text-white/60 mb-6 leading-relaxed">
                <strong className="text-white">R2 Hosting:</strong> Upload your video to Cloudflare R2, then paste the public URL below.
                <br />Example: <code className="text-rose-300">https://pub-xxxxxxxx.r2.dev/videos/1.mp4</code>
              </div>

              <form onSubmit={saveVideo} className="max-w-[600px] space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Doggy Style POV" className="w-full px-3 py-2.5 bg-[#1a1625] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-rose-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Video URL (R2) *</label>
                  <input
                    value={src}
                    onChange={(e) => handleSrcChange(e.target.value)}
                    required
                    placeholder="https://pub-xxx.r2.dev/vids/1.mp4"
                    className="w-full px-3 py-2.5 bg-[#1a1625] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-rose-600"
                  />
                </div>
                {/* Thumbnail — auto-generated or manual override */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-white/50">Thumbnail</label>
                    {generatingThumb && (
                      <span className="text-[11px] text-rose-400 animate-pulse">Generating…</span>
                    )}
                    {thumb && !generatingThumb && (
                      <span className="text-[11px] text-green-400">✓ Auto-generated</span>
                    )}
                  </div>
                  <div className="flex gap-3 items-start">
                    {thumb && (
                      <div className="relative flex-shrink-0">
                        <img src={thumb} alt="thumb preview" className="w-16 h-24 object-cover rounded-lg border border-white/[0.06]" />
                        <button
                          type="button"
                          onClick={() => setThumb("")}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 rounded-full text-white text-[10px] flex items-center justify-center cursor-pointer"
                        >✕</button>
                      </div>
                    )}
                    <input
                      value={thumb.startsWith("data:") ? "" : thumb}
                      onChange={(e) => setThumb(e.target.value)}
                      placeholder={generatingThumb ? "Generating thumbnail…" : "Auto-generated, or paste a URL to override"}
                      className="flex-1 px-3 py-2.5 bg-[#1a1625] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-rose-600"
                    />
                  </div>
                  {src && !thumb && !generatingThumb && (
                    <button
                      type="button"
                      onClick={async () => { setGeneratingThumb(true); const d = await captureThumbnail(src); if (d) setThumb(d); setGeneratingThumb(false); }}
                      className="mt-1.5 text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      ↺ Re-generate thumbnail
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1">Used count</label>
                    <input value={used} onChange={(e) => setUsed(e.target.value)} placeholder="e.g. 5.8K" className="w-full px-3 py-2.5 bg-[#1a1625] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-rose-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1">Label</label>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="HOT, NEW" className="w-full px-3 py-2.5 bg-[#1a1625] border border-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:border-rose-600" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-rose-600 w-4 h-4" />
                  Set as featured (hero card)
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-br from-rose-500 to-rose-700 text-white text-sm font-bold rounded-lg cursor-pointer hover:brightness-110 disabled:opacity-50">
                    {saving ? "Saving..." : "Save video"}
                  </button>
                  <button type="button" onClick={() => { resetForm(); setSection("videos"); }} className="px-6 py-2.5 bg-[#1a1625] border border-white/[0.06] text-white text-sm rounded-lg cursor-pointer hover:border-white/15 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {section === "settings" && (
            <div>
              <h2 className="text-lg font-bold mb-4 pb-3 border-b border-white/[0.06]">Settings</h2>
              <div className="p-4 bg-rose-600/[0.08] border border-rose-600/25 rounded-lg text-sm text-white/60 leading-relaxed max-w-[600px]">
                <strong className="text-white">Supabase integration is active.</strong>
                <br /><br />
                All videos are stored in your Supabase PostgreSQL database (<code>videos</code> table).
                <br /><br />
                <strong className="text-white">Cloudflare R2:</strong>
                <br />1. Upload videos to your R2 bucket
                <br />2. Use the public URL as the <code>src</code> field
                <br /><br />
                <strong className="text-white">To change admin email:</strong>
                <br />Edit <code>NEXT_PUBLIC_ADMIN_EMAIL</code> in your <code>.env.local</code> file.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 bg-[#1a1625] border border-white/[0.06] text-white text-sm font-semibold rounded-lg shadow-xl z-50 transition-opacity">
          {toast}
        </div>
      )}
    </div>
  );
}
