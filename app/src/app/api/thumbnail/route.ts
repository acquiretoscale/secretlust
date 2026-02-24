import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";
import { unlink, readFile } from "fs/promises";
import { existsSync } from "fs";

const exec = promisify(execFile);

function ffmpegBin(): string | null {
  for (const p of ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"]) {
    if (existsSync(p)) return p;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const ffmpeg = ffmpegBin();

  if (ffmpeg) {
    // ffmpeg available — extract frame server-side, return actual JPEG
    const tmpOut = join(tmpdir(), `sl_thumb_${Date.now()}.jpg`);
    try {
      await exec(ffmpeg, [
        "-ss", "00:00:02",
        "-i", url,
        "-frames:v", "1",
        "-vf", "scale=320:-1",
        "-q:v", "4",
        "-y",
        tmpOut,
      ]);
      const buf = await readFile(tmpOut);
      await unlink(tmpOut).catch(() => {});
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      await unlink(tmpOut).catch(() => {});
      return NextResponse.json({ error: "ffmpeg extraction failed" }, { status: 500 });
    }
  }

  // ffmpeg not installed yet — tell client to use canvas fallback
  return NextResponse.json({ fallback: true }, { status: 202 });
}
