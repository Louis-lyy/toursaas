import { getPlatformStore } from "@/lib/platform";
import {
  isSuperAdmin,
  jsonResponse,
  optionsResponse,
  unauthorized,
} from "@/lib/platform/api-helpers";
import { genPassword } from "@/lib/platform/utils";

export async function OPTIONS(req: Request) {
  return optionsResponse(req.headers.get("origin"));
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const origin = req.headers.get("origin");
  if (!isSuperAdmin(req)) return unauthorized(origin);
  try {
    const store = getPlatformStore();
    const tenant = await store.getTenant(params.id);
    if (!tenant) return jsonResponse({ error: "租户不存在" }, { status: 404 }, origin);
    const synced = (await store.syncTenantMeta(params.id)) || tenant;
    return jsonResponse({ tenant: synced }, {}, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "读取失败" },
      { status: 500 },
      origin
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const origin = req.headers.get("origin");
  if (!isSuperAdmin(req)) return unauthorized(origin);
  try {
    const body = await req.json();
    const store = getPlatformStore();
    const tenant = await store.getTenant(params.id);
    if (!tenant) return jsonResponse({ error: "租户不存在" }, { status: 404 }, origin);

    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) patch.status = body.status;
    if (body.password !== undefined) patch.password = body.password;
    if (body.credentialsSentAt !== undefined) patch.credentialsSentAt = body.credentialsSentAt;
    if (body.resetPassword) patch.password = genPassword();

    const updated = await store.updateTenant(params.id, patch);
    return jsonResponse({ tenant: updated }, {}, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "更新失败" },
      { status: 500 },
      origin
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const origin = req.headers.get("origin");
  if (!isSuperAdmin(req)) return unauthorized(origin);
  try {
    const body = await req.json();
    if (body.action === "refresh") {
      const store = getPlatformStore();
      const tenant = await store.syncTenantMeta(params.id);
      if (!tenant) return jsonResponse({ error: "租户不存在" }, { status: 404 }, origin);
      return jsonResponse({ tenant }, {}, origin);
    }
    return jsonResponse({ error: "未知操作" }, { status: 400 }, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "操作失败" },
      { status: 500 },
      origin
    );
  }
}
