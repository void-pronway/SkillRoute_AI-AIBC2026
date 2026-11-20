import { NextRequest, NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await deleteSession();
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
