import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated, SESSION_COOKIE } from "@/lib/auth";

const publicPaths = [
  "/login",
  "/editor.html",
  "/accounts.html",
  "/assets",
  "/api/auth/login",
  "/api/platform",
  "/preview",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = isAuthenticated(session);

  // 主后台入口：同源托管的 editor.html
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/editor.html", request.url));
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    if (authed && pathname === "/login") {
      return NextResponse.redirect(new URL("/editor.html", request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|editor\\.html|accounts\\.html|assets).*)",
  ],
};
