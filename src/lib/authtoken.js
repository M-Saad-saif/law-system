import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getTokenFromCookies() {
  const cookieStore = cookies();
  return cookieStore.get('token')?.value;
}

export async function getCurrentUser() {
  const token = getTokenFromCookies();
  if (!token) return null;

  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch {
    return null;
  }
}

export function setAuthCookie(token, response) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export function clearAuthCookie(response) {
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
}
