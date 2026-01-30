declare global {
  namespace App.I18n {
    /** 最终参与 key 推导的 Schema */
    type FullSchema = Schema & PageSchema;

    /** 新的 i18n key（包含动态页面） */
    type FullI18nKey = GetI18nKey<FullSchema>;
  }
}

export {};
