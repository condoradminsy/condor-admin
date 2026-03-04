<script lang="ts" setup>
import { computed } from 'vue';
import { useCondorStore } from '@/store/modules/condor';
import { getValueByLocale } from '@/locales';
defineOptions({
  name: 'CondorDictCheckbox'
});
const condorStore = useCondorStore();

const props = withDefaults(
  defineProps<{
    code: string;
    value?: string | Array<string | number> | null;
    type?: 'number' | 'string';
    format?: 'string' | 'array';
  }>(),
  {
    type: 'string',
    format: 'string',
    value: null
  }
);

const emit = defineEmits<{
  (e: 'update:value', value: string | Array<string | number> | null | undefined): void;
}>();

type RawDictItem = { id?: string | number; label: any; value: any };
type MappedDictItem = { id?: string | number; label: string; value: string | number };

/**
 * v-model wrapper: 将外部传入的 props.value 转换为 NCheckboxGroup 期望的类型
 * 返回数组
 */
const value = computed<Array<string | number> | null | undefined>({
  get() {
    const v = props.value;
    if (v === null || v === undefined) return v;
    if (typeof v === 'string') {
      if (!v) return [];
      return v.split(',').map(item => (props.type === 'number' ? Number(item) : item));
    }
    if (Array.isArray(v)) {
      return v.map(item => (props.type === 'number' ? Number(item) : `${item}`));
    }
    return [];
  },
  set(val: string | number | Array<string | number> | null | undefined) {
    const arr = Array.isArray(val) ? val : [];
    if (props.format === 'string') {
      emit('update:value', arr.join(','));
    } else {
      emit('update:value', arr);
    }
  }
});

/** 映射字典数据供 NCheckboxGroup 使用（缓存计算） */
const dictList = computed<MappedDictItem[]>(() => {
  const raw = (condorStore.dictData?.[props.code] as RawDictItem[]) || [];
  return raw.map(item => ({
    id: item.id,
    label: getValueByLocale(item.label),
    value: props.type === 'number' ? Number(item.value) : `${item.value}`
  }));
});
</script>

<template>
  <NCheckboxGroup v-model:value="value">
    <NCheckbox v-for="item in dictList" :key="item.id" :value="item.value" :label="item.label"></NCheckbox>
  </NCheckboxGroup>
</template>
