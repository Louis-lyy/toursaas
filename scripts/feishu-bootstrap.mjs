/**
 * 飞书多维表格对接校验：
 * - 校验 App 凭证
 * - 按中文表名发现 / 确认 table_id
 * - 写入 .env
 *
 * 用法：npm run feishu:bootstrap
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const FEISHU_HOST = "https://open.feishu.cn";

const TABLE_SPECS = {
  tenants: {
    env: "FEISHU_TABLE_TENANTS",
    aliases: ["平台租户表", "tenants", "租户", "租户表", "账号"],
  },
  profiles: {
    env: "FEISHU_TABLE_PROFILES",
    aliases: ["租户配置表", "profiles", "配置表"],
  },
  articles: {
    env: "FEISHU_TABLE_ARTICLES",
    aliases: ["文章博客表", "articles", "文章", "文章表"],
  },
  routes: {
    env: "FEISHU_TABLE_ROUTES",
    aliases: ["旅游路线表", "routes", "路线", "线路", "路线表", "线路表"],
  },
  publish: {
    env: "FEISHU_TABLE_PUBLISH",
    aliases: ["网站发布配置表", "publish", "发布配置"],
  },
  notifications: {
    env: "FEISHU_TABLE_NOTIFICATIONS",
    aliases: ["系统通知表", "notifications", "通知表"],
  },
};

function loadEnvFile() {
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function upsertEnv(updates) {
  let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^#?\\s*${key}=.*$`, "m");
    if (re.test(text)) text = text.replace(re, line);
    else text = text.trimEnd() + `\n${line}\n`;
  }
  fs.writeFileSync(envPath, text.endsWith("\n") ? text : text + "\n");
}

async function getToken(appId, appSecret) {
  const res = await fetch(
    `${FEISHU_HOST}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );
  const json = await res.json();
  if (json.code !== 0) throw new Error(`鉴权失败: ${json.msg || json.code}`);
  return json.tenant_access_token;
}

async function feishu(token, method, apiPath, body) {
  const res = await fetch(`${FEISHU_HOST}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(`${method} ${apiPath} → ${json.msg || json.code}`);
  }
  return json.data;
}

async function listTables(token, appToken) {
  const items = [];
  let pageToken;
  do {
    const qs = new URLSearchParams({ page_size: "100" });
    if (pageToken) qs.set("page_token", pageToken);
    const data = await feishu(
      token,
      "GET",
      `/open-apis/bitable/v1/apps/${appToken}/tables?${qs}`
    );
    items.push(...(data.items || []));
    pageToken = data.has_more ? data.page_token : undefined;
  } while (pageToken);
  return items;
}

function findTable(tables, aliases) {
  const lower = aliases.map((a) => a.toLowerCase());
  return tables.find((t) => lower.includes(String(t.name || "").toLowerCase()));
}

async function main() {
  const fileEnv = loadEnvFile();
  const appId = process.env.FEISHU_APP_ID || fileEnv.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET || fileEnv.FEISHU_APP_SECRET;
  const appToken =
    process.env.FEISHU_BITABLE_APP_TOKEN || fileEnv.FEISHU_BITABLE_APP_TOKEN;

  if (!appId || !appSecret || !appToken) {
    console.error("缺少 FEISHU_APP_ID / FEISHU_APP_SECRET / FEISHU_BITABLE_APP_TOKEN");
    process.exit(1);
  }

  console.log("获取 tenant_access_token…");
  const token = await getToken(appId, appSecret);

  console.log("读取 Base 内已有数据表…");
  const tables = await listTables(token, appToken);
  console.log(
    `当前共 ${tables.length} 张表:`,
    tables.map((t) => t.name).join(", ") || "(空)"
  );

  const updates = {
    FEISHU_APP_ID: appId,
    FEISHU_APP_SECRET: appSecret,
    FEISHU_BITABLE_APP_TOKEN: appToken,
  };
  const missing = [];

  for (const [key, spec] of Object.entries(TABLE_SPECS)) {
    const table = findTable(tables, spec.aliases);
    if (!table) {
      missing.push(key + " ← " + spec.aliases[0]);
      continue;
    }
    console.log(`✓ ${spec.aliases[0]} → ${table.table_id}`);
    updates[spec.env] = table.table_id;
  }

  if (missing.length) {
    throw new Error(`缺少表: ${missing.join(", ")}`);
  }

  // 写权限探活：尝试列出租户表记录
  await feishu(
    token,
    "GET",
    `/open-apis/bitable/v1/apps/${appToken}/tables/${updates.FEISHU_TABLE_TENANTS}/records?page_size=1`
  );
  console.log("✓ 记录读取权限正常");

  upsertEnv(updates);

  console.log(`
✅ 已对接你现有的飞书表，table_id 已写入 .env

请重启 API：npm run dev
访问 http://localhost:3000/api/platform/health
应看到 storeMode: "feishu"
`);
}

main().catch((err) => {
  console.error("\n❌ Bootstrap 失败:", err.message);
  console.error(`
常见原因：
- App ID / Secret 错误
- 应用未发布安装到企业
- 应用未加入该多维表格的协作者
- 权限未开通（需要 bitable / base record 相关权限）
`);
  process.exit(1);
});
