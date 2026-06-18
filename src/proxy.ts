import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const protectedPaths = ["/dashboard", "/profile", "/settings", "/items", "/collections", "/favorites", "/upgrade"];
  const isProtected = protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!req.auth && isProtected) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/profile", "/settings", "/items/:path*", "/collections", "/collections/:path*", "/favorites", "/upgrade"],
};
