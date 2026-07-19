import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = checkAuth();
  if (authError) return authError;

  const routes = await prisma.tourRoute.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(routes);
}

export async function POST(request: Request) {
  const authError = checkAuth();
  if (authError) return authError;

  const body = await request.json();
  const { title, description, price, image, days, highlights } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  const route = await prisma.tourRoute.create({
    data: {
      title: title.trim(),
      description: description || "",
      price: Number(price) || 0,
      image: image || null,
      days: Number(days) || 1,
      highlights: highlights || "",
    },
  });

  return NextResponse.json(route, { status: 201 });
}
