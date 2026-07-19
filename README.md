# TourSaaS Admin

导游内容管理后台：以 **editor.html** 为主界面，后端为 Platform API（本地文件或飞书多维表格）。

## 快速启动

```bash
cd tour-saas-admin
npm install
cp .env.example .env
npm run dev
```

浏览器访问：http://localhost:3000 → 自动进入 `/editor.html`

## 主后台（推荐）

| 入口 | 说明 |
|------|------|
| `/` 或 `/editor.html` | Tooda Admin：仪表盘、UI 模版、文章、路线、网站资料、发布 |
| `/api/platform/*` | 租户登录与站点数据 API |

登录走 `/api/platform/auth/login`，数据存飞书或 `.data/`（见 `PLATFORM-API.md`）。

租户账号由「多用户账号」页或飞书「平台租户表」创建，不是下方遗留账号。

## 遗留 Prisma MVP（可选）

旧版 React 后台仍保留，与主后台**数据不互通**：

- 登录页：`/login`（演示账号 `admin` / `123456`）
- 管理页：`/dashboard`、`/articles`、`/routes`、`/profile`
- 预览：`/preview`（读 Prisma SQLite）

## 技术栈

- Next.js 14（托管 editor + Platform API）
- 主数据：飞书多维表格 / 本地 `.data/`
- 遗留：Prisma + SQLite + TipTap
