import { getPlatformStore, getStoreMode } from "@/lib/platform";
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

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  if (!isSuperAdmin(req)) return unauthorized(origin);
  try {
    const store = getPlatformStore();
    const tenants = await store.listTenants();
    return jsonResponse({ tenants, storeMode: getStoreMode() }, {}, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "读取失败" },
      { status: 500 },
      origin
    );
  }
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!isSuperAdmin(req)) return unauthorized(origin);
  try {
    const body = await req.json();
    const displayName = String(body.displayName || "").trim();
    const email = String(body.email || "").trim();
    if (!displayName) return jsonResponse({ error: "请填写显示名称" }, { status: 400 }, origin);
    if (!email) return jsonResponse({ error: "请填写邮箱" }, { status: 400 }, origin);

    let username = String(body.username || "").trim();
    let password = String(body.password || "").trim();
    if (!username) username = `user${Math.floor(1000 + Math.random() * 9000)}`;
    if (!password) password = genPassword();

    const store = getPlatformStore();
    const tenant = await store.createTenant({
      id: body.id,
      username,
      password,
      displayName,
      email,
      phone: String(body.phone || "").trim(),
      plan: body.plan || "platinum",
      status: "active",
      notes: "",
      createdAt: new Date().toISOString(),
    });

    return jsonResponse({ tenant, storeMode: getStoreMode() }, { status: 201 }, origin);
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "创建失败" },
      { status: 500 },
      origin
    );
  }
}
