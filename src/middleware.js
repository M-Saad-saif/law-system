import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const SENIOR_PATHS = ["/admin"];

// Protected dashboard routes that require an active subscription.
// /billing is intentionally excluded so expired users can still pay.
const SUBSCRIPTION_GUARDED_PATHS = [
  "/dashboard",
  "/cases",
  "/calendar",
  "/cross-exams",
  "/applications",
  "/judgements",
  "/judgement-search",
  "/judgement-extractor",
  "/judgement-image-generator",
  "/intelligencefeed",
  "/library",
  "/reminders",
  "/books",
  "/settings",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isApi = pathname.startsWith("/api");

  if (isApi) return NextResponse.next();

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

  // Verify token
  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Senior-only admin pages
  const isSeniorRoute = SENIOR_PATHS.some((p) => pathname.startsWith(p));
  if (isSeniorRoute) {
    if (payload.seniority !== "senior" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const isGuarded = SUBSCRIPTION_GUARDED_PATHS.some((p) =>
    pathname.startsWith(p),
  );
  if (isGuarded) {
    const expiredFlag = request.cookies.get("sub_status")?.value;
    if (expiredFlag && expiredFlag !== "ok") {
      // Only redirect non-admin users
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/billing", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
