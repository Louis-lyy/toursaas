import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/user";

export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80";

export const DEFAULT_CARD_IMAGE =
  "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=600&q=80";

export async function getSiteProfile() {
  return ensureUser();
}

export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllRoutes() {
  return prisma.tourRoute.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getArticleById(id: number) {
  return prisma.article.findUnique({ where: { id } });
}

export async function getRouteById(id: number) {
  return prisma.tourRoute.findUnique({ where: { id } });
}

export function getSiteName(nickname?: string | null) {
  const name = nickname?.trim();
  if (!name) return "Tour Guide";
  return name;
}

export function splitHighlights(text?: string | null) {
  if (!text?.trim()) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
