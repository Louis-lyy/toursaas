import Link from "next/link";

export default function PreviewBanner() {
  return (
    <div className="preview-banner">
      当前为预览模式 · 访客看到的效果与此一致 ·{" "}
      <Link href="/dashboard">返回后台</Link>
    </div>
  );
}
