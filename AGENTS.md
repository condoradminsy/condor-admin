# AGENTS.md — CondorAdmin

Vue 3 + Vite 7 + TypeScript + NaiveUI + Pinia + UnoCSS 中后台，基于 Soybean Admin 二次开发，后端 PHP Webman。

## 关键命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | dev server (port 9527, mode=test) |
| `pnpm dev:prod` | dev server (mode=prod) |
| `pnpm build` / `pnpm build:test` | 生产/测试构建 |
| `pnpm lint` | ESLint 自动修复 |
| `pnpm typecheck` | vue-tsc 类型检查 |
| `pnpm gen-route` | 根据 `src/views/` 重新生成路由文件 |
| `pnpm commit` | 交互式生成 Conventional Commit |
| `pnpm preview` | 预览构建 (port 9725) |

验证顺序：`pnpm typecheck && pnpm lint`（即 pre-commit hook 的执行顺序）。

## 架构要点

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

### 路由

路由使用 `@elegant-router/vue` 自动生成。`src/router/elegant/routes.ts` 和 `imports.ts` 由 `pnpm gen-route` 根据 `src/views/` 目录结构自动生成，**不要手动编辑**。

- 路由名称规则：目录结构用 `_` 连接，如 `src/views/system/admin/` → 路由名 `system_admin`
- 路由模式通过 `.env` 中 `VITE_AUTH_ROUTE_MODE` 控制：
  - `static`：前端定义所有路由，通过 `meta.roles` 控制权限
  - `dynamic`：后端接口返回用户可访问路由
- 路由守卫流程（`src/router/guard/route.ts`）：初始化常量路由 → 检查登录状态 → 初始化权限路由 → 权限校验

### 状态管理(Pinia)

Store 模块（`src/store/modules/`）：

- `auth` — 登录/登出/用户信息/token 管理，RSA 加密密码，SSE 初始化，字典初始化
- `route` — 常量路由/权限路由初始化，菜单/面包屑/缓存路由生成
- `theme` — 主题配置（亮暗色、布局、水印等）
- `tab` — 多标签页管理
- `app` — 应用全局状态
- `condor` — 数据字典（dictData）和语言列表缓存
- `captcha` — 验证码

### 布局架构

两种布局（`src/layouts/`）：

- `base-layout` — 主布局，包含侧边栏、头部、标签栏、内容区
- `blank-layout` — 空白布局，用于登录页等

布局子模块在 `src/layouts/modules/`：`global-menu`, `global-header`, `global-sider`, `global-tab`, `global-breadcrumb`, `global-search`, `theme-drawer` 等。

### 新页面开发（CondorTable）

新页面 = 配置文件 + i18n + 类型定义，三步走：

1. `src/views/{module}/{page}/index.vue` — 配置 `Condor.Table.Config`
2. `src/locales/condor/{module}/{page}/` — 中英文翻译 + 入口文件
3. `src/typings/condor/i18n/{module}/{page}.d.ts` — 翻译键类型，并注册到 `src/typings/condor/i18n/index.d.ts` 的 `PageSchema`

参考模板：`src/views/system/admin/index.vue`（最简单的 CRUD 页面）。

新建页面无需手动配路由，`pnpm gen-route` 自动从 `src/views/` 目录结构生成。

### 模块开发（src/modules/）

`src/modules/` 下每个目录是一个独立业务模块，**以目录存在即启用**。详见 `src/modules/MODULE_CONVENTION.md`。

模块目录结构：
```
src/modules/{plugin-name}/
├── views/                        # Vue 页面（与 src/views/ 结构一致）
│   └── {page}/index.vue
├── locales/                      # i18n 翻译文件
│   ├── route.ts                  # 路由标签自描述
│   └── condor/{plugin-name}/{page}/
│       ├── index.ts              # 入口: 导出 { 'zh-CN': zhCn, 'en-US': enUs }
│       └── langs/
│           ├── zh-cn.ts          # 中文翻译
│           └── en-us.ts          # 英文翻译
└── types/
    ├── i18n.d.ts                 # Module Augmentation — declare global 自动合并 PageSchema
    └── i18n/{page}.d.ts          # 翻译键类型接口
```

关键机制：

- **路由自动发现**：`pnpm gen-route` 同时扫描 `src/views/` 和 `src/modules/*/views/`，自动生成路由定义、组件导入和映射表。无需手动编辑 `src/router/elegant/routes.ts`。
- **Module Augmentation**：模块的 `types/i18n.d.ts` 通过 `declare global { namespace App.I18n { interface PageSchema { ... } } }` 自动合并到全局类型，无需手动修改 `src/typings/condor/i18n/index.d.ts`。
- **Locale 动态加载**：模块 locale 文件位于 `locales/condor/{plugin-name}/{page}/index.ts`，`loadPageLocale()` 通过 `import.meta.glob` 根据当前路由 path 自动加载。

