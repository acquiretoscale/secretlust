/**
 * Captures a JPEG thumbnail from a video URL.
 *
 * Strategy:
 *  1. Ask the server-side /api/thumbnail route (uses ffmpeg when installed).
 *  2. If ffmpeg isn't installed yet, fall back to client-side canvas capture.
 *
 * Returns a data URL string (always starts with "data:image/jpeg;base64,..."),
 * or null if capture failed.
 */
export async function captureThumbnail(
  videoUrl: string,
  seekTime = 2,
): Promise<string | null> {
  if (!videoUrl || typeof window === "undefined") return null;

  // Try server route first (works with or without CORS on the source)
  try {
    const res = await fetch(
      `/api/thumbnail?url=${encodeURIComponent(videoUrl)}`,
      { cache: "force-cache" },
    );

    if (res.ok) {
      // ffmpeg was available — got a real JPEG blob back
      const blob = await res.blob();
      return await blobToDataUrl(blob);
    }

    if (res.status !== 202) {
      // Hard error — skip canvas fallback too
      return null;
    }
    // 202 → ffmpeg not ready, continue to canvas fallback
  } catch {
    // network/server error — try canvas anyway
  }

  // Canvas fallback (requires the browser to support crossOrigin on the source,
  // or the source has permissive CORS headers)
  return captureViaCanvas(videoUrl, seekTime);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function captureViaCanvas(
  videoUrl: string,
  seekTime = 2,
  width = 320,
  quality = 0.65,
): Promise<string | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    let resolved = false;
    const done = (result: string | null) => {
      if (resolved) return;
      resolved = true;
      video.src = "";
      video.remove();
      resolve(result);
    };

    // Timeout safety net
    const timeout = setTimeout(() => done(null), 12_000);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekTime, video.duration > 0 ? video.duration * 0.1 : seekTime);
    };

    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        const aspect = video.videoHeight / (video.videoWidth || 1);
        canvas.width = width;
        canvas.height = Math.round(width * aspect) || Math.round(width * (16 / 9));
        const ctx = canvas.getContext("2d");
        if (!ctx) return done(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        done(canvas.toDataURL("image/jpeg", quality));
      } catch {
        // Likely CORS tainted canvas — return null silently
        done(null);
      }
    };

    video.onerror = () => { clearTimeout(timeout); done(null); };

    video.src = videoUrl;
  });
}

/**
 * Persist a generated thumbnail back into the localStorage video store.
 */
export function persistThumbnail(videoId: string, dataUrl: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("sl_videos");
    if (!raw) return;
    const videos = JSON.parse(raw);
    const idx = videos.findIndex((v: { id: string }) => v.id === videoId);
    if (idx === -1) return;
    if (videos[idx].thumb === dataUrl) return; // no-op
    videos[idx] = { ...videos[idx], thumb: dataUrl };
    localStorage.setItem("sl_videos", JSON.stringify(videos));
  } catch {
    // storage quota or parse error — ignore
  }
}
