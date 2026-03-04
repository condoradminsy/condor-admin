import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchGetConfig, fetchGetDict } from '@/service/api/condor';
import { SetupStoreId } from '@/enum';

export const useCondorStore = defineStore(SetupStoreId.Condor, () => {
  // 数据字典
  const dictData = ref<any>({});
  // 数据字典加载状态
  const status = ref(false);
  // 语言
  const languages = ref<any>([]);
  // 初始化
  function initDict() {
    fetchGetDict().then(({ error, data }) => {
      if (!error) {
        dictData.value = data.reduce((acc: any, cur: any) => {
          acc[cur.name] = cur.dict_data;
          return acc;
        }, {});
        status.value = true;
      }
    });
  }

  fetchGetConfig().then(({ error, data }) => {
    if (!error) {
      languages.value = data.languages;
    }
  });

  return {
    dictData,
    status,
    initDict,
    languages
  };
});
