import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { uploadToR2, R2_BUCKET } from "@/lib/r2";
import { rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit";

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const FILE_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
]);

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const FILE_MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.isPro) {
    return NextResponse.json(
      { error: "File and image uploads require a Pro subscription." },
      { status: 403 }
    );
  }

  const rl = await rateLimit(`upload:${session.user.id}`, 20, "1 h");
  if (!rl.success) return tooManyRequestsResponse(rl.reset);

  if (!R2_BUCKET) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const itemType = (formData.get("itemType") as string | null)?.toLowerCase();

  if (!file || !itemType) {
    return NextResponse.json({ error: "Missing file or itemType" }, { status: 400 });
  }

  if (itemType !== "file" && itemType !== "image") {
    return NextResponse.json({ error: "itemType must be 'file' or 'image'" }, { status: 400 });
  }

  const isImage = itemType === "image";
  const allowedMimes = isImage ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;
  const maxBytes = isImage ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;

  if (!allowedMimes.has(file.type)) {
    return NextResponse.json(
      { error: `File type "${file.type}" is not allowed` },
      { status: 400 }
    );
  }

  if (file.size > maxBytes) {
    const maxMb = maxBytes / 1024 / 1024;
    return NextResponse.json(
      { error: `File exceeds the ${maxMb} MB limit` },
      { status: 400 }
    );
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${session.user.id}/${Date.now()}-${sanitizedName}`;

  const buffer = new Uint8Array(await file.arrayBuffer());
  await uploadToR2(key, buffer, file.type);

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });
}
