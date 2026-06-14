import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const SENIOR_PATHS = ["/admin"];

const ADMIN_RESTRICTED_PATHS = [
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
  "/billing",
];

const ADMIN_ALLOWED_PATHS = ["/settings", "/admin/payments", "/api"];

// paths that require an active subscription (excluding /billing)
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
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Redirect authenticated users away from auth pages
  if (isPublic) {
    if (token && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (payload.role === "admin") {
    const isRestrictedPath = ADMIN_RESTRICTED_PATHS.some((p) =>
      pathname.startsWith(p)
    );
    const isAllowedPath = ADMIN_ALLOWED_PATHS.some((p) =>
      pathname.startsWith(p)
    );

    if (isRestrictedPath && !isAllowedPath) {
      return NextResponse.redirect(new URL("/settings", request.url));
    }
  }

  // Senior-only admin pages
  const isSeniorRoute = SENIOR_PATHS.some((p) => pathname.startsWith(p));
  if (isSeniorRoute) {
    if (payload.seniority !== "senior") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const isGuarded = SUBSCRIPTION_GUARDED_PATHS.some((p) =>
    pathname.startsWith(p)
  );
  if (isGuarded && payload.role !== "admin") {
    const expiredFlag = request.cookies.get("sub_status")?.value;
    if (expiredFlag && expiredFlag !== "ok") {
      return NextResponse.redirect(new URL("/billing", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};