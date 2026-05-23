# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CondorAdmin 是基于 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin) 开发的后台管理模板，后端使用 PHP-Webman + MySQL，前端使用 Vue3 + Vite7 + TypeScript + NaiveUI + UnoCSS。采用 pnpm monorepo 架构。

## Commands

```bash
pnpm dev              # 启动开发服务器 (mode: test, port 9527)
pnpm dev:prod         # 启动开发服务器 (mode: prod)
pnpm build            # 生产构建
pnpm build:test       # 测试环境构建
pnpm lint             # ESLint 检查和自动修复
pnpm typecheck        # TypeScript 类型检查
pnpm gen-route        # 重新生成 Elegant Router 路由文件
pnpm commit           # 交互式生成 Conventional Commits 提交信息
pnpm preview          # 预览构建结果 (port 9725)
```

## Architecture

### pnpm Monorepo

`packages/` 下的 workspace 包（`@sa/*`）：
- `@sa/axios` — HTTP 请求封装，提供 `createFlatRequest` / `createRequest`
- `@sa/hooks` — 通用 composables（`useBoolean`, `useLoading` 等）
- `@sa/utils` — 工具函数
- `@sa/color` — 主题颜色工具
- `@sa/materials` — 通用物料组件
- `@sa/scripts` — CLI 脚本（cleanup, git-commit, gen-route, release）
- `@sa/uno-preset` — UnoCSS 预设
- `@sa/alova` — alova 请求库封装（备选）

### Routes — Elegant Router

路由使用 `@elegant-router/vue` 自动生成。`src/router/elegant/routes.ts` 和 `imports.ts` 由 `pnpm gen-route` 根据 `src/views/` 目录结构自动生成，**不要手动编辑**。

- 路由名称规则：目录结构用 `_` 连接，如 `src/views/system/admin/` → 路由名 `system_admin`
- 路由模式通过 `.env` 中 `VITE_AUTH_ROUTE_MODE` 控制：
  - `static`：前端定义所有路由，通过 `meta.roles` 控制权限
  - `dynamic`：后端接口返回用户可访问路由
- 路由守卫流程（`src/router/guard/route.ts`）：初始化常量路由 → 检查登录状态 → 初始化权限路由 → 权限校验

### Service Layer (`src/service/`)

- `request/index.ts` — 主请求实例 `request`（使用 `createFlatRequest`），自动处理：
  - 请求头注入 Authorization token 和 locale
  - 响应 code 判断（成功码 `0000`，通过 `VITE_SERVICE_SUCCESS_CODE` 配置）
  - Token 过期自动刷新（`VITE_SERVICE_EXPIRED_TOKEN_CODES`）
  - 强制登出（`VITE_SERVICE_LOGOUT_CODES`）和弹窗登出（`VITE_SERVICE_MODAL_LOGOUT_CODES`）
- `request/shared.ts` — token 获取、baseURL 解析、过期请求重试逻辑
- `api/` — 具体 API 函数定义（`auth.ts`, `route.ts`, `condor.ts`）

### State Management (Pinia)

Store 模块（`src/store/modules/`）：
- `auth` — 登录/登出/用户信息/token 管理，RSA 加密密码，SSE 初始化，字典初始化
- `route` — 常量路由/权限路由初始化，菜单/面包屑/缓存路由生成
- `theme` — 主题配置（亮暗色、布局、水印等）
- `tab` — 多标签页管理
- `app` — 应用全局状态
- `condor` — 数据字典（dictData）和语言列表缓存
- `captcha` — 验证码

### Condor Custom Layer

`condor` 前缀的组件和 hooks 是项目业务定制层：

- `src/components/condor/` — 业务组件：`condor-table`, `condor-form-item`, `condor-search`, `condor-select`, `condor-editor`, `condor-upload`, `condor-dict-*` 系列等
- `src/hooks/condor/` — 业务 hooks：`table.ts`（表格逻辑）, `form.ts`（表单逻辑）, `sse.ts`（Server-Sent Events）, `column.ts`（列配置）, `xlsx.ts`（Excel 导出）
- `src/locales/condor/` — 业务页面级别的国际化文件，按页面路径组织，支持动态加载

### i18n

- 使用 `vue-i18n`，默认语言 `zh-CN`，支持 `en-US`
- 页面级 locale 文件放在 `src/locales/condor/{page-path}/index.ts`，通过 `loadPageLocale()` 动态加载
- 通用 locale 在 `src/locales/langs/` 下
- `getValueByLocale()` 用于根据当前语言从后端返回的多语言字段中取值

### Views Structure

- `_builtin/` — 内置页面：403/404/500、login、iframe-page
- `home/` — 首页
- `system/` — 系统管理：admin（管理员）、role（角色）、menu（菜单）、config（配置）、dict-type（字典）、attachment（附件）、crontab（定时任务）、crud（代码生成）、profile（个人资料）等

### Layout System

两种布局（`src/layouts/`）：
- `base-layout` — 主布局，包含侧边栏、头部、标签栏、内容区
- `blank-layout` — 空白布局，用于登录页等

布局子模块在 `src/layouts/modules/`：`global-menu`, `global-header`, `global-sider`, `global-tab`, `global-breadcrumb`, `global-search`, `theme-drawer` 等。

### Environment Configuration

三个环境文件：`.env`（通用）、`.env.test`、`.env.prod`

关键配置项：
- `VITE_SERVICE_SUCCESS_CODE=0000` — 后端成功响应码
- `VITE_AUTH_ROUTE_MODE=dynamic` — 路由权限模式
- `VITE_ROUTER_HISTORY_MODE=history` — 路由历史模式
- `VITE_STORAGE_PREFIX=SOY_` — localStorage 键名前缀

### Path Aliases

- `@/` → `src/`
- `~/` → 项目根目录

### Git Hooks

`simple-git-hooks`：pre-commit 执行 `typecheck && lint`，commit-msg 验证 Conventional Commits 格式。
