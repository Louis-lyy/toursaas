import AdminLayout from "@/components/AdminLayout";

// Vercel 构建环境没有可用的 SQLite 表，避免构建期预渲染查库失败
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
