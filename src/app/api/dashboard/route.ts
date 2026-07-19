import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = checkAuth();
  if (authError) return authError;

  const [articleCount, routeCount, lastArticle, lastRoute] = await Promise.all([
    prisma.article.count(),
    prisma.tourRoute.count(),
    prisma.article.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.tourRoute.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  const dates = [lastArticle?.updatedAt, lastRoute?.updatedAt].filter(Boolean) as Date[];
  const lastUpdated = dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : null;

  return NextResponse.json({ articleCount, routeCount, lastUpdated });
}
