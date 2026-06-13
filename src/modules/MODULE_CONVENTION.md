# 模块开发规范 (Module Convention)

`src/modules/` 是 CondorAdmin 的模块（插件）目录。每个模块是一个独立的业务域，**以目录存在即启用**，不涉及运行时注册中心或动态加载。模块仅作为**目录约定 + 构建时合并**的静态分层机制。

---

## 目录结构模板

```
src/modules/{plugin-name}/
├── views/                          # Vue 页面（与 src/views/ 结构一致）
│   └── {submodule}/{page}/index.vue
├── locales/                        # i18n 翻译文件
│   ├── condor/{plugin-name}/{submodule}/{page}/
│   │   ├── index.ts                # 入口文件: 导出 { 'zh-CN': zhCn, 'en-US': enUs }
│   │   └── langs/
│   │       ├── zh-cn.ts            # 中文翻译
│   │       └── en-us.ts            # 英文翻译
│   └── route.ts                    # 路由标签自描述
└── types/
    └── i18n.d.ts                   # Module Augmentation — 将页面 Schema 注册到全局 PageSchema
```

> 模块目录名 `{plugin-name}` 使用 kebab-case，如 `condorauth`、`condorbuyback`。

---

## 各文件规范与代码示例

### 1. 页面文件 — `views/{submodule}/{page}/index.vue`

