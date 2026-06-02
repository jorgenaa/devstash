import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { getClientIp, rateLimit, tooManyRequestsResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    const ip = getClientIp(request);
    const rlKey = email ? `resend-verification:${ip}:${email}` : `resend-verification:${ip}`;
    const rl = await rateLimit(rlKey, 3, "15 m");
    if (!rl.success) return tooManyRequestsResponse(rl.reset);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    const token = await issueVerificationToken(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
