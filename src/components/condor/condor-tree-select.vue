<script lang="ts" setup>
import { computed, ref } from 'vue';
import { request } from '@/service/request';
import { $t, getValueByLocale } from '@/locales';
defineOptions({
  name: 'CondorTreeSelect'
});
const props = withDefaults(
  defineProps<{
    value: any;
    url: string;
    checkStrategy?: 'all' | 'parent' | 'child';
    defaultExpandAll?: boolean;
    multiple?: boolean;
    checkable?: boolean;
    cascade?: boolean;
    labelField?: string;
    keyField?: string;
    param?: any;
    i18nkey?: boolean;
  }>(),
  {
    checkStrategy: 'all',
    defaultExpandAll: true,
    multiple: false,
    checkable: false,
    cascade: false,
    labelField: 'name',
    keyField: 'id',
    i18nkey: false,
    param: () => ({})
  }
);
const treeList = ref([]);
const emit = defineEmits<{
  (e: 'update:value', value: any): void;
}>();
const value = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('update:value', val);
  }
});
const getData = () => {
  request({
    url: props.url,
    method: 'post',
    data: {
      ...props.param
    }
  }).then(({ error, data }) => {
    if (!error) {
      // i18nkey 为true时，将name字段翻译
      const renderI18nKey = (list: any[]) => {
        list.forEach(item => {
          if (item.i18nkey) {
            item[props.labelField] = $t(item.i18nkey);
          } else if (typeof item[props.labelField] !== 'string') {
            item[props.labelField] = getValueByLocale(item[props.labelField]);
          }
          if (item.children) {
            renderI18nKey(item.children);
          }
        });
        return list;
      };
      const list = data.list || data || [];
      treeList.value = props.i18nkey ? renderI18nKey(list) : list;
    }
  });
};
getData();
</script>

<template>
  <NTreeSelect
    v-model:value="value"
    clearable
    :check-strategy="props.checkStrategy"
    :default-expand-all="props.defaultExpandAll"
    :multiple="props.multiple"
    :options="treeList"
    :checkable="props.checkable"
    :cascade="props.cascade"
    :key-field="props.keyField"
    :label-field="props.labelField"
  ></NTreeSelect>
</template>
