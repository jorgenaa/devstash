import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/flags";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

class LoginRateLimitError extends CredentialsSignin {
  code = "RateLimited";
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      if (EMAIL_VERIFICATION_ENABLED && account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (!dbUser?.emailVerified) {
          return "/sign-in?error=EmailNotVerified";
        }
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.name = token.name ?? null;
      session.user.email = token.email ?? "";
      session.user.image = (token.picture as string | null) ?? null;
      return session;
    },
  },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const ip = getClientIp(request);
        const rl = await rateLimit(`login:${ip}:${email}`, 5, "15 m");
        if (!rl.success) throw new LoginRateLimitError();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
});
