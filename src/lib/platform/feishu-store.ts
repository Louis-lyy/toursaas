import {
  createRecord,
  deleteRecords,
  ensureTableIds,
  fieldNumber,
  fieldText,
  listAllRecords,
  tableIds,
  updateRecord,
} from "../feishu/client";
import type {
  PlatformStore,
  Tenant,
  TenantArticle,
  TenantRoute,
  TenantSiteData,
} from "./types";
import {
  buildTenantMetaFromSite,
  defaultSiteData,
  genId,
} from "./utils";

/** 飞书中文字段名映射（与现有 Base 一致） */
const F = {
  tenant: {
    id: "租户ID (主键)",
    username: "登录账号",
    password: "登录密码",
    displayName: "显示名称",
    email: "邮箱",
    phone: "手机号",
    plan: "套餐",
    status: "状态",
    notes: "备注",
    createdAt: "创建时间",
    lastLoginAt: "最近登录时间",
    credentialsSentAt: "账号发送时间",
    setupStatus: "配置状态",
    publishStatus: "发布状态",
    routesCount: "路线数量",
    articlesCount: "文章数量",
  },
  profile: {
    id: "配置ID (主键)",
    tenantId: "租户ID (外键)",
    nickname: "昵称|品牌名",
    email: "联系邮箱",
    phone: "联系电话",
    address: "地址",
    avatar: "Logo图片路径",
    bio: "品牌描述",
  },
  article: {
    id: "文章ID (主键)",
    tenantId: "租户ID (外键)",
    title: "文章标题",
    slug: "路由别名",
    content: "文章内容",
    cover: "封面图片",
    createdAt: "创建时间",
    updatedAt: "更新时间",
    status: "状态",
  },
  route: {
    id: "路线ID (主键)",
    tenantId: "租户ID (外键)",
    title: "路线标题",
    slug: "路由别名",
    description: "路线描述",
    days: "时长",
    price: "价格",
    cover: "封面图片",
    detailImages: "详情图片",
    itinerary: "行程安排",
    createdAt: "创建时间",
    updatedAt: "更新时间",
    status: "状态",
  },
  publish: {
    id: "配置ID (主键)",
    tenantId: "租户ID (外键)",
    customDomain: "自定义域名",
    template: "模板类型",
    status: "发布状态",
    publishedAt: "发布时间",
    dns: "DNS配置",
  },
  notification: {
    id: "通知ID (主键)",
    tenantId: "租户ID (外键)",
    title: "通知标题",
    content: "通知内容",
    read: "是否已读",
    createdAt: "创建时间",
  },
} as const;

function tenantFilter(tenantId: string, field: string) {
  return `CurrentValue.[${field}]="${tenantId}"`;
}

function tenantFromRecord(rec: {
  record_id: string;
  fields: Record<string, unknown>;
}): Tenant {
  const f = rec.fields;
  return {
    recordId: rec.record_id,
    id: fieldText(f[F.tenant.id]),
    username: fieldText(f[F.tenant.username]),
    password: fieldText(f[F.tenant.password]),
    displayName: fieldText(f[F.tenant.displayName]),
    email: fieldText(f[F.tenant.email]),
    phone: fieldText(f[F.tenant.phone]),
    plan: (fieldText(f[F.tenant.plan]) || "platinum") as Tenant["plan"],
    status: (fieldText(f[F.tenant.status]) || "active") as Tenant["status"],
    notes: fieldText(f[F.tenant.notes]),
    createdAt: fieldText(f[F.tenant.createdAt]) || new Date().toISOString(),
    lastLoginAt: fieldText(f[F.tenant.lastLoginAt]) || null,
    credentialsSentAt: fieldText(f[F.tenant.credentialsSentAt]) || null,
    setupStatus: (fieldText(f[F.tenant.setupStatus]) ||
      "pending") as Tenant["setupStatus"],
    publishStatus: (fieldText(f[F.tenant.publishStatus]) ||
      "draft") as Tenant["publishStatus"],
    contentSummary: {
      routes: fieldNumber(f[F.tenant.routesCount]),
      articles: fieldNumber(f[F.tenant.articlesCount]),
    },
  };
}

