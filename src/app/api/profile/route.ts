import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/user";

export async function GET() {
  const authError = checkAuth();
  if (authError) return authError;

  const user = await ensureUser();
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const authError = checkAuth();
  if (authError) return authError;

  const user = await ensureUser();
  const body = await request.json();
  const { avatar, nickname, bio, wechat, email, phone } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      avatar: avatar || null,
      nickname: nickname?.trim() || "导游",
      bio: bio || "",
      wechat: wechat || "",
      email: email || "",
      phone: phone || "",
    },
  });

  return NextResponse.json(updated);
}
