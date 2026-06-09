import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const SENIOR_ONLY_PATHS = ["/admin"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isApi = pathname.startsWith("/api");

  // let api routes through - they do their own auth checks
  if (isApi) return NextResponse.next();

  // Public pages: if already logged in, bounce away from login/register
  if (isPublic) {
    if (
      token &&
      (pathname.startsWith("/login") || pathname.startsWith("/register"))
    ) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {}
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isSeniorRoute = SENIOR_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isSeniorRoute) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (payload.seniority !== "senior" && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
