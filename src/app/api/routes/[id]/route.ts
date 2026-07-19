import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const authError = checkAuth();
  if (authError) return authError;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const route = await prisma.tourRoute.findUnique({ where: { id } });
  if (!route) {
    return NextResponse.json({ error: "路线不存在" }, { status: 404 });
  }

  return NextResponse.json(route);
}

export async function PUT(request: Request, { params }: Params) {
  const authError = checkAuth();
  if (authError) return authError;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const body = await request.json();
  const { title, description, price, image, days, highlights } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const route = await prisma.tourRoute.update({
    where: { id },
    data: {
      title: title.trim(),
      description: description || "",
      price: Number(price) || 0,
      image: image || null,
      days: Number(days) || 1,
      highlights: highlights || "",
    },
  });

  return NextResponse.json(route);
}

export async function DELETE(_request: Request, { params }: Params) {
  const authError = checkAuth();
  if (authError) return authError;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  await prisma.tourRoute.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
