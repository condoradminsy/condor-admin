import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchGetDict } from '@/service/api/dict';
import { SetupStoreId } from '@/enum';

export const useDictStore = defineStore(SetupStoreId.Dict, () => {
  const dictData = ref<any>({});

  function init() {
    fetchGetDict().then(({ error, data }) => {
      if (!error) {
        dictData.value = data.reduce((acc: any, cur: any) => {
          acc[cur.name] = cur.dict_data;
          return acc;
        }, {});
      }
    });
  }

  return {
    dictData,
    init
  };
});
