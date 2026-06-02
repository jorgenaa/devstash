import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issuePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await rateLimit(`forgot-password:${ip}`, 3, "1 h");
    if (!rl.success) return tooManyRequestsResponse(rl.reset);

    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.password) {
      const token = await issuePasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
