<script lang="ts" setup>
import { computed, ref } from 'vue';
import { request } from '@/service/request';
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
  }>(),
  {
    checkStrategy: 'all',
    defaultExpandAll: true,
    multiple: false,
    checkable: false,
    cascade: false,
    labelField: 'name',
    keyField: 'id',
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
      treeList.value = data.list || data || [];
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