开发步骤参考：
1. `src/modules/_template/` — copy 为 `src/modules/{your-module}/`，替换 `{plugin}`、`{page}` 占位符
2. 实现页面 `views/{page}/index.vue`
3. 配置 `types/i18n/{page}.d.ts` 翻译键类型 + `types/i18n.d.ts` PageSchema 注册
4. 编写 `locales/` 下中英文翻译文件 + `locales/route.ts` 路由标签
5. 运行 `pnpm gen-route` 生成路由
6. 运行 `pnpm typecheck && pnpm lint` 验证

**禁止跨模块 import**。模块之间不得直接依赖，共享逻辑提取到 `packages/` 或 `src/shared/`。

### 后端 API 路径规则

后端 PHP Webman，API 路径格式：`/core/{模块前缀}/{模块名}/{方法}`

- 模块前缀：`admin`（系统管理）、`condorauth`、`buyback`、`common`（通用）
- 模块名用短横线（kebab-case），**前端目录下划线 ↔ 后端 API 短横线**
- 标准方法：`index`（列表）、`add`（新增）、`edit`（编辑）、`del`（删除）、`multi`（批量）
- 通用接口：`/core/common/getDict`、`/core/common/getConfig`

```ts
urls: {
  index: '/core/{module}/{name}/index',
  add: '/core/{module}/{name}/add',
  edit: '/core/{module}/{name}/edit',
  del: '/core/{module}/{name}/del',
  multi: '/core/{module}/{name}/multi'
}
```

### CondorTable 列配置要点

- **搜索列**：设置 `operator: 'like'`（模糊）或 `operator: '='`（精确）
- **只读列**：`form: false`（表格显示但不显示在表单）
- **表单隐藏列**：`visible: false`（不显示在表格，但表单可用，如密码）
- **状态开关**：`component: { name: 'n-switch', props: { checkedValue: 1, uncheckedValue: 2 } }`
- **字典选择器**：`component: { name: 'condor-dict-radio', props: { code: 'dict_key' } }`
- **时间列**：`render: 'datetime'`
- **关联选择器**：`component: { name: 'condor-select', props: { url: 'core/xxx/selectpage' } }`
- **树形选择器**：`component: { name: 'condor-tree-select', props: { url: 'core/xxx/selectpage', checkable: true, multiple: true } }`
- **富文本编辑器**：`component: { name: 'condor-editor' }`
- **图片列**：`render: 'image'` 或 `component: { name: 'condor-upload', props: { type: 'image' } }`
- **操作列**：`type: 'operate'`, `buttons: ['edit', 'del']`
- **表单规则**：`rules: [{ required: true, trigger: 'blur' }]`

### 请求层

- `src/service/request/index.ts` — 主实例 `request`（`createFlatRequest` 封装）
- 自动注入 `Authorization: Bearer <token>` 和 `locale` 请求头
- 成功响应码 `0000`（`VITE_SERVICE_SUCCESS_CODE` 可配）
- 失败码分类：`LOGOUT_CODES`（强制登出）、`MODAL_LOGOUT_CODES`（弹窗登出）、`EXPIRED_TOKEN_CODES`（自动刷新 token）
- 返回格式：`{ code, msg, data }`，`createFlatRequest` 已解构 `data`，直接取 `{ error, data }`
- API 函数放在 `src/service/api/`

### i18n 国际化

- 默认 `zh-CN`，支持 `en-US`
- 通用键：`$t('common.xxx')`, `$t('condor.common.xxx')`, `$t('condor.component.xxx')`
- 多语言字段取值：`getValueByLocale(row.fieldName)`
- 页面级 locale 通过 `loadPageLocale()` 使用 import.meta.glob 动态加载 ./condor/**/index.ts，页面路由 path 作为路径映射建国际化文件
- I18nKey 由 GetI18nKey<Schema> 递归生成，需要在 Schema 中按模块添加类型定义。

### 项目特有约定

- 代码规范：PSR-12（PHP）、interface > type（TS）、无 `any`、用 `satisfies` 代替 `as`
- CSS：UnoCSS 优先，不写自定义 CSS
- `@/` → `src/`, `~/` → 项目根目录
- `npmrc` 配置了 `shamefully-hoist=true`（依赖扁平化）+ NPMMirror 镜像
- API 代理：`/proxy-default` 前缀，通过 `.env` 中 `VITE_HTTP_PROXY=Y` 启用
- `condor` 前缀层（组件、hooks、locales）是项目的业务定制层，非上游 Soybean 代码
- 登录密码使用 RSA 加密（JSEncrypt），后端返回公钥
