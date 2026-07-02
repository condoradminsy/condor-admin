# CondorAdmin 模块开发指南

`src/modules/` 是 CondorAdmin 的模块（插件）目录。每个模块是一个独立的业务域，**以目录存在即启用**，不涉及运行时注册中心或动态加载。模块仅作为**目录约定 + 构建时合并**的静态分层机制。

## 📋 目录结构

```
src/modules/{plugin-name}/
├── {page-1}/index.vue          # 页面（扁平放置，不加 views/ 子目录）
├── {page-2}/index.vue
├── locales/
│   ├── route.ts                 # 路由标签（中英文菜单名）
│   └── condor/{plugin-name}/
│       └── {page-1}/
│           ├── index.ts         # 入口：导出 { 'zh-CN': zhCn, 'en-US': enUs }
│           └── langs/
│               ├── zh-cn.ts     # 中文翻译
│               └── en-us.ts     # 英文翻译
└── types/
    ├── i18n.d.ts                # PageSchema 全局注册（declare global）
    └── i18n/{page}.d.ts         # 翻译键类型接口
```

### 命名规范

| 元素 | 规范 | 示例 |
|------|------|------|
| 模块目录名 | kebab-case | `condorsupport` |
| 页面目录名 | kebab-case（避免下划线） | `ai-config`（不用 `ai_config`） |
| 前端路由名 | snake_case | `condorsupport_ai-config` |
| 后端 API 路径 | snake_case | `/core/condorsupport/ai-config/index` |

---

## 🚀 快速开始

### 步骤 1：创建页面文件

**位置**：`src/modules/{plugin-name}/{page}/index.vue`

使用 `CondorTable` 配置模式：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  multilingualFields: ['name', 'description'], // 若使用的是多语言基类，需配置多语言字段
  urls: {
    index: '/core/{module}/{name}/index',
    add: '/core/{module}/{name}/add',
    edit: '/core/{module}/{name}/edit',
    del: '/core/{module}/{name}/del',
    multi: '/core/{module}/{name}/multi'
  },
  rowKey(row) { return row.id; },
  columns: [
    { type: 'selection', key: 'id', title: 'ID' },
    {
      key: 'username',
      title() { return $t('{plugin}.{page}.username'); },
      operator: 'like',
      rules: [{ required: true, trigger: 'blur', message: $t('{plugin}.{page}.username_required') }]
    },
    {
      key: 'status',
      title() { return $t('condor.common.status'); },
      value: 1,
      operator: '=',
      component: {
        name: 'n-switch',
        props: { checkedValue: 1, uncheckedValue: 0 }
      }
    },
    {
      key: 'createtime',
      title() { return $t('condor.common.createtime'); },
      form: false,
      operator: false,
      render: 'datetime'
    },
    {
      type: 'operate',
      title() { return $t('common.operate'); },
      width: 120,
      buttons: ['edit', 'del']
    }
  ]
});
</script>

<template>
  <div><CondorTable :config="config" /></div>
</template>
```

**只读页面**（仅查看，无 CRUD）：
- `urls` 只配置 `index`
- 不添加 `type: 'operate'` 列
- 任何有关消息提示的要做国际化处理

---

### 步骤 2：创建类型定义

#### 2.1 翻译键类型文件

**位置**：`types/i18n/{page}.d.ts`

```typescript
export interface CondorsupportAgentSchema {
  username: string;
  email: string;
  status: string;
  createtime: string;
  // ... 每个字段一个键，值类型固定为 string
}
```

#### 2.2 PageSchema 注册

**位置**：`types/i18n.d.ts`

```typescript
import type { CondorsupportAgentSchema } from './i18n/agent';
import type { CondorsupportCustomerSchema } from './i18n/customer';

declare global {
  namespace App.I18n {
    interface PageSchema {
      condorsupport: {
        agent: CondorsupportAgentSchema;
        customer: CondorsupportCustomerSchema;
        // ... 其他页面
      };
    }
  }
}

export {};
```

> **自动合并**：通过 `declare global` 自动注册到全局 `App.I18n.PageSchema`，无需修改 `src/typings/condor/i18n/index.d.ts`

---

### 步骤 3：创建翻译文件

#### 3.1 翻译入口

**位置**：`locales/condor/{plugin}/{page}/index.ts`

```typescript
import zhCn from './langs/zh-cn';
import enUs from './langs/en-us';
export default { 'zh-CN': zhCn, 'en-US': enUs };
```

#### 3.2 中文翻译

**位置**：`locales/condor/{plugin}/{page}/langs/zh-cn.ts`

```typescript
import type { CondorsupportAgentSchema } from '@/modules/condorsupport/types/i18n/agent';

