import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAuthenticated, SESSION_COOKIE } from "@/lib/auth";

export function checkAuth() {
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (!isAuthenticated(session)) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  return null;
}