function tenantToFields(tenant: Tenant, data?: TenantSiteData | null) {
  const meta = data ? buildTenantMetaFromSite(tenant, data) : tenant;
  return {
    [F.tenant.id]: meta.id,
    [F.tenant.username]: meta.username,
    [F.tenant.password]: meta.password,
    [F.tenant.displayName]: meta.displayName,
    [F.tenant.email]: meta.email,
    [F.tenant.phone]: meta.phone,
    [F.tenant.plan]: meta.plan,
    [F.tenant.status]: meta.status,
    [F.tenant.notes]: meta.notes || "",
    [F.tenant.createdAt]: meta.createdAt,
    [F.tenant.lastLoginAt]: meta.lastLoginAt || "",
    [F.tenant.credentialsSentAt]: meta.credentialsSentAt || "",
    [F.tenant.setupStatus]: meta.setupStatus,
    [F.tenant.publishStatus]: meta.publishStatus,
    [F.tenant.routesCount]: meta.contentSummary?.routes || 0,
    [F.tenant.articlesCount]: meta.contentSummary?.articles || 0,
  };
}

function articleFromRecord(rec: {
  record_id: string;
  fields: Record<string, unknown>;
}): TenantArticle {
  const f = rec.fields;
  return {
    recordId: rec.record_id,
    id: fieldText(f[F.article.id]),
    title: fieldText(f[F.article.title]),
    content: fieldText(f[F.article.content]),
    coverImage: fieldText(f[F.article.cover]),
    status: fieldText(f[F.article.status]) || "draft",
    createdAt: fieldText(f[F.article.createdAt]),
    updatedAt: fieldText(f[F.article.updatedAt]),
  };
}

function routeFromRecord(rec: {
  record_id: string;
  fields: Record<string, unknown>;
}): TenantRoute {
  const f = rec.fields;
  let highlights = { items: [] as Array<{ text: string; image: string }> };
  const itineraryRaw = fieldText(f[F.route.itinerary]);
  try {
    const parsed = JSON.parse(itineraryRaw || "{}");
    if (parsed?.items) highlights = parsed;
    else if (itineraryRaw) highlights = { items: [{ text: itineraryRaw, image: "" }] };
  } catch {
    if (itineraryRaw) highlights = { items: [{ text: itineraryRaw, image: "" }] };
  }
  const detailImg = fieldText(f[F.route.detailImages]);
  if (detailImg && highlights.items.length === 0) {
    highlights = { items: [{ text: "", image: detailImg }] };
  }
  return {
    recordId: rec.record_id,
    id: fieldText(f[F.route.id]),
    title: fieldText(f[F.route.title]),
    description: fieldText(f[F.route.description]),
    price: fieldNumber(f[F.route.price]),
    days: fieldNumber(f[F.route.days]) || 1,
    image: fieldText(f[F.route.cover]),
    highlights,
    createdAt: fieldText(f[F.route.createdAt]),
    updatedAt: fieldText(f[F.route.updatedAt]),
  };
}

function parseDnsExtra(raw: string) {
  try {
    return JSON.parse(raw || "{}") as {
      domainMode?: string | null;
      assignedDomain?: string;
      visitCount?: number;
      inquiries?: unknown[];
      prefabSeeded?: boolean;
      wechat?: string;
    };
  } catch {
    return {};
  }
}

async function loadAllTenantsRaw(): Promise<Tenant[]> {
  await ensureTableIds();
  const { tenants } = tableIds();
  const records = await listAllRecords(tenants);
  return records.map(tenantFromRecord).filter((t) => t.id);
}

