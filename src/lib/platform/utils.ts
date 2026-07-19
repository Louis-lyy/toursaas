import type { SetupStatus, Tenant, TenantSiteData } from "./types";

export function computeSetupStatus(data: TenantSiteData | null): SetupStatus {
  if (!data) return "pending";
  const routes = data.routes?.length || 0;
  const articles = data.articles?.length || 0;
  const profile = data.profile || {};
  const hasContent = routes > 0 || articles > 0;
  const hasProfile = !!(
    profile.nickname?.trim() &&
    (profile.email?.trim() || profile.phone?.trim())
  );
  if (hasContent && hasProfile) return "configured";
  if (hasContent || hasProfile) return "in_progress";
  return "pending";
}

export function buildTenantMetaFromSite(
  tenant: Tenant,
  data: TenantSiteData | null
): Tenant {
  return {
    ...tenant,
    setupStatus: computeSetupStatus(data),
    publishStatus: data?.publish?.status || "draft",
    contentSummary: {
      routes: data?.routes?.length || 0,
      articles: data?.articles?.length || 0,
    },
    displayName: data?.account?.displayName || tenant.displayName,
    email: data?.account?.email || tenant.email,
    phone: data?.account?.phone || tenant.phone,
    uiTemplate: data?.uiTemplate || tenant.uiTemplate,
    customDomain: data?.publish?.customDomain || tenant.customDomain,
  };
}

export function defaultSiteData(tenant: Tenant): TenantSiteData {
  return {
    profile: {
      nickname: tenant.displayName || "My Tour",
      bio: "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      wechat: "",
      avatar: "",
    },
    articles: [],
    routes: [],
    visitCount: 0,
    notifications: [],
    uiTemplate: "classic",
    publish: {
      status: "draft",
      domainMode: null,
      customDomain: "",
      assignedDomain: "",
      publishedAt: null,
    },
    inquiries: [],
    account: {
      id: tenant.id,
      username: tenant.username,
      displayName: tenant.displayName,
      email: tenant.email,
      phone: tenant.phone,
      plan: tenant.plan,
      role: "owner",
      createdAt: tenant.createdAt,
    },
  };
}

export function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function genPassword(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