const local: CondorsupportAgentSchema = {
  username: '用户名',
  email: '邮箱',
  status: '状态',
  createtime: '创建时间'
};
export default local;
```

#### 3.3 英文翻译

**位置**：`locales/condor/{plugin}/{page}/langs/en-us.ts`

```typescript
import type { CondorsupportAgentSchema } from '@/modules/condorsupport/types/i18n/agent';

const local: CondorsupportAgentSchema = {
  username: 'Username',
  email: 'Email',
  status: 'Status',
  createtime: 'Create Time'
};
export default local;
```

---

### 步骤 4：配置路由标签

**位置**：`locales/route.ts`

```typescript
const routeLabels: Record<string, { 'zh-CN': string; 'en-US': string }> = {
  condorsupport: { 'zh-CN': '客服系统', 'en-US': 'Support' },
  condorsupport_agent: { 'zh-CN': '坐席管理', 'en-US': 'Agents' },
  condorsupport_customer: { 'zh-CN': '客户管理', 'en-US': 'Customers' },
  'condorsupport_ai-config': { 'zh-CN': 'AI配置', 'en-US': 'AI Config' }
};
export default routeLabels;
```

**键名规则**：
- 使用路由名称（`_` 连接）
- 如果页面目录名用短横线（如 `ai-config`），路由名也用短横线：`condorsupport_ai-config`

---

### 步骤 5：生成路由

```bash
pnpm gen-route    # 自动扫描模块目录生成路由
pnpm typecheck    # 类型检查
pnpm lint         # 代码检查
```

**自动生成的文件**（不要手动编辑）：
- `src/router/elegant/routes.ts` — 路由定义
- `src/router/elegant/imports.ts` — 组件导入
- `src/router/elegant/transform.ts` — 路由映射表
- `src/typings/elegant-router.d.ts` — 路由类型

`@elegant-router/vue` 使用 `_` 作为层级分隔符，所以路由名称多个单词使用短横线（`-`），没有特殊说明，不要使用 `_`

---

## 📡 API 路径规则

后端 API 路径格式：`/core/{模块前缀}/{模块名}/{方法}`

| 要素 | 规则 | 示例 |
|------|------|------|
| 模块前缀 | 后端插件名 | `condorsupport` |
| 模块名 | kebab-case | `quick-reply` → `/core/condorsupport/quick-reply/index` |
| 标准方法 | index/add/edit/del/multi | — |

**示例**：

```typescript
urls: {
  index: '/core/condorsupport/agent/index',
  add: '/core/condorsupport/agent/add',
  edit: '/core/condorsupport/agent/edit',
  del: '/core/condorsupport/agent/del',
  multi: '/core/condorsupport/agent/multi'
}
```

---

## 🗄️ SQL 菜单规则

### 菜单结构

```
主菜单（pid=NULL, menu_type=1）
├── 页面1（pid=主菜单ID, menu_type=1）
│   ├── 查看按钮（pid=页面ID, menu_type=0, is_keep=1）
│   ├── 添加按钮（pid=页面ID, menu_type=0, is_keep=1）
│   ├── 编辑按钮（pid=页面ID, menu_type=0, is_keep=1）
│   ├── 删除按钮（pid=页面ID, menu_type=0, is_keep=1）
│   └── 批量操作按钮（pid=页面ID, menu_type=0, is_keep=1）
└── 页面2（pid=主菜单ID, menu_type=1）
    └── ... 权限按钮
```

### SQL 模板

```sql
INSERT INTO `con_system_menu_rule`
(`id`, `is_keep`, `pid`, `name`, `title`, `icon`, `path`, `component`, `i18nkey`, `menu_type`, `weigh`, `status`, `createtime`, `updatetime`)
VALUES

