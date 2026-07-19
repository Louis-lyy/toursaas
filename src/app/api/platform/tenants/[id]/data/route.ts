import { getPlatformStore } from "@/lib/platform";
import {
  jsonResponse,
  optionsResponse,
} from "@/lib/platform/api-helpers";

export async function OPTIONS(req: Request) {
  return optionsResponse(req.headers.get("origin"));
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const origin = req.headers.get("origin");
  try {
    const store = getPlatformStore();
    const tenant = await store.getTenant(params.id);
    if (!tenant) return jsonResponse({ error: "租户不存在" }, { status: 404 }, origin);
    const data = await store.getSiteData(params.id);
    return jsonResponse({ data }, {}, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "读取失败" },
      { status: 500 },
      origin
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const origin = req.headers.get("origin");
  try {
    const store = getPlatformStore();
    const tenant = await store.getTenant(params.id);
    if (!tenant) return jsonResponse({ error: "租户不存在" }, { status: 404 }, origin);

    const body = await req.json();
    await store.saveSiteData(params.id, body);
    // 不再二次全量读取（耗时长且易与并发保存打架），直接回传客户端提交的数据
    return jsonResponse({ ok: true, data: body }, {}, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "保存失败" },
      { status: 500 },
      origin
    );
  }
}
