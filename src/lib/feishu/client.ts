const FEISHU_HOST = "https://open.feishu.cn";

let cachedToken: { token: string; expireAt: number } | null = null;
let cachedTableIds: Record<string, string> | null = null;
let resolvingTableIds: Promise<Record<string, string>> | null = null;

/** 与飞书 Base 中现有表名对齐 */
export const TABLE_NAME_ALIASES = {
  tenants: ["平台租户表", "tenants", "租户", "租户表", "账号"],
  profiles: ["租户配置表", "profiles", "配置表"],
  articles: ["文章博客表", "articles", "文章", "文章表"],
  routes: ["旅游路线表", "routes", "路线", "线路", "路线表", "线路表"],
  publish: ["网站发布配置表", "publish", "发布配置"],
  notifications: ["系统通知表", "notifications", "通知表"],
} as const;

export type FeishuTableKey = keyof typeof TABLE_NAME_ALIASES;

/** 凭证齐全即启用飞书模式（表 ID 可自动发现） */
export function isFeishuConfigured() {
  return !!(
    process.env.FEISHU_APP_ID &&
    process.env.FEISHU_APP_SECRET &&
    process.env.FEISHU_BITABLE_APP_TOKEN
  );
}

export async function getTenantAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expireAt > now + 60_000) {
    return cachedToken.token;
  }

  const appId = process.env.FEISHU_APP_ID!;
  const appSecret = process.env.FEISHU_APP_SECRET!;

  const res = await fetch(
    `${FEISHU_HOST}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`飞书鉴权失败: ${json.msg || json.code}`);
  }
  cachedToken = {
    token: json.tenant_access_token,
    expireAt: now + (json.expire || 7200) * 1000,
  };
  return cachedToken.token;
}

export async function feishuRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getTenantAccessToken();
  const res = await fetch(`${FEISHU_HOST}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (json.code !== 0) {
    if (json.code === 91403) {
      throw new Error(
        "飞书无写权限(Forbidden)。请打开多维表格 → … → 更多 → 添加文档应用 → 选择本应用并勾选「可编辑」。若已切换到应用自建 Base，请重启 npm run dev。"
      );
    }
    throw new Error(`飞书 API 错误: ${json.msg || json.code}`);
  }
  return json.data as T;
}

export function bitableAppToken() {
  return process.env.FEISHU_BITABLE_APP_TOKEN!;
}

const ENV_TABLE_KEYS: Record<FeishuTableKey, string> = {
  tenants: "FEISHU_TABLE_TENANTS",
  profiles: "FEISHU_TABLE_PROFILES",
  articles: "FEISHU_TABLE_ARTICLES",
  routes: "FEISHU_TABLE_ROUTES",
  publish: "FEISHU_TABLE_PUBLISH",
  notifications: "FEISHU_TABLE_NOTIFICATIONS",
};

export function tableIds(): Record<FeishuTableKey, string> {
  if (cachedTableIds) {
    return cachedTableIds as Record<FeishuTableKey, string>;
  }
  const fromEnv: Partial<Record<FeishuTableKey, string>> = {};
  let allPresent = true;
  for (const key of Object.keys(ENV_TABLE_KEYS) as FeishuTableKey[]) {
    const val = process.env[ENV_TABLE_KEYS[key]];
    if (!val) allPresent = false;
    else fromEnv[key] = val;
  }
  if (allPresent) {
    return fromEnv as Record<FeishuTableKey, string>;
  }
  throw new Error(
    "飞书表 ID 尚未解析，请先 await ensureTableIds()，或运行 npm run feishu:bootstrap"
  );
}

async function listTablesRaw(): Promise<Array<{ table_id: string; name: string }>> {
  const appToken = bitableAppToken();
  const items: Array<{ table_id: string; name: string }> = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (pageToken) params.set("page_token", pageToken);
    const data = await feishuRequest<{
      items?: Array<{ table_id: string; name: string }>;
      page_token?: string;
      has_more?: boolean;
    }>(`/open-apis/bitable/v1/apps/${appToken}/tables?${params}`);
    items.push(...(data.items || []));
    pageToken = data.has_more ? data.page_token : undefined;
  } while (pageToken);
  return items;
}

