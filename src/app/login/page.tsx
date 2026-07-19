"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败，请重试");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white text-xl font-bold mb-4">
            T
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TourSaaS Admin</h1>
          <p className="text-slate-500 mt-2">导游内容管理后台</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-4">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">主后台</h2>
          <p className="text-sm text-slate-500 mb-4">
            文章、路线、模版与发布请使用最新主后台（Platform API / 飞书）。
          </p>
          <a
            href="/editor.html"
            className="block w-full text-center rounded-lg bg-teal-600 text-white py-2.5 font-medium hover:bg-teal-700 transition-colors"
          >
            进入导游内容管理后台
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">遗留 Prisma 后台</h2>
          <p className="text-xs text-slate-400 mb-6">
            以下登录仅用于旧版 `/dashboard`，与主后台数据不互通。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                账号
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入账号"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入密码"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "登录中..." : "登录遗留后台"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-6 text-center">
            遗留演示账号：admin / 123456
          </p>
        </div>
      </div>
    </div>
  );
}
