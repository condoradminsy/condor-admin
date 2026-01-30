import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { localStg } from '@/utils/storage';
import messages from './locale';

const i18n = createI18n({
  locale: localStg.get('lang') || 'zh-CN',
  fallbackLocale: 'en',
  messages,
  legacy: false
});

/**
 * Setup plugin i18n
 *
 * @param app
 */
export function setupI18n(app: App) {
  app.use(i18n);
}

export const $t = i18n.global.t as App.I18n.$T;

export function setLocale(locale: App.I18n.LangType) {
  i18n.global.locale.value = locale;
}

export function getLocale(): App.I18n.LangType {
  return i18n.global.locale.value as App.I18n.LangType;
}

const loaded = new Set<string>();

// 加载页面国际化
export async function loadPageLocale(page: string) {
  try {
    if (!page) return;
    const str = page.replace(/^\/+|\/+$/g, '');
    if (loaded.has(str)) return;
    const modules = import.meta.glob<{ default: Record<string, any> }>('./condor/**/index.ts');
    const loader = modules[`./condor/${str}/index.ts`];
    if (!loader) return;
    const condorMessages = await loader();
    if (!condorMessages) return;
    Object.keys(condorMessages.default).forEach(key => {
      const messageData = condorMessages.default[key];
      // 根据 page 的路径构建嵌套结构
      const pathParts = str.split('/');
      // 从内向外构建嵌套对象
      let currentLevel = {};
      // 构建嵌套结构
      for (let i = pathParts.length - 1; i >= 0; i -= 1) {
        if (i === pathParts.length - 1) {
          // 最内层
          currentLevel = { [pathParts[i]]: messageData };
        } else {
          currentLevel = { [pathParts[i]]: currentLevel };
        }
      }
      // 合并到 i18n
      i18n.global.mergeLocaleMessage(key, currentLevel);
    });
    loaded.add(str);
  } catch {}
}
