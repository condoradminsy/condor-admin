<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useCondorStore } from '@/store/modules/condor';
import { getValueByLocale } from '@/locales';
defineOptions({
  name: 'CondorDictSelect'
});
const condorStore = useCondorStore();

const dictCache = new Map<string, MappedDictItem[]>();

const props = withDefaults(
  defineProps<{
    code: string;
    value?: string | number | Array<string | number> | null;
    type?: 'number' | 'string';
    multiple?: boolean;
    format?: 'string' | 'array';
    clearable?: boolean;
  }>(),
  {
    type: 'string',
    multiple: false,
    format: 'string',
    clearable: true,
    value: null
  }
);

const emit = defineEmits<{
  (e: 'update:value', value: string | number | Array<string | number> | null | undefined): void;
}>();

type RawDictItem = { id?: string | number; label: any; value: any };
type MappedDictItem = { label: string; value: string | number };

/**
 * v-model wrapper: 将外部传入的 props.value 转换为 NSelect 期望的类型
 * - 单选返回 string|number
 * - 多选返回数组
 */
const value = computed<string | number | Array<string | number> | null | undefined>({
  get() {
    const v = props.value;
    if (v === null || v === undefined) return v;
    if (props.multiple) {
      if (typeof v === 'string') {
        if (!v) return [];
        return v.split(',').map(item => (props.type === 'number' ? Number(item) : item));
      }
      if (Array.isArray(v)) {
        return v.map(item => (props.type === 'number' ? Number(item) : `${item}`));
      }
      return [];
    }
    return props.type === 'number' ? Number(v) : `${v}`;
  },
  set(val: string | number | Array<string | number> | null | undefined) {
    if (props.multiple) {
      const arr = Array.isArray(val) ? val : [];
      if (props.format === 'string') {
        emit('update:value', arr.join(','));
      } else {
        emit('update:value', arr);
      }
    } else {
      emit('update:value', val);
    }
  }
});

/** 映射字典数据供 NSelect 使用（缓存计算） */
const dictList = computed<MappedDictItem[]>(() => {
  const key = `${props.code}-${props.type}`;
  if (dictCache.has(key)) return dictCache.get(key)!;
  const raw = (condorStore.dictData?.[props.code] as RawDictItem[]) || [];
  const mapped = raw.map(item => ({
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
  <NSelect v-model:value="value" :multiple="props.multiple" :options="dictList" :clearable="props.clearable" />
</template>
