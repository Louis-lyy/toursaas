import { prisma } from "@/lib/prisma";

export async function ensureUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({ data: { nickname: "导游" } });
  }
  return user;
}
