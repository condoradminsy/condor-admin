<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
defineOptions({
  name: 'CondorTableList'
});
const props = withDefaults(
  defineProps<{
    columns: any;
    data?: any;
    pagination: any;
    defaultExpandAll?: boolean;
    rowKey?: (e: any) => string;
  }>(),
  {
    data: () => [],
    defaultExpandAll: true,
    rowKey: () => ''
  }
);
const emit = defineEmits<{
  (e: 'update:page', page: number): void;
  (e: 'update:page-size', pageSize: number): void;
  (e: 'update:checked-row-keys', checked: any): void;
}>();

const checkeds = ref<any>({});
const expanded = ref<Record<string, boolean>>({});

const getKey = (item: any, path: number[]) => {
  return typeof props.rowKey === 'function' ? String(props.rowKey(item)) : path.join('-');
};

// 初始化展开状态
const initExpanded = (list: any[], path: number[] = []) => {
  if (!Array.isArray(list)) return;
  list.forEach((it, idx) => {
    const curPath = [...path, idx];
    const key = getKey(it, curPath);
    if (Array.isArray(it.children) && it.children.length) {
      if (expanded.value[key] === undefined) expanded.value[key] = props.defaultExpandAll;
      initExpanded(it.children, curPath);
    }
  });
};
initExpanded(props.data || []);

// 将树形数据扁平化为可见项（受 expanded 控制）
const visibleData = computed(() => {
  const res: Array<{ item: any; level: number; path: number[]; key: string }> = [];
  function walk(list: any[], level: number, path: number[]) {
    if (!Array.isArray(list)) return;
    list.forEach((it, idx) => {
      const curPath = [...path, idx];
      const key = getKey(it, curPath);
      res.push({ item: it, level, path: curPath, key });
      if (Array.isArray(it.children) && it.children.length && expanded.value[key]) {
        walk(it.children, level + 1, curPath);
      }
    });
  }
  walk(props.data || [], 0, []);
  return res;
});

const toggleExpand = (key: string) => {
  expanded.value[key] = !expanded.value[key];
};
watch(
  () => checkeds.value,
  () => {
    emit(
      'update:checked-row-keys',
      Object.keys(checkeds.value).filter(v => checkeds.value[v])
    );
  },
  {
    deep: true
  }
);
const handleCurrentChange = (page: number) => {
  emit('update:page', page);
};

const handleSizeChange = (pageSize: number) => {
  emit('update:page-size', pageSize);
};
</script>

<template>
  <div v-for="entry in visibleData" :key="entry.key" class="condor-row">
    <div v-for="(row, colIndex) in props.columns" :key="colIndex">
      <div
        v-if="row.visible !== false && row.type !== 'operate'"
        class="condor-col"
        :style="{ paddingLeft: entry.level * 16 + 'px' }"
      >
        <div class="w-[30px]">
          <template v-if="colIndex === 0">
            <div
              v-if="Array.isArray(entry.item.children) && entry.item.children.length"
              class="ml-[-2px] cursor-pointer"
              @click.prevent="toggleExpand(entry.key)"
            >
              <icon-fluent-subtract-square-24-regular v-if="expanded[entry.key]" class="text-[22px]" />
              <icon-fluent-add-square-24-regular v-else class="text-[22px]" />
            </div>
            <NCheckbox
              v-else
              v-model:checked="checkeds[entry.key]"
              :disabled="typeof row.disabled === 'function' ? row.disabled(entry.item) : false"
            ></NCheckbox>
          </template>
          <template v-if="Array.isArray(entry.item.children) && entry.item.children.length && colIndex === 1">
            <NCheckbox
              v-model:checked="checkeds[entry.key]"
              :disabled="typeof row.disabled === 'function' ? row.disabled(entry.item) : false"
            ></NCheckbox>
          </template>
        </div>
        <div class="title">
          <CondorVNode v-if="typeof row.title === 'function'" :row="entry.item" :render="row.title" />
          <span v-else>{{ row.title }}</span>
        </div>
        <div>
          <CondorVNode v-if="typeof row.render === 'function'" :row="entry.item" :render="row.render" />
          <span v-else>{{ entry.item[row.key] }}</span>
        </div>
      </div>
      <div v-else-if="row.type == 'operate'" class="condor-col" :style="{ paddingLeft: entry.level * 16 + 'px' }">
        <div class="w-[30px]"></div>
        <div class="title">{{ $t('condor.Operation') }}</div>
        <CondorVNode v-if="typeof row.render === 'function'" :row="entry.item" :render="row.render" />
      </div>
    </div>
  </div>
  <div v-if="props.pagination !== false" class="mt-4 flex justify-end">
    <NPagination v-bind="props.pagination" @update:page="handleCurrentChange" @update-page-size="handleSizeChange" />
  </div>
</template>

<style lang="scss" scoped>
.condor-row {
  padding: 10px;
  &:nth-child(odd) {
    background-color: #f9f9f9;
  }
}
.condor-col {
  display: flex;
  padding: 2px 0;
  .title {
    font-weight: 700;
    display: inline-block;
    min-width: 16%;
    text-align: left;
  }
}
</style>