function matchTableId(
  tables: Array<{ table_id: string; name: string }>,
  aliases: readonly string[]
) {
  const lower = aliases.map((a) => a.toLowerCase());
  const hit = tables.find((t) =>
    lower.includes(String(t.name || "").toLowerCase())
  );
  return hit?.table_id;
}

/** 优先读环境变量；缺失时按中文表名自动发现并缓存 */
export async function ensureTableIds() {
  if (cachedTableIds) return cachedTableIds as Record<FeishuTableKey, string>;

  const fromEnv: Partial<Record<FeishuTableKey, string>> = {};
  let allPresent = true;
  for (const key of Object.keys(ENV_TABLE_KEYS) as FeishuTableKey[]) {
    const val = process.env[ENV_TABLE_KEYS[key]];
    if (!val) allPresent = false;
    else fromEnv[key] = val;
  }
  if (allPresent) {
    cachedTableIds = fromEnv as Record<FeishuTableKey, string>;
    return cachedTableIds as Record<FeishuTableKey, string>;
  }

  if (!resolvingTableIds) {
    resolvingTableIds = (async () => {
      const tables = await listTablesRaw();
      const resolved: Partial<Record<FeishuTableKey, string>> = { ...fromEnv };
      for (const key of Object.keys(TABLE_NAME_ALIASES) as FeishuTableKey[]) {
        if (!resolved[key]) {
          resolved[key] = matchTableId(tables, TABLE_NAME_ALIASES[key]);
        }
      }
      const missing = (Object.keys(TABLE_NAME_ALIASES) as FeishuTableKey[]).filter(
        (k) => !resolved[k]
      );
      if (missing.length) {
        throw new Error(
          `飞书 Base 中缺少数据表: ${missing.join(", ")}。当前表：${
            tables.map((t) => t.name).join(", ") || "(空)"
          }`
        );
      }
      cachedTableIds = resolved as Record<FeishuTableKey, string>;
      return cachedTableIds;
    })().finally(() => {
      resolvingTableIds = null;
    });
  }
  return resolvingTableIds as Promise<Record<FeishuTableKey, string>>;
}

export interface BitableRecord {
  record_id: string;
  fields: Record<string, unknown>;
}

export async function listAllRecords(
  tableId: string,
  filter?: string
): Promise<BitableRecord[]> {
  const appToken = bitableAppToken();
  const items: BitableRecord[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ page_size: "500" });
    if (pageToken) params.set("page_token", pageToken);
    if (filter) params.set("filter", filter);

    const data = await feishuRequest<{
      items?: BitableRecord[];
      page_token?: string;
      has_more?: boolean;
    }>(
      `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params}`
    );
    items.push(...(data.items || []));
    pageToken = data.has_more ? data.page_token : undefined;
  } while (pageToken);

  return items;
}

export async function createRecord(
  tableId: string,
  fields: Record<string, unknown>
) {
  const appToken = bitableAppToken();
  const data = await feishuRequest<{ record: BitableRecord }>(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    { method: "POST", body: JSON.stringify({ fields }) }
  );
  return data.record;
}

export async function updateRecord(
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
) {
  const appToken = bitableAppToken();
  await feishuRequest(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    { method: "PUT", body: JSON.stringify({ fields }) }
  );
}

export async function deleteRecords(tableId: string, recordIds: string[]) {
  if (!recordIds.length) return;
  const appToken = bitableAppToken();
  await feishuRequest(
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_delete`,
    { method: "POST", body: JSON.stringify({ records: recordIds }) }
  );
}

export function fieldText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        typeof v === "object" && v && "text" in v
          ? String((v as { text: string }).text)
          : String(v)
      )
      .join("");
  }
  if (typeof value === "object" && value !== null && "text" in value) {
    return String((value as { text: string }).text || "");
  }
  return String(value);
}

export function fieldNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const raw = fieldText(value);
  const n = Number(raw);
  if (Number.isFinite(n)) return n;
  const digits = raw.match(/[\d.]+/);
  return digits ? Number(digits[0]) || 0 : 0;
}
