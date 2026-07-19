import { notFound } from "next/navigation";
import RouteForm from "@/components/RouteForm";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function EditRoutePage({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const route = await prisma.tourRoute.findUnique({ where: { id } });
  if (!route) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">编辑路线</h2>
      <RouteForm initial={route} />
    </div>
  );
}
