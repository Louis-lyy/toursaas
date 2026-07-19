"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";

type ArticleData = {
  id?: number;
  title: string;
  content: string;
  coverImage?: string | null;
  status: string;
};

type Props = {
  initial?: ArticleData;
};

export default function ArticleForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit ? `/api/articles/${initial!.id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, coverImage: coverImage || null, status }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }

      router.push("/articles");
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
          placeholder="请输入文章标题"
        />
      </div>

      <ImageUpload value={coverImage} onChange={setCoverImage} label="封面图" />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">正文</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
        </select>
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
            href={`/preview/articles/${initial!.id}`}
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
