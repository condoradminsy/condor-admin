import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchGetCaptcha } from '@/service/api';
import { SetupStoreId } from '@/enum';

export const useCaptchaStore = defineStore(SetupStoreId.Captcha, () => {
  const captchaUrl = ref<string | undefined>('');

  async function getCaptcha() {
    const res = await fetchGetCaptcha();
    captchaUrl.value = res.data?.captcha;
  }

  return {
    captchaUrl,
    getCaptcha
  };
});
