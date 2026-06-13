export {};

declare global {
  namespace App.I18n {
    interface PageSchema {
      condorauth: {
        user: import('./i18n/user').CondorauthUserSchema;
      };
    }
  }
}
