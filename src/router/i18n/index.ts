import type { Router } from 'vue-router';
import { loadPageLocale } from '@/locales';

export function createI18nGuard(router: Router) {
  router.beforeEach(async (_to, _from, next) => {
    await loadPageLocale(_to.path);
    next();
  });
}
