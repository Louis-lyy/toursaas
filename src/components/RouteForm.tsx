"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ImageUpload from "@/components/ImageUpload";

type RouteData = {
  id?: number;
  title: string;
  description?: string | null;
  price: number;
  image?: string | null;
  days: number;
  highlights?: string | null;
};

type Props = {
  initial?: RouteData;
};

export default function RouteForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [image, setImage] = useState(initial?.image || "");
  const [days, setDays] = useState(String(initial?.days ?? "1"));
  const [highlights, setHighlights] = useState(initial?.highlights || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit ? `/api/routes/${initial!.id}` : "/api/routes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price) || 0,
          image: image || null,
          days: Number(days) || 1,
          highlights,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }

      router.push("/routes");
      router.refresh();
    } catch {
      setError("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入路线标题"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">简介</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="简要介绍这条路线"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">价格（元）</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">行程天数</label>
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <ImageUpload value={image} onChange={setImage} label="路线图片" />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">亮点</label>
        <textarea
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="每行一个亮点，例如：&#10;兵马俑深度讲解&#10;华清池温泉体验&#10;回民街美食之旅"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 flex-wrap items-center">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "保存中..." : "保存"}
        </button>
        {isEdit && (
          <a
            href={`/preview/routes/${initial!.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
          >
            预览 ↗
          </a>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
