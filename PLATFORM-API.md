# Tooda Platform API（editor.html / 多用户账号.html 后端）

为 `editor.html` 和 `多用户账号.html` 提供 API，支持：

- **本地文件存储**（默认，无需飞书，数据在 `.data/`）
- **飞书多维表格**（配置环境变量后自动切换）

## 快速启动（本地文件模式）

```bash
cd tour-saas-admin
npm install
cp .env.example .env
npm run dev
```

**主后台（同源托管）**：http://localhost:3000 → `/editor.html`  
**超管租户配置**：http://localhost:3000/accounts.html  
（`public/accounts.html`，同源请求 `/api/platform`；新建租户写入飞书「平台租户表」）

API 地址：`http://localhost:3000/api/platform`

也可单独打开仓库根目录下的 HTML（需自行指向 API）：

- `saas后台/editor.html`（源文件；运行入口以 `public/editor.html` 为准）
- `saas后台/多用户账号.html`

页面顶部会显示当前存储模式：`file` 或 `feishu`。

旧版 Prisma 管理页 `/dashboard` 仅作遗留参考，与 Platform 数据不互通。

## API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/platform/health` | 健康检查、存储模式 |
| POST | `/api/platform/auth/login` | 租户/超管登录 |
| GET | `/api/platform/tenants` | 租户列表（需超管头） |
| POST | `/api/platform/tenants` | 新建租户 |
| PATCH | `/api/platform/tenants/:id` | 更新状态/重置密码 |
| GET | `/api/platform/tenants/:id/data` | 读取网站配置 |
| PUT | `/api/platform/tenants/:id/data` | 保存网站配置 |
| POST | `/api/platform/tenants/refresh` | 刷新所有租户状态 |

超管请求头：`X-Super-Admin: tooda2026`

## 飞书多维表格配置

当前写入用的飞书 Base（应用自建、可读写）：

https://my.feishu.cn/base/GGcqbtO3Oams1ksgqtwcVNGjneh

说明：原 Base `LTpDb0MRqayaswsuyVlc1vBHngf` 对开放平台应用仅可读，写入会 `91403 Forbidden`，已迁移数据到上库。原库 token 保存在 `.env` 的 `FEISHU_BITABLE_APP_TOKEN_OLD`。

已对接 6 张中文表：

| 环境变量 | 表名 |
|----------|------|
| FEISHU_TABLE_TENANTS | 平台租户表 |
| FEISHU_TABLE_PROFILES | 租户配置表 |
| FEISHU_TABLE_ROUTES | 旅游路线表 |
| FEISHU_TABLE_ARTICLES | 文章博客表 |
| FEISHU_TABLE_PUBLISH | 网站发布配置表 |
| FEISHU_TABLE_NOTIFICATIONS | 系统通知表 |

### 1. 创建飞书应用

1. 打开 [飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 开通权限：`bitable:app`、`base:record:retrieve`、`base:record:create`、`base:record:update`、`base:record:delete`
4. 发布版本并安装到企业

### 2. 给多维表格「添加文档应用」（必须，否则 91403 Forbidden）

打开上述 Base → 右上角 `…` → 更多 → **添加文档应用** → 选中你的应用 → 权限选 **可编辑**（不能只读）。

### 3. 写入凭证并校验表映射

在 `.env` 中填写：

```
FEISHU_APP_ID=cli_xxxxxxxx
FEISHU_APP_SECRET=xxxxxxxx
FEISHU_BITABLE_APP_TOKEN=LTpDb0MRqayaswsuyVlc1vBHngf
```

然后执行：

```bash
npm run feishu:bootstrap
```

脚本会按中文表名自动写入各 `table_id`。

### 4. 启动验证

```bash
npm run dev
```

访问 `/api/platform/health`，应返回 `storeMode: "feishu"`。

editor 保存的文章、路线会写入「文章博客表」「旅游路线表」；也可直接在飞书里查看/修改。

### 5. 初始化演示租户

用「多用户账号」页新建租户，或在「平台租户表」手动加一行。

### 字段说明（中文列名）

读写已按现有列名映射，无需改成英文。关键字段例如：

- 平台租户表：`租户ID (主键)`、`登录账号`、`登录密码` …
- 文章博客表：`文章ID (主键)`、`租户ID (外键)`、`文章标题`、`文章内容` …
- 旅游路线表：`路线ID (主键)`、`租户ID (外键)`、`路线标题`、`行程安排` …

## 部署到云服务器

```bash
npm run build
npm start
# 或 pm2 start npm --name tooda-api -- start
```

将 `editor.html` 中的 `TOODA_API_BASE` 改为你的域名，例如：

```html
<script>window.TOODA_API_BASE = 'https://api.tooda.travel';</script>
```

## 登录账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 超级管理员 | superadmin | tooda2026 |
| 演示租户 | admin | 123456 |
