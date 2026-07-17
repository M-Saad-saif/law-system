import { NextResponse } from "next/server";
import { clearClientAuthCookie } from "@/lib/clientAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearClientAuthCookie(response);
  return response;
}
