import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function issueVerificationToken(identifier: string): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = randomUUID();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}
