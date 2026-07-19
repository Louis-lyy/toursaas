import { getPlatformStore, getStoreMode } from "@/lib/platform";
import {
  isSuperAdmin,
  jsonResponse,
  optionsResponse,
  unauthorized,
} from "@/lib/platform/api-helpers";

export async function OPTIONS(req: Request) {
  return optionsResponse(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!isSuperAdmin(req)) return unauthorized(origin);
  try {
    const store = getPlatformStore();
    const tenants = await store.listTenants();
    return jsonResponse({ tenants, storeMode: getStoreMode() }, {}, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "刷新失败" },
      { status: 500 },
      origin
    );
  }
}
