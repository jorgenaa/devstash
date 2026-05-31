import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    redirect("/sign-in?error=InvalidToken");
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    if (verificationToken) {
      await prisma.verificationToken.delete({ where: { token } });
    }
    redirect("/sign-in?error=InvalidToken");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  redirect("/sign-in?verified=1");
}
