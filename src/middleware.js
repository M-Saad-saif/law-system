import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/",
  "/faqs",
  "/features",
  "/pricing",
  "/privacy",
  "/terms",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/internal/subscription-status",
  "/google22df216bb21f61fa.html",
];

const CLIENT_PORTAL_PREFIXES = ["/portal", "/api/client-portal"];

const ADMIN_ONLY_PATHS = ["/admin/payments", "/api/admin", "/admin/users"];

const NON_ADMIN_PATHS = [
  "/dashboard",
  "/cases",
  "/calendar",
  "/cross-exams",
  "/applications",
  // "/judgements",
  "/judgement-search",
  "/judgement-extractor",
  "/judgement-image-generator",
  "/intelligencefeed",
  "/library",
  "/books",
  "/billing",
  "/setting",
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

  if (pathname === "/portal/login" || pathname.startsWith("/portal/login/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

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

    if (!token && pathname.startsWith("/login")) {
      const clientToken = request.cookies.get("client_token")?.value;
      if (clientToken) {
        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET);
          const { payload } = await jwtVerify(clientToken, secret);
          if (payload.type === "client") {
            return NextResponse.redirect(
              new URL("/portal/dashboard", request.url),
            );
          }
        } catch {}
      }
    }

    return NextResponse.next();
  }

  // ---- Client portal branch: completely separate from staff auth below ----
  const isClientPortalPath = CLIENT_PORTAL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isClientPortalPath) {
    const clientToken = request.cookies.get("client_token")?.value;

    if (!clientToken) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized. Please login to the client portal.",
          },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(clientToken, secret);
      if (payload.type !== "client") throw new Error("wrong token type");
    } catch {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired session." },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Client sessions never touch subscription/admin/staff logic below.
    return NextResponse.next();
  }

  // ---- Token required (staff) ----
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|videos|images|.*\\.(?:mp4|webm|png|jpg|jpeg|svg|webp|ico|gif)$).*)",
  ],
};
