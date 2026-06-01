import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

export async function issueVerificationToken(identifier: string): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomUUID();
  const expires = new Date(Date.now() + VERIFICATION_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

export async function issuePasswordResetToken(email: string): Promise<string> {
  const identifier = `password-reset:${email}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomUUID();
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}
