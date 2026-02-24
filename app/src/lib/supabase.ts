export type Video = {
  id: string;
  title: string;
  src: string;
  thumb: string;
  used: string;
  featured: boolean;
  featured_label: string;
  created_at: string;
};

const DEMO_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@secretlust.com";
const DEMO_ADMIN_PASSWORD = "admin123";

const R2_BASE = "https://pub-343fc93e164c4b4faaa9a63542ac8d79.r2.dev";

function r2(n: number) {
  return `${R2_BASE}/vids/secretlustai${n}.mp4`;
}

function thumb(n: number) {
  return `/thumbs/thumb${n}.jpg`;
}

const LABELS = ["HOT", "NEW", "TRENDING", ""];
const TITLES = [
  "AI Fantasy Scene", "Passionate Encounter", "Intimate Moments", "Sensual Roleplay",
  "Close Up POV", "Late Night Session", "Deep Fantasy", "Wild Desire",
  "Bedroom Secrets", "Soft Touch", "Midnight Affair", "Secret Rendezvous",
  "Forbidden Pleasure", "Slow Burn", "Raw Attraction", "Lust & Passion",
  "Sensory Overload", "Dream Encounter", "Steamy Night", "Unfiltered Desire",
  "Primal Instinct", "After Dark", "Secret Fantasy", "Irresistible Pull",
  "Electric Touch", "Velvet Night", "Burning Temptation", "No Limits",
  "Private Show", "Edge of Control", "Hidden Fantasies", "Erotic Escape",
  "Pure Indulgence", "Quick Tease", "Hot Confession", "Midnight Heat",
  "Silk & Skin", "Body Language", "Tangled Sheets", "Forbidden Touch",
  "Neon Nights", "Whispered Desires", "Crimson Lips", "Primal Heat",
  "Gentle Storm", "Bare Attraction", "Under the Stars", "Sweet Surrender",
  "Dark Temptation", "Golden Hour", "Reckless Passion", "Shadow Play",
  "Lost Control", "First Glance", "Addictive", "Untamed", "Final Fantasy",
];

const VIDEO_NUMS = [
  35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66,
  67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81,
  4, 5, 6, 7, 8, 9, 31, 32, 33, 34,
];

const SEED_VIDEOS: Video[] = VIDEO_NUMS.map((n, i) => ({
  id: `v-${String(n).padStart(3, "0")}`,
  title: TITLES[i % TITLES.length],
  src: r2(n),
  thumb: thumb(n),
  used: `${Math.max(100, Math.round(7000 - i * 110))}`,
  featured: i === 0,
  featured_label: i === 0 ? "HOT" : LABELS[(i * 3) % LABELS.length],
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}));

// ── Local storage helpers ──

function isProbablyR2Configured() {
  return Boolean(process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL);
}

function getVideos(): Video[] {
  if (typeof window === "undefined") return [...SEED_VIDEOS];
  const raw = localStorage.getItem("sl_videos");
  if (!raw) return [...SEED_VIDEOS];
  return JSON.parse(raw);
}

function saveVideos(videos: Video[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("sl_videos", JSON.stringify(videos));
  }
}

export async function ensureVideosSeeded(): Promise<void> {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem("sl_videos");
  if (existing) {
    try {
      const parsed: Video[] = JSON.parse(existing);
      // Force-refresh if src is empty OR thumb is missing (stale seed without thumbnails)
      const stale =
        parsed.length === 0 ||
        !parsed[0].src ||
        parsed.length !== SEED_VIDEOS.length ||
        parsed.every((v) => !v.thumb || v.thumb.startsWith("data:"));
      if (stale) {
        localStorage.removeItem("sl_videos");
      } else {
        return;
      }
    } catch {
      localStorage.removeItem("sl_videos");
    }
  }

  if (!isProbablyR2Configured()) {
    localStorage.setItem("sl_videos", JSON.stringify(SEED_VIDEOS));
    return;
  }

  try {
    const res = await fetch("/api/r2/videos", { cache: "no-store" });
    if (!res.ok) throw new Error(`R2 import failed (${res.status})`);
    const json = (await res.json()) as { videos?: Video[] };
    const videos = (json.videos || []).filter((v) => Boolean(v.src));
    if (videos.length > 0) {
      localStorage.setItem("sl_videos", JSON.stringify(videos));
      return;
    }
  } catch {
    // fall back to local demo seed
  }

  localStorage.setItem("sl_videos", JSON.stringify(SEED_VIDEOS));
}

