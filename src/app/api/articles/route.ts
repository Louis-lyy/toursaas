import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = checkAuth();
  if (authError) return authError;

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      coverImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const authError = checkAuth();
  if (authError) return authError;

  const body = await request.json();
  const { title, content, coverImage, status } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: {
      title: title.trim(),
      content: content || "",
      coverImage: coverImage || null,
      status: status === "published" ? "published" : "draft",
    },
  });

  return NextResponse.json(article, { status: 201 });
}
