import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import JSEncrypt from 'jsencrypt';
import { fetchGetCaptcha, fetchGetPublicKey, fetchGetUserInfo, fetchLogin } from '@/service/api';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t } from '@/locales';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref(getToken());

  const captchaUrl = ref<string | undefined>('');

  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    username: '',
    roles: [],
    buttons: []
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();

    clearAuthStorage();

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
    getCaptcha();
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (!lastLoginUserId || lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      localStg.remove('lastLoginUserId');
      return true;
    }

    localStg.remove('lastLoginUserId');
    return false;
  }

  /**
   * Login
   *
   * @param username User name
   * @param password Password
   * @param captcha captcha
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(param: Api.Auth.LoginParams, redirect = true) {
    startLoading();
    const { data, error: publicKeyError } = await fetchGetPublicKey();
    if (publicKeyError) {
      endLoading();
      window.$notification?.error({
        title: 'get public key error',
        content: 'failed to get public key from server',
        duration: 4500
      });
      return;
    }
    const jse = new JSEncrypt();
    jse.setPublicKey(data.publicKey); // 确保包含 -----BEGIN PUBLIC KEY----- ... -----
    const encryptedBase64 = jse.encrypt(param.password);
    if (!encryptedBase64) {
      endLoading();
      window.$notification?.error({
        title: 'encryption error',
        content: 'password encryption failed',
        duration: 4500
      });
      return;
    }
    const { data: loginToken, error } = await fetchLogin({ ...param, password: encryptedBase64 });
    if (!error) {
      const pass = await loginByToken(loginToken);

      if (pass) {
        // Check if the tab needs to be cleared
        const isClear = checkTabClear();
        let needRedirect = redirect;

        if (isClear) {
          // If the tab needs to be cleared,it means we don't need to redirect.
          needRedirect = false;
        }
        await redirectFromLogin(needRedirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { username: userInfo.username }),
          duration: 4500
        });
      }
    } else {
      resetStore();
    }

    endLoading();
  }

  async function loginByToken(loginToken: Api.Auth.LoginToken) {
    // 1. stored in the localStorage, the later requests need it in headers
    localStg.set('token', loginToken.access_token);
    localStg.set('refreshToken', loginToken.refresh_token);

    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      token.value = loginToken.access_token;

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data: info, error } = await fetchGetUserInfo();

    if (!error) {
      // update store
      Object.assign(userInfo, info);

      return true;
    }

    return false;
  }

  async function initUserInfo() {
    const hasToken = getToken();

    if (hasToken) {
      const pass = await getUserInfo();

      if (!pass) {
        resetStore();
      }
    }
  }

  async function getCaptcha() {
    const res = await fetchGetCaptcha();
    captchaUrl.value = res.data?.captcha;
  }

  // 权限判断
  const hasPermission = (permission: string | string[] | undefined) => {
    if (!permission) {
      return true;
    }
    if (!userInfo.buttons || !userInfo.buttons.length) {
      return false;
    }
    if (userInfo.buttons.includes('*')) {
      return true;
    }
    if (Array.isArray(permission)) {
      return permission.every(item => userInfo.buttons.includes(item));
    }
    return userInfo.buttons.includes(permission);
  };

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo,
    captchaUrl,
    getCaptcha,
    hasPermission
  };
});