/** 按业务主键同步：更新已有、创建新增、仅删除本次 payload 中不存在的行（避免整表先删后写） */
async function syncTenantRows(
  tableId: string,
  tenantIdField: string,
  bizIdField: string,
  tenantId: string,
  rows: Record<string, unknown>[]
) {
  const existing = await listAllRecords(
    tableId,
    tenantFilter(tenantId, tenantIdField)
  );
  const byBizId = new Map<string, string>();
  for (const rec of existing) {
    const bid = fieldText(rec.fields[bizIdField]);
    if (bid) byBizId.set(bid, rec.record_id);
  }

  const nextIds = new Set(
    rows.map((r) => String(r[bizIdField] ?? "")).filter(Boolean)
  );
  const toDelete = existing
    .filter((rec) => {
      const bid = fieldText(rec.fields[bizIdField]);
      return !bid || !nextIds.has(bid);
    })
    .map((r) => r.record_id);
  await deleteRecords(tableId, toDelete);

  for (const fields of rows) {
    const bid = String(fields[bizIdField] ?? "");
    const recordId = bid ? byBizId.get(bid) : undefined;
    if (recordId) {
      await updateRecord(tableId, recordId, fields);
    } else {
      await createRecord(tableId, fields);
    }
  }
}

/** 同一租户的保存串行执行，防止并发 PUT 互相覆盖 */
const tenantSaveChains = new Map<string, Promise<unknown>>();

async function withTenantSaveLock<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  const prev = tenantSaveChains.get(tenantId) || Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => gate);
  tenantSaveChains.set(tenantId, chained);
  await prev.catch(() => undefined);
  try {
    return await fn();
  } finally {
    release();
    if (tenantSaveChains.get(tenantId) === chained) {
      tenantSaveChains.delete(tenantId);
    }
  }
}

