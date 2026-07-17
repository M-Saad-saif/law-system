import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_COOKIE_NAME = "client_token";
const CLIENT_TOKEN_EXPIRES_IN = "5d";

export function signClientToken(payload) {
  return jwt.sign({ ...payload, type: "client" }, JWT_SECRET, {
    expiresIn: CLIENT_TOKEN_EXPIRES_IN,
  });
}

export function verifyClientToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.type !== "client") {
    throw new Error("Not a client token.");
  }
  return decoded;
}

export function getClientTokenFromCookies() {
  const cookieStore = cookies();
  return cookieStore.get(CLIENT_COOKIE_NAME)?.value;
}

export async function getCurrentClient() {
  const token = getClientTokenFromCookies();
  if (!token) return null;
  try {
    return verifyClientToken(token);
  } catch {
    return null;
  }
}

export function setClientAuthCookie(token, response) {
  response.cookies.set(CLIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 14 * 24 * 60 * 60,
    path: "/",
  });
}

export function clearClientAuthCookie(response) {
  response.cookies.set(CLIENT_COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}


export function withClientAuth(handler) {
  return async (request, context) => {
    const { NextResponse } = await import("next/server");
    const cookieStore = cookies();
    const token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to the client portal." },
        { status: 401 },
      );
    }

    try {
      const client = verifyClientToken(token);
      return handler(request, context, { ...client, __isClient: true });
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session." },
        { status: 401 },
      );
    }
  };
}
