import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/api-auth";
import { saveUpload } from "@/lib/upload";

export async function POST(request: Request) {
  const authError = checkAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "请选择图片文件" }, { status: 400 });
    }

    const url = await saveUpload(file);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
