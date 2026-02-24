import { NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function toPublicUrl(base: string, key: string) {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanKey = key.replace(/^\/+/, "");
  return `${cleanBase}/${cleanKey}`;
}

function titleFromKey(key: string) {
  const filename = key.split("/").pop() || key;
  const base = filename.replace(/\.[^.]+$/, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

type Listed = { key: string; size: number; lastModified?: string };

export async function GET() {
  try {
    const accountId = requireEnv("R2_ACCOUNT_ID");
    const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
    const bucket = process.env.R2_BUCKET || "secretlust";
    const prefix = process.env.R2_PREFIX || "vids/";

    const publicBase =
      process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ||
      process.env.R2_PUBLIC_BASE_URL ||
      "";

    if (!publicBase) {
      throw new Error(
        "Missing public base URL. Set NEXT_PUBLIC_R2_PUBLIC_BASE_URL (recommended) or R2_PUBLIC_BASE_URL.",
      );
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    const objects: Listed[] = [];
    let continuationToken: string | undefined = undefined;

    do {
      const out = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );

      for (const item of out.Contents || []) {
        if (!item.Key) continue;
        objects.push({
          key: item.Key,
          size: item.Size ?? 0,
          lastModified: item.LastModified?.toISOString(),
        });
      }

      continuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
    } while (continuationToken);

    const isVideo = (k: string) => /\.(mp4|webm|mov|m4v)$/i.test(k);
    const isImage = (k: string) => /\.(jpg|jpeg|png|webp)$/i.test(k);

    const imagesByStem = new Map<string, string>();
    for (const o of objects) {
      if (!isImage(o.key)) continue;
      const stem = o.key.replace(/\.[^.]+$/, "");
      imagesByStem.set(stem, o.key);
    }

    const videos = objects
      .filter((o) => isVideo(o.key))
      .sort((a, b) => (b.lastModified || "").localeCompare(a.lastModified || ""))
      .map((o, i) => {
        const stem = o.key.replace(/\.[^.]+$/, "");
        const thumbKey = imagesByStem.get(stem) || imagesByStem.get(`${stem}.thumb`) || "";

        return {
          id: o.key,
          title: titleFromKey(o.key),
          src: toPublicUrl(publicBase, o.key),
          thumb: thumbKey ? toPublicUrl(publicBase, thumbKey) : "",
          used: "",
          featured: i === 0,
          featured_label: i === 0 ? "HOT" : "",
          created_at: o.lastModified || new Date().toISOString(),
        };
      });

    return NextResponse.json({
      bucket,
      prefix,
      count: videos.length,
      videos,
      objects,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      {
        error: message,
        hint:
          "Create an R2 API token (S3 credentials) with List + Read for the bucket. Then set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, NEXT_PUBLIC_R2_PUBLIC_BASE_URL in .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }
}

