<script lang="ts" setup>
import { computed } from 'vue';
import { useDictStore } from '@/store/modules/dict';

const dictStore = useDictStore();

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

type RawDictItem = { id?: string | number; label: string; value: any };
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
  const raw = (dictStore.dictData?.[props.code] as RawDictItem[]) || [];
  return raw.map(item => ({
    label: item.label,
    value: props.type === 'number' ? Number(item.value) : `${item.value}`
  }));
});
</script>

<template>
  <NSelect v-model:value="value" :multiple="props.multiple" :options="dictList" :clearable="props.clearable" />
</template>