function getStoredUser(): { email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sl_user");
  return raw ? JSON.parse(raw) : null;
}

function setStoredUser(user: { email: string } | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem("sl_user", JSON.stringify(user));
  else localStorage.removeItem("sl_user");
}

// ── Mock query builder (mirrors Supabase chainable API) ──

class QueryBuilder {
  private op: "select" | "insert" | "update" | "delete" = "select";
  private filters: { col: string; val: unknown }[] = [];
  private _order: { col: string; asc: boolean } | null = null;
  private _range: { from: number; to: number } | null = null;
  private _limit: number | null = null;
  private _single = false;
  private payload: Record<string, unknown> | null = null;

  select(_cols?: string) {
    this.op = "select";
    return this;
  }

  eq(col: string, val: unknown) {
    this.filters.push({ col, val });
    return this;
  }

  order(col: string, opts: { ascending: boolean }) {
    this._order = { col, asc: opts.ascending };
    return this;
  }

  range(from: number, to: number) {
    this._range = { from, to };
    return this;
  }

  limit(n: number) {
    this._limit = n;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  insert(data: Record<string, unknown>) {
    this.op = "insert";
    this.payload = data;
    return this;
  }

  update(data: Record<string, unknown>) {
    this.op = "update";
    this.payload = data;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  then<T1 = { data: unknown; error: unknown }, T2 = never>(
    resolve?: ((v: { data: unknown; error: unknown }) => T1 | PromiseLike<T1>) | null,
    reject?: ((r: unknown) => T2 | PromiseLike<T2>) | null,
  ): Promise<T1 | T2> {
    const result = this.run();
    return Promise.resolve(result).then(resolve, reject);
  }

  private run(): { data: unknown; error: unknown } {
    const videos = getVideos();

    switch (this.op) {
      case "select": {
        let result = [...videos];
        for (const f of this.filters) {
          result = result.filter((v) => (v as Record<string, unknown>)[f.col] === f.val);
        }
        if (this._order) {
          const { col, asc } = this._order;
          result.sort((a, b) => {
            const av = (a as Record<string, unknown>)[col];
            const bv = (b as Record<string, unknown>)[col];
            if (av! < bv!) return asc ? -1 : 1;
            if (av! > bv!) return asc ? 1 : -1;
            return 0;
          });
        }
        if (this._range) {
          result = result.slice(this._range.from, this._range.to + 1);
        }
        if (this._limit) {
          result = result.slice(0, this._limit);
        }
        return { data: this._single ? result[0] ?? null : result, error: null };
      }

      case "insert": {
        const newVideo = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...this.payload,
        } as Video;
        videos.push(newVideo);
        saveVideos(videos);
        return { data: newVideo, error: null };
      }

      case "update": {
        for (let i = 0; i < videos.length; i++) {
          const match = this.filters.every(
            (f) => (videos[i] as Record<string, unknown>)[f.col] === f.val,
          );
          if (match) {
            videos[i] = { ...videos[i], ...this.payload } as Video;
          }
        }
        saveVideos(videos);
        return { data: null, error: null };
      }

      case "delete": {
        const kept = videos.filter(
          (v) => !this.filters.every((f) => (v as Record<string, unknown>)[f.col] === f.val),
        );
        saveVideos(kept);
        return { data: null, error: null };
      }
    }
  }
}

// ── Mock auth ──

const auth = {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      setStoredUser({ email });
      return { data: { user: { email } }, error: null };
    }
    return { data: null, error: { message: "Invalid email or password" } };
  },

  async signUp({ email, password }: { email: string; password: string }) {
    if (password.length < 6) {
      return { data: null, error: { message: "Password must be at least 6 characters" } };
    }
    setStoredUser({ email });
    return { data: { user: { email } }, error: null };
  },

  async getUser() {
    return { data: { user: getStoredUser() } };
  },

  async signOut() {
    setStoredUser(null);
    return { error: null };
  },
};

// ── Exported mock client ──

export const supabase = {
  auth,
  from(_table: string) {
    return new QueryBuilder();
  },
};
