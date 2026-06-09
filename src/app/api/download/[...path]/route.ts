import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { getFromR2 } from "@/lib/r2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const key = path.join("/");

  if (!key.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const file = await getFromR2(key);
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const rawName = key.split("/").pop() ?? "download";
  // Strip the timestamp prefix (e.g. "1234567890-filename.pdf" → "filename.pdf")
  const fileName = rawName.replace(/^\d+-/, "");
  const isInline = file.contentType.startsWith("image/");

  return new NextResponse(file.body, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename="${fileName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
