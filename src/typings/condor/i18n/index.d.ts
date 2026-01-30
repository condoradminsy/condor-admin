import type { SystemAdminSchema } from './system/admin';
import type { SystemAdminLogSchema } from './system/adminLog';
import type { SystemLoginLogSchema } from './system/loginLog';
import type { SystemMenuSchema } from './system/menu';
import type { SystemRoleSchema } from './system/role';
import type { SystemTestSchema } from './system/test';
import type { SystemDictTypeSchema } from './system/dictType';
import type { SystemConfigSchema } from './system/config';
import type { SystemCrontabSchema } from './system/crontab';
import type { SystemAttachmentSchema } from './system/attachment';

declare global {
  namespace App.I18n {
    interface $T {
      (key: FullI18nKey): string;
    }
    interface PageSchema {
      system: {
        admin: SystemAdminSchema;
        'admin-log': SystemAdminLogSchema;
        'login-log': SystemLoginLogSchema;
        menu: SystemMenuSchema;
        role: SystemRoleSchema;
        test: SystemTestSchema;
        'dict-type': SystemDictTypeSchema;
        config: SystemConfigSchema;
        crontab: SystemCrontabSchema;
        attachment: SystemAttachmentSchema;
      };
    }
  }
}

export {};