使用 `CondorTable` 配置模式，参考 `src/views/system/admin/index.vue`。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/{module}/{name}/index',
    add: '/core/{module}/{name}/add',
    edit: '/core/{module}/{name}/edit',
    del: '/core/{module}/{name}/del',
    multi: '/core/{module}/{name}/multi'
  },
  rowKey(row) {
    return row.id;
  },
  columns: [
    {
      key: 'username',
      title() {
        return $t('{module}.{submodule}.{page}.username');
      },
      operator: 'like',
      rules: [{ required: true, trigger: 'blur' }]
    },
    {
      key: 'status',
      title() {
        return $t('condor.common.status');
      },
      component: {
        name: 'n-switch',
        props: { checkedValue: 1, uncheckedValue: 2 }
      }
    },
    {
      type: 'operate',
      title() {
        return $t('common.operate');
      },
      buttons: ['edit', 'del']
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config" />
  </div>
</template>
```

### 2. 翻译入口文件 — `locales/condor/{plugin-name}/{submodule}/{page}/index.ts`

```ts
import zhCn from './langs/zh-cn';
import enUs from './langs/en-us';
export default { 'zh-CN': zhCn, 'en-US': enUs };
```

参考 `src/locales/condor/condorbuyback/phone/brand/index.ts`。

### 3. 中文翻译文件 — `locales/.../langs/zh-cn.ts`

```ts
import type { CondorauthUserSchema } from '@/modules/condorauth/types/i18n/user';

const local: CondorauthUserSchema = {
  pid: '上级用户',
  username: '用户名',
  nickname: '昵称',
  password: '密码',
  email: '邮箱',
  mobile: '手机号'
};
export default local;
```

### 4. 英文翻译文件 — `locales/.../langs/en-us.ts`

```ts
import type { CondorauthUserSchema } from '@/modules/condorauth/types/i18n/user';

const local: CondorauthUserSchema = {
  pid: 'Parent User',
  username: 'Username',
  nickname: 'Nickname',
  password: 'Password',
  email: 'Email',
  mobile: 'Mobile'
};
export default local;
```

> 翻译键的类型由 `types/i18n.d.ts` 中定义的 Schema 提供，确保键名类型安全。

---

## Module Augmentation 类型注册模式

每个模块通过 `declare global { namespace App.I18n { interface PageSchema { ... } } }` 将自身的页面翻译 Schema **扩增** 到全局类型 `App.I18n.PageSchema` 中。

**文件：`types/i18n.d.ts`**

```ts
import type { CondorauthUserSchema } from './i18n/user';

declare global {
  namespace App.I18n {
    interface PageSchema {
      condorauth: {
        user: CondorauthUserSchema;
      };
    }
  }
}

export {};
```

> 该文件不需要手动引入。TS 编译器会自动发现 `src/modules/*/types/` 下的 `.d.ts` 声明文件，因为它通过 `declare global` 合并到全局 `App.I18n.PageSchema` 接口。

### 翻译类型文件规范（`src/modules/{plugin-name}/types/i18n/`）

在 `src/modules/{plugin-name}/types/i18n/` 下按模块创建翻译键类型：

```ts
// src/modules/condorauth/types/i18n/user.d.ts
export interface CondorauthUserSchema {
  pid: string;
  username: string;
  please_input_the_username: string;
  nickname: string;
  password: string;
  email: string;
  mobile: string;
}
```

参考 `src/modules/condorauth/types/i18n/user.d.ts`。

### PageSchema 注册（模块 types/i18n.d.ts）

将新模块的 Schema 导入并注册到 `PageSchema` 中：

```ts
// 模块 types/i18n.d.ts
import type { CondorauthUserSchema } from './i18n/user';

declare global {
  namespace App.I18n {
    interface PageSchema {
      // ... 已有模块
      condorauth: {
        user: CondorauthUserSchema;
      };
    }
  }
}
```

这样 `$t('condorauth.user.username')` 就能获得正确的类型推导。

---

## 路由标签自描述模式

每个模块在 `locales/route.ts` 中定义自身的路由标签（菜单名称）。该文件导出一个键值对，键为路由名称，值为对应的翻译文本。

**文件：`locales/route.ts`**

```ts
// zh-CN
const route: App.I18n.Schema['route'] = {
  condorauth: '授权管理',
  condorauth_user: '用户管理'
};
export default route;
```

```ts
// en-US 版本
// locales/route.ts (或通过单独导出方式)
const route: App.I18n.Schema['route'] = {
  condorauth: 'Auth Management',
  condorauth_user: 'User Management'
};
export default route;
```

> 路由键名规则：目录结构用 `_` 连接，如 `condorauth_user`。与 `src/router/elegant/transform.ts` 中 `routeMap` 的路由名称保持一致。

这些路由标签最终会合并到 `src/locales/langs/zh-cn.ts` 的 `route: { ... }` 区块中：

```ts
// src/locales/langs/zh-cn.ts (route 部分)
route: {
  login: '登录',
  home: '控制台',
  system: '系统管理',
  system_admin: '管理员列表',
  condorauth: '授权管理',       // ← 来自模块自描述
  condorauth_user: '用户管理',   // ← 来自模块自描述
  condorbuyback: '回收系统',     // ← 来自模块自描述
  // ...
}
```

---

## pnpm gen-route 自动发现机制

路由通过 `@elegant-router/vue` 自动生成。`pnpm gen-route` 命令会扫描 `src/modules/*/views/` 和 `src/views/` 目录，根据目录结构自动生成：

1. **`src/router/elegant/routes.ts`** — 路由定义（包含 `name`、`path`、`component`、`meta`）
2. **`src/router/elegant/transform.ts`** — 路由映射表（`routeMap`）
3. **`src/router/elegant/imports.ts`** — 页面组件动态导入

路由名称生成规则：
- `src/modules/condorauth/views/user/index.vue` → 路由名 `condorauth_user`
- `src/modules/condorbuyback/views/phone/brand/index.vue` → 路由名 `condorbuyback_phone_brand`
- 路径分隔符 `/` 转换为 `_`，路由名使用 kebab-case

路由路径对应：
- `src/modules/condorauth/views/user/index.vue` → 路径 `/condorauth/user`
- `src/modules/condorbuyback/views/phone/brand/index.vue` → 路径 `/condorbuyback/phone/brand`

> 模块内的 `views/` 目录结构与 `src/views/` 完全一致，`pnpm gen-route` 将其视为同等级来源一并扫描。

### 页面 locale 动态加载

`src/locales/index.ts` 中的 `loadPageLocale()` 函数通过 `import.meta.glob('./condor/**/index.ts')` 动态加载页面级国际化文件。模块的 locale 文件放在 `locales/condor/{plugin-name}/{submodule}/{page}/index.ts` 路径下，与路由路径 `condor/{plugin-name}/{submodule}/{page}` 一一对应，`loadPageLocale()` 会自动根据当前路由 path 匹配加载。

---

## 路由元信息（route meta）

路由的 `i18nKey` 在 `src/router/elegant/routes.ts` 中定义，格式为 `route.{routeName}`。示例：

```ts
{
  name: 'condorauth_user',
  path: '/condorauth/user',
  component: 'view.condorauth_user',
  meta: {
    title: 'condorauth_user',
    i18nKey: 'route.condorauth_user'
  }
}
```

`i18nKey` 对应 `src/locales/langs/zh-cn.ts` 中 `route` 对象的键名，用于菜单和面包屑的国际化显示。

---

## 禁止事项 (Prohibited)

### ❌ 不依赖其他模块

模块之间**不得有直接 import 依赖**。每个模块应当是一个独立的业务域。如果多个模块需要共享逻辑，应提取到 `packages/` 或 `src/shared/` 中。

```ts
// ❌ 禁止: 跨模块 import
import { something } from 'src/modules/condorauth/views/user/config';

// ✅ 允许: 依赖公共包
import { useRequest } from '@sa/hooks';
```

### ❌ 不修改全局状态

模块**不得直接修改 Pinia store 或其他全局状态**。模块只能通过自身的组件、composable 内部管理本地状态。如需扩展全局 Store，应通过 store 模块的扩展机制（如 action/mutation 注册）。

```ts
// ❌ 禁止: 直接修改全局 store
useAuthStore().token = 'xxx';

// ✅ 允许: 在组件内管理局部响应式状态
const localState = ref({});
```

### ❌ 不修改 src/plugins/

`src/plugins/` 是 Vue 应用级插件注册目录。模块**不得向 `src/plugins/` 添加或修改文件**。插件注册仅在应用初始化时由核心维护者管理。

### ❌ 不修改 CondorTable API

模块**不得修改 `CondorTable` 组件或其配置接口 `Condor.Table.Config`**。如有扩展需求，应通过 `CondorTable` 已有的插槽（slot）或事件机制实现，或向核心团队提交 RFC。

### ❌ 不修改 src/views/ 下的现有页面

模块的页面应放在 `src/modules/{plugin-name}/views/` 下，**不得修改 `src/views/` 中的现有页面**。`src/views/` 为核心系统页面。

### ❌ 不修改现有路由文件

**不得手动编辑** `src/router/elegant/routes.ts`、`src/router/elegant/imports.ts` 和 `src/router/elegant/transform.ts`。这些文件由 `pnpm gen-route` 自动生成。

### ❌ 不修改 src/typings/condor/i18n/index.d.ts（各模块类型通过 modules/{module}/types/i18n.d.ts 自动合并）

该文件是全局 PageSchema 注册中心，修改需要核心维护者审批。模块的 `.d.ts` 文件应放在 `types/i18n.d.ts` 中，通过 `declare global` 自动合并。

---

## 关键参考文件

| 参考内容 | 文件路径 |
|---|---|
| CondorTable 页面模式 | `src/views/system/admin/index.vue` |
| 翻译入口文件格式 | `src/locales/condor/condorbuyback/phone/brand/index.ts` |
| 中文翻译文件格式 | `src/locales/condor/condorbuyback/phone/brand/langs/zh-cn.ts` |
| 英文翻译文件格式 | `src/locales/condor/condorbuyback/phone/brand/langs/en-us.ts` |
| 翻译键类型文件 | `src/modules/condorauth/types/i18n/user.d.ts` |
| 全局 PageSchema 注册 | `src/typings/condor/i18n/index.d.ts` |
| 路由标签（主 locale） | `src/locales/langs/zh-cn.ts` 的 `route: {}` 区块 |
| 路由自动生成 | `src/router/elegant/routes.ts` |
| 路由映射表 | `src/router/elegant/transform.ts` |
| 页面 locale 动态加载 | `src/locales/index.ts` 的 `loadPageLocale()` |
| 路由 i18n 守卫 | `src/router/i18n/index.ts` |

---

## API 路径规则

模块中的 API 路径遵循 CondorAdmin 标准规则：

```
/core/{模块前缀}/{模块名}/{方法}
```

- 模块前缀：`admin`（系统管理）、`condorauth`、`buyback`、`common`（通用）
- 模块名用短横线（kebab-case），前端目录下划线 ↔ 后端 API 短横线
- 标准方法：`index`（列表）、`add`（新增）、`edit`（编辑）、`del`（删除）、`multi`（批量）

```ts
urls: {
  index: '/core/condorauth/user/index',
  add: '/core/condorauth/user/add',
  edit: '/core/condorauth/user/edit',
  del: '/core/condorauth/user/del',
  multi: '/core/condorauth/user/multi'
}
```

---

## 开发流程

1. 在 `src/modules/{plugin-name}/views/` 下创建页面组件
2. 在 `src/modules/{plugin-name}/types/i18n/` 下创建翻译键类型文件
3. 模块的 `types/i18n.d.ts` 通过 `declare global` 自动注册到全局 `PageSchema`（无需手动修改 index.d.ts）
4. 在 `src/modules/{plugin-name}/locales/` 下创建翻译文件
5. 在 `src/modules/{plugin-name}/locales/route.ts` 中定义路由标签
6. 运行 `pnpm gen-route` 自动生成路由
7. 运行 `pnpm typecheck && pnpm lint` 验证
