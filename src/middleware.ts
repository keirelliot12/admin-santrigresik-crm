import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth") || req.nextUrl.pathname === "/login";

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return null;
  }

  if (!isAuth && req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return null;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/calendar/:path*",
    "/email/:path*",
    "/kanban/:path*",
    "/contact/:path*",
    "/file-manager/:path*",
  ],
};