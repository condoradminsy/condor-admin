<script setup lang="ts">
import { computed, ref, watch } from 'vue';
defineOptions({
  name: 'CondorSearch'
});
interface Props {
  labelPlacement?: 'left' | 'top';
  cols?: number | Record<Condor.Grid.BreakPoint, number>;
  gap?: number | [number, number];
  isCollapsed?: boolean;
  columns: Condor.Search.Column[];
}
const props = withDefaults(defineProps<Props>(), {
  labelPlacement: 'left',
  cols: () => ({ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }),
  gap: () => [15, 0],
  isCollapsed: true
});
const gridRef = ref();
const formRef = ref();
// 搜索表单数据
const searchForm = ref<Condor.Search.FormItem>({});
const emit = defineEmits<{
  (e: 'search', data: Condor.Search.FormItem): void;
}>();
// 是否默认折叠搜索项
const collapsed = ref(props.isCollapsed);
const breakPoint = computed<Condor.Grid.BreakPoint>(() => gridRef.value?.breakPoint);
// 获取响应式设置
const getResponsive = (item: Condor.Search.Column) => {
  return {
    span: item.search?.span,
    offset: item.search?.offset,
    xs: item.search?.xs,
    sm: item.search?.sm,
    md: item.search?.md,
    lg: item.search?.lg,
    xl: item.search?.xl
  };
};
// 监听columns变化，初始化表单数据
watch(
  () => props.columns,
  newVal => {
    newVal.forEach(item => {
      searchForm.value[item.key] = item?.value || null;
    });
  },
  { immediate: true, deep: true }
);
const showCollapse = computed(() => {
  let show = false;
  props.columns.reduce((prev: number, current: any) => {
    const search = current.search || {};
    const newPrev =
      prev +
      (search![breakPoint.value]?.span ?? search?.span ?? 1) +
      (search![breakPoint.value]?.offset ?? search?.offset ?? 0);
    if (typeof props.cols !== 'number') {
      if (newPrev > props.cols[breakPoint.value]) show = true;
    } else if (newPrev > props.cols) show = true;
    return newPrev;
  }, 0);
  return show && props.isCollapsed;
});
// 搜索方法
const search = () => {
  const params: any = {};
  props.columns.forEach(item => {
    const value = searchForm.value[item.key];
    if (value !== null && value !== undefined && value !== '') {
      if ((Array.isArray(value) && item.component?.name === 'n-date-picker') || item.key.endsWith('time')) {
        params[item.key] = value.map((v: number) => {
          return v.toString().length > 10 ? v / 1000 : v;
        });
      } else {
        params[item.key] = item.operator ? [item.operator, value] : value;
      }
    }
  });
  emit('search', params);
};
// 重置方法
const reset = () => {
  const keys = Object.keys(searchForm.value);
  keys.forEach(key => {
    searchForm.value[key] = null;
  });
  formRef.value.restoreValidation();
  search();
};
</script>

<template>
  <NForm ref="formRef" :model="searchForm" :label-placement="props.labelPlacement">
    <CondorGrid ref="gridRef" :collapsed="collapsed" :cols="props.cols" :gap="props.gap">
      <CondorGridItem v-for="(item, index) in props.columns" v-bind="getResponsive(item)" :key="index" :index="index">
        <NFormItem :label="typeof item.title === 'function' ? item.title(searchForm) : item.title" :path="item.key">
          <div class="w-full" @keyup.enter="search">
            <slot :name="`search-${item.key}`" :row="searchForm">
              <CondorFormItem v-model:value="searchForm[item.key]" :column="item" />
            </slot>
          </div>
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem suffix>
        <NFormItem>
          <div class="opearation w-full flex items-center justify-start sm:justify-end space-x-2">
            <NButton type="warning" @click="reset">
              <icon-material-symbols-refresh class="text-16px" />
              <span>重置</span>
            </NButton>
            <NButton type="primary" @click="search">
              <icon-ri-search-line class="mr-1 text-16px" />
              <span>搜索</span>
            </NButton>
            <NButton v-if="showCollapse" type="tertiary" @click="collapsed = !collapsed">
              <span>{{ collapsed ? '展开' : '折叠' }}</span>
              <icon-ic-sharp-keyboard-arrow-down
                class="text-22px transition-all delay-100"
                :class="{ 'rotate-180': !collapsed }"
              />
            </NButton>
          </div>
        </NFormItem>
      </CondorGridItem>
    </CondorGrid>
  </NForm>
</template>
