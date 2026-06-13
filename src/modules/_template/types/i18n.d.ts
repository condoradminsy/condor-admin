export {}; // Makes this a module (required for augmentation)

declare global {
  namespace App.I18n {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
    interface PageSchema {
      /**
       * Plugin modules add their schema here via interface merging.
       * Each plugin creates its own types/i18n.d.ts with its module subtree.
       *
       * TypeScript interface merging automatically combines all
       * App.I18n.PageSchema declarations across the codebase.
       * FullI18nKey = GetI18nKey<Schema & PageSchema> picks up
       * all augmentations.
       */
    }
  }
}
