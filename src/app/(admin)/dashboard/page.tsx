import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function DashboardPage() {
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

  const stats = [
    { label: "文章总数", value: articleCount, color: "bg-blue-500" },
    { label: "路线总数", value: routeCount, color: "bg-emerald-500" },
    {
      label: "最近更新",
      value: formatDate(lastUpdated),
      color: "bg-violet-500",
      isText: true,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">仪表盘</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-10 rounded-full ${stat.color}`} />
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p
                  className={`font-semibold text-slate-900 ${
                    stat.isText ? "text-lg" : "text-3xl"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-medium text-slate-900 mb-2">快速开始</h3>
        <p className="text-sm text-slate-500 mb-4">
          欢迎使用 TourSaaS 导游内容管理后台。您可以从左侧菜单管理文章、路线和个人信息。
        </p>
        <div className="flex gap-3">
          <a
            href="/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
          >
            预览网站 ↗
          </a>
          <a
            href="/articles/new"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新建文章
          </a>
          <a
            href="/routes/new"
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            新建路线
          </a>
        </div>
      </div>
    </div>
  );
}
