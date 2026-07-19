import { getPlatformStore, getStoreMode } from "@/lib/platform";
import {
  jsonResponse,
  optionsResponse,
  SUPER_ADMIN_PASS,
  SUPER_ADMIN_USER,
} from "@/lib/platform/api-helpers";

export async function OPTIONS(req: Request) {
  return optionsResponse(req.headers.get("origin"));
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  try {
    const body = await req.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (username === SUPER_ADMIN_USER && password === SUPER_ADMIN_PASS) {
      return jsonResponse(
        {
          ok: true,
          role: "superadmin",
          superToken: SUPER_ADMIN_PASS,
          storeMode: getStoreMode(),
        },
        {},
        origin
      );
    }

    const store = getPlatformStore();
    const tenant = await store.getTenantByUsername(username);
    if (!tenant || tenant.password !== password || tenant.status === "disabled") {
      return jsonResponse({ error: "账号或密码错误，或账号已被禁用" }, { status: 401 }, origin);
    }

    // 飞书应用若只有可读权限，写最近登录/同步元数据会 Forbidden；不应阻断登录
    let synced = tenant;
    try {
      await store.recordLogin(tenant.id);
    } catch (err) {
      console.warn("[platform/login] recordLogin skipped:", err);
    }
    try {
      synced = (await store.syncTenantMeta(tenant.id)) || tenant;
    } catch (err) {
      console.warn("[platform/login] syncTenantMeta skipped:", err);
    }

    return jsonResponse(
      {
        ok: true,
        role: "tenant",
        tenant: {
          id: synced.id,
          username: synced.username,
          displayName: synced.displayName,
          email: synced.email,
          phone: synced.phone,
          plan: synced.plan,
          status: synced.status,
        },
        storeMode: getStoreMode(),
      },
      {},
      origin
    );
  } catch (e) {
    return jsonResponse(
      { error: e instanceof Error ? e.message : "登录失败" },
      { status: 500 },
      origin
    );
  }
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");
  return jsonResponse({ storeMode: getStoreMode(), ok: true }, {}, origin);
}
