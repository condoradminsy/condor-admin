<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useCondorStore } from '@/store/modules/condor';
import { getValueByLocale } from '@/locales';
defineOptions({
  name: 'CondorDictRadio'
});
const condorStore = useCondorStore();

const dictCache = new Map<string, MappedDictItem[]>();

/**
 * Props
 * - `value` 允许为空以兼容未设置情形
 */
const props = withDefaults(
  defineProps<{
    code: string;
    value?: string | number | null;
    type?: 'number' | 'string';
  }>(),
  {
    type: 'string',
    value: null
  }
);

const emit = defineEmits<{
  (e: 'update:value', value: string | number | null | undefined): void;
}>();

/**
 * v-model binding wrapper — 将 props.value 映射成正确的类型并在 set 时发出更新
 * 使用 computed 缓存转换结果，避免在模板中重复计算
 */
const value = computed<string | number | null | undefined>({
  get() {
    const v = props.value;
    if (v === null || v === undefined) return v;
    return props.type === 'number' ? Number(v) : `${v}`;
  },
  set(val: string | number | null | undefined) {
    emit('update:value', val);
  }
});

type RawDictItem = { id?: string | number; label: any; value: any };
type MappedDictItem = { id?: string | number; label: string; value: string | number };

/**
 * 以 code 为键从 store 中取出原始列表并映射为组件需要的项
 */
const dictList = computed<MappedDictItem[]>(() => {
  const key = `${props.code}-${props.type}`;
  if (dictCache.has(key)) return dictCache.get(key)!;
  const raw = (condorStore.dictData?.[props.code] as RawDictItem[]) || [];
  const mapped = raw.map(item => ({
    id: item.id,
    label: getValueByLocale(item.label),
    value: props.type === 'number' ? Number(item.value) : `${item.value}`
  }));
  dictCache.set(key, mapped);
  return mapped;
});

// 清空缓存当字典数据改变
watch(
  () => condorStore.dictData,
  () => {
    dictCache.clear();
  },
  { deep: true }
);
</script>

<template>
  <NRadioGroup v-model:value="value">
    <NRadio v-for="item in dictList" :key="item.id" :value="item.value" :label="item.label"></NRadio>
  </NRadioGroup>
</template>
