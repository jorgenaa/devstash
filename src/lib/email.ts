import { resend } from "@/lib/resend";

const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const BASE_URL = process.env.AUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your DevStash account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="margin-bottom:24px;text-align:center">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:#6366f1;border-radius:8px;font-weight:700;font-size:14px;color:#fff">DS</div>
        </div>
        <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Verify your email</h1>
        <p style="color:#6b7280;margin:0 0 24px">Click the button below to verify your DevStash account. This link expires in 24 hours.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Verify email</a>
        <p style="margin-top:24px;color:#9ca3af;font-size:12px">If you didn't create a DevStash account, you can safely ignore this email.</p>
      </div>
    `,
  });
}
