"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";

type Profile = {
  avatar?: string | null;
  nickname: string;
  bio?: string | null;
  wechat?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile>({
    nickname: "",
    bio: "",
    wechat: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }

      setProfile(data);
      setMessage("保存成功");
    } catch {
      setError("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">加载中...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        {profile.avatar && (
          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 shrink-0">
            <Image src={profile.avatar} alt="头像" fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="flex-1">
          <ImageUpload
            value={profile.avatar || ""}
            onChange={(url) => setProfile({ ...profile, avatar: url })}
            label="头像"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
        <input
          type="text"
          value={profile.nickname}
          onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">简介</label>
        <textarea
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="介绍一下您自己"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">微信号</label>
          <input
            type="text"
            value={profile.wechat || ""}
            onChange={(e) => setProfile({ ...profile, wechat: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
          <input
            type="email"
            value={profile.email || ""}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">手机号</label>
          <input
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
