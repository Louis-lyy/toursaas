import fs from "fs/promises";
import path from "path";
import type { PlatformStore, Tenant, TenantSiteData } from "./types";
import {
  buildTenantMetaFromSite,
  defaultSiteData,
  genId,
} from "./utils";

const DATA_DIR = path.join(process.cwd(), ".data");
const PLATFORM_FILE = path.join(DATA_DIR, "platform.json");
const TENANTS_DIR = path.join(DATA_DIR, "tenants");

async function ensureDirs() {
  await fs.mkdir(TENANTS_DIR, { recursive: true });
}

async function readPlatform(): Promise<{ tenants: Tenant[] }> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(PLATFORM_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return { tenants: parsed.tenants || [] };
  } catch {
    const seed: Tenant = {
      id: "tenant-001",
      username: "admin",
      password: "123456",
      displayName: "China Tour",
      email: "389045@qq.com",
      phone: "+86 29 1234 5678",
      plan: "platinum",
      status: "active",
      notes: "默认演示租户",
      createdAt: "2026-01-15T08:00:00.000Z",
      lastLoginAt: null,
      credentialsSentAt: null,
      setupStatus: "pending",
      publishStatus: "draft",
      contentSummary: { routes: 0, articles: 0 },
    };
    const platform = { tenants: [seed] };
    await fs.writeFile(PLATFORM_FILE, JSON.stringify(platform, null, 2));
    await fs.writeFile(
      path.join(TENANTS_DIR, `${seed.id}.json`),
      JSON.stringify(defaultSiteData(seed), null, 2)
    );
    return platform;
  }
}

async function writePlatform(platform: { tenants: Tenant[] }) {
  await ensureDirs();
  await fs.writeFile(PLATFORM_FILE, JSON.stringify(platform, null, 2));
}

function tenantFile(tenantId: string) {
  return path.join(TENANTS_DIR, `${tenantId}.json`);
}

export const fileStore: PlatformStore = {
  mode: "file",

  async listTenants() {
    const platform = await readPlatform();
    const result: Tenant[] = [];
    for (const t of platform.tenants) {
      const synced = await this.syncTenantMeta(t.id);
      if (synced) result.push(synced);
    }
    return result;
  },

  async getTenant(id) {
    const platform = await readPlatform();
    return platform.tenants.find((t) => t.id === id) || null;
  },

  async getTenantByUsername(username) {
    const platform = await readPlatform();
    return platform.tenants.find((t) => t.username === username) || null;
  },

  async createTenant(input) {
    const platform = await readPlatform();
    if (platform.tenants.some((t) => t.username === input.username)) {
      throw new Error("登录账号已存在");
    }
    const tenant: Tenant = {
      ...input,
      id: input.id || genId("tenant"),
      setupStatus: "pending",
      publishStatus: "draft",
      contentSummary: { routes: 0, articles: 0 },
      lastLoginAt: null,
      credentialsSentAt: null,
    };
    platform.tenants.unshift(tenant);
    await writePlatform(platform);
    await fs.writeFile(
      tenantFile(tenant.id),
      JSON.stringify(defaultSiteData(tenant), null, 2)
    );
    return tenant;
  },

  async updateTenant(id, patch) {
    const platform = await readPlatform();
    const idx = platform.tenants.findIndex((t) => t.id === id);
    if (idx < 0) throw new Error("租户不存在");
    platform.tenants[idx] = { ...platform.tenants[idx], ...patch };
    await writePlatform(platform);
    return platform.tenants[idx];
  },

  async recordLogin(id) {
    await this.updateTenant(id, { lastLoginAt: new Date().toISOString() });
  },

  async getSiteData(tenantId) {
    await ensureDirs();
    try {
      const raw = await fs.readFile(tenantFile(tenantId), "utf8");
      return JSON.parse(raw) as TenantSiteData;
    } catch {
      const tenant = await this.getTenant(tenantId);
      if (!tenant) return null;
      const data = defaultSiteData(tenant);
      await fs.writeFile(tenantFile(tenantId), JSON.stringify(data, null, 2));
      return data;
    }
  },

  async saveSiteData(tenantId, data) {
    await ensureDirs();
    await fs.writeFile(tenantFile(tenantId), JSON.stringify(data, null, 2));
    await this.syncTenantMeta(tenantId);
  },

  async syncTenantMeta(tenantId) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return null;
    const data = await this.getSiteData(tenantId);
    const updated = buildTenantMetaFromSite(tenant, data);
    const platform = await readPlatform();
    const idx = platform.tenants.findIndex((t) => t.id === tenantId);
    if (idx >= 0) {
      platform.tenants[idx] = { ...platform.tenants[idx], ...updated };
      await writePlatform(platform);
      return platform.tenants[idx];
    }
    return updated;
  },
};
