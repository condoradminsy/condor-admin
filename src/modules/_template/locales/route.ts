/**
 * 模块路由标签自描述
 *
 * 键名规则：目录结构用 `_` 连接，如 `plugin_demo`
 * 与 src/router/elegant/transform.ts 中 routeMap 的路由名称保持一致
 *
 * 参考：src/modules/condorauth/locales/route.ts
 */
const routeLabels: Record<string, { 'zh-CN': string; 'en-US': string }> = {
  '{plugin}': { 'zh-CN': '模块名称', 'en-US': 'Module Name' },
  '{plugin}_{page}': { 'zh-CN': '页面名称', 'en-US': 'Page Name' }
};

export default routeLabels;
