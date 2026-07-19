export type TenantPlan = "member" | "platinum" | "custom";
export type TenantStatus = "active" | "disabled";
export type SetupStatus = "pending" | "in_progress" | "configured";
export type PublishStatus = "draft" | "pending" | "published";

export interface Tenant {
  id: string;
  username: string;
  password: string;
  displayName: string;
  email: string;
  phone: string;
  plan: TenantPlan;
  status: TenantStatus;
  notes: string;
  createdAt: string;
  lastLoginAt: string | null;
  credentialsSentAt: string | null;
  setupStatus: SetupStatus;
  publishStatus: PublishStatus;
  contentSummary: { routes: number; articles: number };
  uiTemplate?: string;
  customDomain?: string;
  /** Feishu record id */
  recordId?: string;
}

export interface TenantProfile {
  nickname: string;
  bio: string;
  email: string;
  phone: string;
  wechat: string;
  avatar: string;
}

export interface TenantArticle {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  recordId?: string;
}

export interface TenantRoute {
  id: string;
  title: string;
  description: string;
  price: number;
  days: number;
  image: string;
  highlights: { items: Array<{ text: string; image: string }> };
  createdAt: string;
  updatedAt: string;
  recordId?: string;
}

export interface TenantPublish {
  status: PublishStatus;
  domainMode: string | null;
  customDomain: string;
  assignedDomain: string;
  publishedAt: string | null;
}

export interface TenantAccount {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  plan: TenantPlan;
  role: string;
  createdAt: string;
}

export interface TenantSiteData {
  profile: TenantProfile;
  articles: TenantArticle[];
  routes: TenantRoute[];
  visitCount: number;
  notifications: Array<{ id: string; title: string; message: string; time: string; read: boolean }>;
  uiTemplate: string;
  publish: TenantPublish;
  inquiries: unknown[];
  account: TenantAccount;
  prefabSeeded?: boolean;
}

export interface PlatformData {
  tenants: Tenant[];
}

export interface PlatformStore {
  mode: "file" | "feishu";
  listTenants(): Promise<Tenant[]>;
  getTenant(id: string): Promise<Tenant | null>;
  getTenantByUsername(username: string): Promise<Tenant | null>;
  createTenant(input: Omit<Tenant, "recordId" | "setupStatus" | "publishStatus" | "contentSummary" | "lastLoginAt" | "credentialsSentAt">): Promise<Tenant>;
  updateTenant(id: string, patch: Partial<Tenant>): Promise<Tenant>;
  recordLogin(id: string): Promise<void>;
  getSiteData(tenantId: string): Promise<TenantSiteData | null>;
  saveSiteData(tenantId: string, data: TenantSiteData): Promise<void>;
  syncTenantMeta(tenantId: string): Promise<Tenant | null>;
}
