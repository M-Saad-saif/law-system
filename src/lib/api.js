import { NextResponse } from 'next/server';
import { verifyToken } from './authtoken';
import { cookies } from 'next/headers';

export function apiSuccess(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function withAuth(handler) {
  return async (request, context) => {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return apiError('Unauthorized. Please login.', 401);
    }

    try {
      const user = verifyToken(token);
      return handler(request, context, user);
    } catch {
      return apiError('Invalid or expired session.', 401);
    }
  };
}