-- 1. 主菜单
(1000, NULL, NULL, 'condorsupport', '客服系统', 'material-symbols:support-agent', '/condorsupport', 'layout.base', 'route.condorsupport', 1, 100, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

-- 2. 页面菜单
(1001, NULL, 1000, 'condorsupport_agent', '坐席管理', '', '/condorsupport/agent', 'view.condorsupport_agent', 'route.condorsupport_agent', 1, 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),

-- 3. 权限按钮
(1002, 1, 1001, 'core_agent_index', '查看', '', '/core/condorsupport/agent/index', NULL, 'condor.route.view', 0, 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1003, 1, 1001, 'core_agent_add', '添加', '', '/core/condorsupport/agent/add', NULL, 'condor.route.add', 0, 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1004, 1, 1001, 'core_agent_edit', '编辑', '', '/core/condorsupport/agent/edit', NULL, 'condor.route.edit', 0, 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1005, 1, 1001, 'core_agent_del', '删除', '', '/core/condorsupport/agent/del', NULL, 'condor.route.delete', 0, 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1006, 1, 1001, 'core_agent_multi', '批量操作', '', '/core/condorsupport/agent/multi', NULL, 'condor.route.bulk_actions', 0, 0, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `id` | 自增主键，按顺序分配 |
| `pid` | 父级 ID。主菜单为 NULL，页面菜单 pid=主菜单 ID，按钮 pid=页面 ID |
| `name` | 权限标识。**页面**用路由名，**按钮**用 `core_{模块名}_{方法}` |
| `title` | 显示标题（中文），i18n 查找失败时作为 fallback |
| `icon` | 仅主菜单需要图标，页面和按钮为空 |
| `path` | **页面**：前端路由路径；**按钮**：后端 API 路径 |
| `component` | **主菜单**：`layout.base`；**页面**：`view.{路由名}`；**按钮**：NULL |
| `i18nkey` | 页面用 `route.{路由名}`，按钮用 `condor.route.{操作}` |
| `menu_type` | 1=菜单/目录，0=按钮/权限 |
| `is_keep` | 按钮为 1（保留），菜单为 NULL |
| `weigh` | 排序权重（越小越靠前） |
| `status` | 1=启用 |

**只读页面**：只生成 `_index` 一个按钮，不加增删改批量

---

## 🚫 禁止事项

### ❌ 不依赖其他模块

模块之间**不得有直接 import 依赖**。如需共享逻辑，提取到 `packages/` 或 `src/shared/`。

```typescript
// ❌ 禁止: 跨模块 import
import { something } from 'src/modules/condorauth/user/config';

// ✅ 允许: 依赖公共包
import { useRequest } from '@sa/hooks';
```

### ❌ 不修改全局状态

模块**不得直接修改 Pinia store**。只能通过 action/mutation。

```typescript
// ❌ 禁止
useAuthStore().token = 'xxx';

// ✅ 允许
const localState = ref({});
```

### ❌ 不修改以下目录/文件

- `src/plugins/` — 插件注册目录
- `src/views/` — 核心系统页面
- `src/router/elegant/routes.ts` — 自动生成，不可手动编辑
- `src/router/elegant/imports.ts` — 自动生成，不可手动编辑
- `src/router/elegant/transform.ts` — 自动生成，不可手动编辑
- `src/typings/condor/i18n/index.d.ts` — 全局 PageSchema（模块通过 declare global 自动合并）
- `CondorTable` 组件及其配置接口

---

## 📚 完整开发流程

```
1. 创建模块目录结构
   ├── types/i18n.d.ts          ← PageSchema 注册
   ├── types/i18n/{page}.d.ts   ← 每个页面一个类型
   ├── locales/route.ts         ← 路由标签
   └── locales/condor/{plugin}/{page}/  ← 翻译文件

2. 创建页面文件 {page}/index.vue（CondorTable 配置）

3. 如果页面名包含下划线（如 ai_config）
   → 目录改为短横线 ai-config
   → 同步更新 locales/route.ts 和翻译目录名

4. 生成路由 + 验证
   pnpm gen-route && pnpm typecheck && pnpm lint

5. 生成 SQL 菜单规则
   → 1 条主菜单（pid=NULL, menu_type=1）
   → N 条页面菜单（pid=主菜单ID, menu_type=1）
   → 每个页面 5 个按钮（或只读页面 1 个按钮）
```

---

## 🔍 参考示例

| 参考内容 | 路径 |
|----------|------|
| 完整模块示例 | `src/modules/condorsupport/` |
| CondorTable 页面模板 | `src/modules/condorauth/user/index.vue` |
| 类型定义示例 | `src/modules/condorsupport/types/i18n/agent.d.ts` |
| PageSchema 注册示例 | `src/modules/condorsupport/types/i18n.d.ts` |
| 翻译文件示例 | `src/modules/condorsupport/locales/condor/condorsupport/agent/` |
| 路由标签示例 | `src/modules/condorsupport/locales/route.ts` |

---

## 📝 CondorTable 列配置速查

| 功能 | 配置示例 |
|------|----------|
| 搜索列（模糊） | `operator: 'like'` |
| 搜索列（精确） | `operator: '='` |
| 只读列 | `form: false` |
| 表单隐藏列 | `visible: false` |
| 状态开关 | `component: { name: 'n-switch', props: { checkedValue: 1, uncheckedValue: 0 } }` |
| 字典选择器 | `component: { name: 'condor-dict-radio', props: { code: 'dict_key' } }` |
| 时间列 | `render: 'datetime'` |
| 关联选择器 | `component: { name: 'condor-select', props: { url: 'core/xxx/selectpage' } }` |
| 树形选择器 | `component: { name: 'condor-tree-select', props: { url: 'core/role/selectpage', checkable: true } }` |
| 富文本编辑器 | `component: { name: 'condor-editor' }` |
| 图片列 | `render: 'image'` 或 `component: { name: 'condor-upload', props: { type: 'image' } }` |
| 操作列 | `type: 'operate', buttons: ['edit', 'del']` |
| 表单校验 | `rules: [{ required: true, trigger: 'blur', message: '必填' }]` |
