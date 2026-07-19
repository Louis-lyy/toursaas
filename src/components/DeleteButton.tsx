"use client";

import { useRouter } from "next/navigation";

type Props = {
  id: number;
  type: "articles" | "routes";
  title: string;
};

export default function DeleteButton({ id, type, title }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`确定要删除「${title}」吗？此操作不可恢复。`)) return;

    const res = await fetch(`/api/${type}/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("删除失败");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 hover:text-red-700 hover:underline"
    >
      删除
    </button>
  );
}
