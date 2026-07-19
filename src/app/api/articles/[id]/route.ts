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

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(request: Request, { params }: Params) {
  const authError = checkAuth();
  if (authError) return authError;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const body = await request.json();
  const { title, content, coverImage, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: title.trim(),
      content: content || "",
      coverImage: coverImage || null,
      status: status === "published" ? "published" : "draft",
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(_request: Request, { params }: Params) {
  const authError = checkAuth();
  if (authError) return authError;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
