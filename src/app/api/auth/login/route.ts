import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_VALUE,
  validateCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "请输入账号和密码" }, { status: 400 });
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
