import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/internal/subscription-status",
];

const ADMIN_ONLY_PATHS = ["/admin/payments", "/api/admin", "/admin/users"];

const NON_ADMIN_PATHS = [
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
  "/books",
  "/billing",
];

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
  "/api/cases",
  "/api/cross-exams",
  "/api/applications",
  "/api/hearings",
  "/api/library",
  "/api/reminders",
  "/api/books",
  "/api/stats",
];

async function getSubscriptionStatus(userId, request) {
  try {
    const url = new URL("/api/internal/subscription-status", request.url);
    const res = await fetch(url.toString(), {
      headers: {
        "x-user-id": userId,
        "x-internal-secret": process.env.INTERNAL_SECRET,
      },
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { allowed: false, status: null };
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // ---- Public paths ----
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

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

  // ---- Token required ----
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login." },
        { status: 401 },
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ----Verify token ----
  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session." },
        { status: 401 },
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAdmin = payload.role === "admin";

  // ---- Admin-only paths ----
  const isAdminOnlyPath = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminOnlyPath && !isAdmin) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Forbidden. Admin access required." },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ----  Block admins from non-admin pages ----
  const isNonAdminPath = NON_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isNonAdminPath && isAdmin) {
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/admin/payments", request.url));
    }
  }

  // ---- Subscription guard ----
  const isGuarded = SUBSCRIPTION_GUARDED_PATHS.some((p) =>
    pathname.startsWith(p),
  );
  if (isGuarded && !isAdmin) {
    const { allowed, status } = await getSubscriptionStatus(
      payload.id,
      request,
    );

    if (!allowed) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            success: false,
            message: "Subscription required.",
            subscriptionStatus: status,
          },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/billing", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
