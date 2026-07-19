import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/format";
import DeleteButton from "@/components/DeleteButton";
import PreviewLink from "@/components/PreviewLink";

export default async function RoutesPage() {
  const routes = await prisma.tourRoute.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">路线管理</h2>
        <Link
          href="/routes/new"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          新建路线
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">标题</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">价格</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">天数</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">创建时间</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {routes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  暂无路线，点击「新建路线」开始添加
                </td>
              </tr>
            ) : (
              routes.map((route) => (
                <tr key={route.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-900">{route.title}</td>
                  <td className="px-4 py-3 text-slate-700">{formatPrice(route.price)}</td>
                  <td className="px-4 py-3 text-slate-500">{route.days} 天</td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(route.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <PreviewLink href={`/preview/routes/${route.id}`} />
                    <Link
                      href={`/routes/${route.id}/edit`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      编辑
                    </Link>
                    <DeleteButton id={route.id} type="routes" title={route.title} />
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
