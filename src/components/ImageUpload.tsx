"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
};

export default function ImageUpload({ value, onChange, label = "上传图片" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "上传失败");
        return;
      }

      onChange(data.url);
    } catch {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      )}

      <div className="flex items-start gap-4">
        {value && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            <Image src={value} alt="预览" fill className="object-cover" unoptimized />
          </div>
        )}

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {uploading ? "上传中..." : value ? "更换图片" : label}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              移除
            </button>
          )}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
