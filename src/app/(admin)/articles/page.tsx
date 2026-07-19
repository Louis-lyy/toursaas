import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import PreviewLink from "@/components/PreviewLink";

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">文章管理</h2>
        <Link
          href="/articles/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          新建文章
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">标题</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">状态</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">创建时间</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  暂无文章，点击「新建文章」开始创作
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-900">{article.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {article.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <PreviewLink href={`/preview/articles/${article.id}`} />
                    <Link
                      href={`/articles/${article.id}/edit`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      编辑
                    </Link>
                    <DeleteButton
                      id={article.id}
                      type="articles"
                      title={article.title}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