export const feishuStore: PlatformStore = {
  mode: "feishu",

  async listTenants() {
    // 列表只读飞书租户行，不做逐条 syncTenantMeta（全量拉文章/路线会极慢，导致超管页超时回退 localStorage）
    return loadAllTenantsRaw();
  },

  async getTenant(id) {
    const tenants = await loadAllTenantsRaw();
    return tenants.find((t) => t.id === id) || null;
  },

  async getTenantByUsername(username) {
    const tenants = await loadAllTenantsRaw();
    return tenants.find((t) => t.username === username) || null;
  },

  async createTenant(input) {
    const existing = await this.getTenantByUsername(input.username);
    if (existing) throw new Error("登录账号已存在");

    const tenant: Tenant = {
      ...input,
      id: input.id || genId("tenant"),
      setupStatus: "pending",
      publishStatus: "draft",
      contentSummary: { routes: 0, articles: 0 },
      lastLoginAt: null,
      credentialsSentAt: null,
    };
    const data = defaultSiteData(tenant);
    await ensureTableIds();
    const ids = tableIds();
    const rec = await createRecord(ids.tenants, tenantToFields(tenant, data));
    tenant.recordId = rec.record_id;

    // 配置/发布行并行写入，缩短创建耗时
    await Promise.all([
      createRecord(ids.profiles, {
        [F.profile.id]: genId("profile"),
        [F.profile.tenantId]: tenant.id,
        [F.profile.nickname]: data.profile.nickname,
        [F.profile.email]: data.profile.email,
        [F.profile.phone]: data.profile.phone,
        [F.profile.address]: "",
        [F.profile.avatar]: data.profile.avatar || "",
        [F.profile.bio]: data.profile.bio || "",
      }),
      createRecord(ids.publish, {
        [F.publish.id]: genId("publish"),
        [F.publish.tenantId]: tenant.id,
        [F.publish.customDomain]: "",
        [F.publish.template]: data.uiTemplate || "classic",
        [F.publish.status]: "draft",
        [F.publish.publishedAt]: "",
        [F.publish.dns]: JSON.stringify({
          domainMode: null,
          assignedDomain: "",
          visitCount: 0,
          inquiries: [],
          prefabSeeded: false,
          wechat: "",
        }),
      }),
    ]);

    return tenant;
  },

  async updateTenant(id, patch) {
    const tenant = await this.getTenant(id);
    if (!tenant?.recordId) throw new Error("租户不存在");
    const updated = { ...tenant, ...patch };
    await ensureTableIds();
    const { tenants: tenantsTable } = tableIds();
    // 不要为了改密码/状态去 getSiteData（会拉文章路线，极慢导致超管页卡在「创建中」）
    await updateRecord(
      tenantsTable,
      tenant.recordId,
      tenantToFields(updated)
    );
    return updated;
  },

  async recordLogin(id) {
    await this.updateTenant(id, { lastLoginAt: new Date().toISOString() });
  },

  async getSiteData(tenantId) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) return null;

    await ensureTableIds();
    const ids = tableIds();

    const [profileRecs, articleRecs, routeRecs, publishRecs, notifRecs] =
      await Promise.all([
        listAllRecords(ids.profiles, tenantFilter(tenantId, F.profile.tenantId)),
        listAllRecords(ids.articles, tenantFilter(tenantId, F.article.tenantId)),
        listAllRecords(ids.routes, tenantFilter(tenantId, F.route.tenantId)),
        listAllRecords(ids.publish, tenantFilter(tenantId, F.publish.tenantId)),
        listAllRecords(
          ids.notifications,
          tenantFilter(tenantId, F.notification.tenantId)
        ),
      ]);

    const base = defaultSiteData(tenant);
    let profile = base.profile;
    const profileRec = profileRecs[0];
    if (profileRec) {
      const f = profileRec.fields;
      profile = {
        nickname: fieldText(f[F.profile.nickname]) || profile.nickname,
        bio: fieldText(f[F.profile.bio]),
        email: fieldText(f[F.profile.email]) || profile.email,
        phone: fieldText(f[F.profile.phone]) || profile.phone,
        wechat: "",
        avatar: fieldText(f[F.profile.avatar]),
      };
    }

    let publish = base.publish;
    let uiTemplate = tenant.uiTemplate || "classic";
    let visitCount = 0;
    let inquiries: unknown[] = [];
    let prefabSeeded = false;

    const publishRec = publishRecs[0];
    if (publishRec) {
      const f = publishRec.fields;
      const extra = parseDnsExtra(fieldText(f[F.publish.dns]));
      uiTemplate = fieldText(f[F.publish.template]) || uiTemplate;
      publish = {
        status: (fieldText(f[F.publish.status]) ||
          "draft") as TenantSiteData["publish"]["status"],
        domainMode: extra.domainMode ?? null,
        customDomain: fieldText(f[F.publish.customDomain]),
        assignedDomain: extra.assignedDomain || "",
        publishedAt: fieldText(f[F.publish.publishedAt]) || null,
      };
      visitCount = extra.visitCount || 0;
      inquiries = extra.inquiries || [];
      prefabSeeded = !!extra.prefabSeeded;
      if (extra.wechat) profile = { ...profile, wechat: extra.wechat };
    }

    const notifications = notifRecs.map((rec) => {
      const f = rec.fields;
      const readRaw = fieldText(f[F.notification.read]).toLowerCase();
      return {
        id: fieldText(f[F.notification.id]) || rec.record_id,
        title: fieldText(f[F.notification.title]),
        message: fieldText(f[F.notification.content]),
        time: fieldText(f[F.notification.createdAt]),
        read: readRaw === "true" || readRaw === "1" || readRaw === "是",
      };
    });

    return {
      profile,
      articles: articleRecs.map(articleFromRecord).filter((a) => a.id),
      routes: routeRecs.map(routeFromRecord).filter((r) => r.id),
      visitCount,
      notifications,
      uiTemplate,
      publish,
      inquiries,
      account: {
        ...base.account,
        id: tenantId,
        displayName: tenant.displayName,
        email: tenant.email,
        phone: tenant.phone,
        plan: tenant.plan,
      },
      prefabSeeded,
    };
  },

  async saveSiteData(tenantId, data) {
    return withTenantSaveLock(tenantId, async () => {
      const tenant = await this.getTenant(tenantId);
      if (!tenant?.recordId) throw new Error("租户不存在");

      await ensureTableIds();
      const ids = tableIds();

      // 先同步文章/路线，再写元数据，缩短「内容窗口」被旧请求覆盖的风险
      await syncTenantRows(
        ids.articles,
        F.article.tenantId,
        F.article.id,
        tenantId,
        (data.articles || []).map((article) => ({
          [F.article.id]: article.id,
          [F.article.tenantId]: tenantId,
          [F.article.title]: article.title,
          [F.article.slug]: "",
          [F.article.content]: article.content,
          [F.article.cover]: article.coverImage || "",
          [F.article.status]: article.status || "draft",
          [F.article.createdAt]: article.createdAt,
          [F.article.updatedAt]: article.updatedAt,
        }))
      );

      await syncTenantRows(
        ids.routes,
        F.route.tenantId,
        F.route.id,
        tenantId,
        (data.routes || []).map((route) => ({
          [F.route.id]: route.id,
          [F.route.tenantId]: tenantId,
          [F.route.title]: route.title,
          [F.route.slug]: "",
          [F.route.description]: route.description || "",
          [F.route.days]: String(route.days || 1),
          [F.route.price]: String(route.price || 0),
          [F.route.cover]: route.image || "",
          [F.route.detailImages]: route.highlights?.items?.[0]?.image || "",
          [F.route.itinerary]: JSON.stringify(
            route.highlights || { items: [] }
          ),
          [F.route.createdAt]: route.createdAt,
          [F.route.updatedAt]: route.updatedAt,
          [F.route.status]: "published",
        }))
      );

      await syncTenantRows(
        ids.notifications,
        F.notification.tenantId,
        F.notification.id,
        tenantId,
        (data.notifications || []).map((n) => ({
          [F.notification.id]: n.id,
          [F.notification.tenantId]: tenantId,
          [F.notification.title]: n.title,
          [F.notification.content]: n.message,
          [F.notification.read]: n.read ? "是" : "否",
          [F.notification.createdAt]: n.time,
        }))
      );

      await updateRecord(
        ids.tenants,
        tenant.recordId,
        tenantToFields(tenant, data)
      );

      const existingProfiles = await listAllRecords(
        ids.profiles,
        tenantFilter(tenantId, F.profile.tenantId)
      );
      const profileFields = {
        [F.profile.id]:
          fieldText(existingProfiles[0]?.fields?.[F.profile.id]) ||
          genId("profile"),
        [F.profile.tenantId]: tenantId,
        [F.profile.nickname]: data.profile?.nickname || "",
        [F.profile.email]: data.profile?.email || "",
        [F.profile.phone]: data.profile?.phone || "",
        [F.profile.address]: "",
        [F.profile.avatar]: data.profile?.avatar || "",
        [F.profile.bio]: data.profile?.bio || "",
      };
      if (existingProfiles[0]) {
        await updateRecord(
          ids.profiles,
          existingProfiles[0].record_id,
          profileFields
        );
      } else {
        await createRecord(ids.profiles, profileFields);
      }

      const existingPublish = await listAllRecords(
        ids.publish,
        tenantFilter(tenantId, F.publish.tenantId)
      );
      const publishFields = {
        [F.publish.id]:
          fieldText(existingPublish[0]?.fields?.[F.publish.id]) ||
          genId("publish"),
        [F.publish.tenantId]: tenantId,
        [F.publish.customDomain]: data.publish?.customDomain || "",
        [F.publish.template]: data.uiTemplate || "classic",
        [F.publish.status]: data.publish?.status || "draft",
        [F.publish.publishedAt]: data.publish?.publishedAt || "",
        [F.publish.dns]: JSON.stringify({
          domainMode: data.publish?.domainMode ?? null,
          assignedDomain: data.publish?.assignedDomain || "",
          visitCount: data.visitCount || 0,
          inquiries: data.inquiries || [],
          prefabSeeded: !!data.prefabSeeded,
          wechat: data.profile?.wechat || "",
        }),
      };
      if (existingPublish[0]) {
        await updateRecord(
          ids.publish,
          existingPublish[0].record_id,
          publishFields
        );
      } else {
        await createRecord(ids.publish, publishFields);
      }
    });
  },

  async syncTenantMeta(tenantId) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant?.recordId) return null;
    const data = await this.getSiteData(tenantId);
    const updated = buildTenantMetaFromSite(tenant, data);
    await ensureTableIds();
    const { tenants: tenantsTable } = tableIds();
    await updateRecord(
      tenantsTable,
      tenant.recordId,
      tenantToFields({ ...tenant, ...updated }, data)
    );
    return { ...tenant, ...updated };
  },
};
