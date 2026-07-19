import { notFound } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function EditArticlePage({ params }: Props) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">编辑文章</h2>
      <ArticleForm initial={article} />
    </div>
  );
}
