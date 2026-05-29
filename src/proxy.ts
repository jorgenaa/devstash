import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (!req.auth && isOnDashboard) {
    const signInUrl = new URL("/api/auth/signin", req.nextUrl.origin);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
