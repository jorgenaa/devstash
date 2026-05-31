import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { issueVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/flags";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        emailVerified: EMAIL_VERIFICATION_ENABLED ? null : new Date(),
      },
    });

    if (EMAIL_VERIFICATION_ENABLED) {
      const token = await issueVerificationToken(email);
      await sendVerificationEmail(email, token);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
