<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import { NTag } from 'naive-ui';
import { request } from '@/service/request';
defineOptions({
  name: 'CondorSelect'
});
const props = withDefaults(
  defineProps<{
    value: any;
    url: string;
    multiple?: boolean;
    checkable?: boolean;
    placeholder?: any;
    labelField?: string;
    keyField?: string;
    isPagination?: boolean;
    maxTagCount?: number;
    param?: any;
  }>(),
  {
    multiple: false,
    checkable: true,
    isPagination: true,
    placeholder: '请选择',
    labelField: 'name',
    keyField: 'id',
    maxTagCount: 10,
    param: () => ({})
  }
);
const initValue = ref(props.value);
const options = ref([]);
const cachedOptions = ref<Record<string, any>>({});
const loading = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50, 100],
  showSizePicker: true,
  showQuickJumper: true
});
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
const getData = (keyword?: string) => {
  loading.value = true;
  const datas = {
    ...props.param,
    page: pagination.value.page,
    limit: pagination.value.pageSize
  };
  if (initValue.value) {
    datas[props.keyField] = initValue.value;
  }
  if (keyword) {
    datas[props.labelField] = ['like', keyword];
  } else {
    Reflect.deleteProperty(datas, props.labelField);
  }
  request({
    url: props.url,
    method: 'post',
    data: datas
  })
    .then(({ error, data }) => {
      if (!error) {
        options.value = (data.list || data || []).map((item: any) => {
          return {
            label: item[props.labelField],
            value: item[props.keyField]
          };
        });
        pagination.value.itemCount = data.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
getData();
const updateValue = (values: any) => {
  // eslint-disable-next-line no-nested-ternary
  const selectValues = Array.isArray(values) ? values : values === null ? [] : [values];
  const selectSet = new Set(selectValues.map((v: any) => String(v)));
  // 删除已取消选择的缓存项
  Object.keys(cachedOptions.value).forEach(k => {
    if (!selectSet.has(k)) {
      Reflect.deleteProperty(cachedOptions.value, k);
    }
  });
  // 缓存当前页中仍被选中的项，确保 label 可用
  options.value.forEach((item: any) => {
    const key = String(item.value);
    if (selectSet.has(key)) {
      cachedOptions.value[key] = { ...item };
    }
  });
};
const updatePage = (page: number) => {
  pagination.value.page = page;
  getData();
};
const updatePageSize = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.page = 1;
  getData();
};
const renderTag = ({ option }: any) => {
  if (props.multiple) {
    return h(
      NTag,
      {},
      {
        default: () => cachedOptions.value[option.value]?.label || option.label
      }
    );
  }
  return h(
    'span',
    {},
    {
      default: () => cachedOptions.value[option.value]?.label || option.label
    }
  );
};
</script>

<template>
  <div>
    <NSelect
      v-model:value="value"
      :options="options"
      :clearable="props.checkable"
      :multiple="props.multiple"
      :placeholder="props.placeholder"
      :loading="loading"
      filterable
      remote
      :max-tag-count="props.maxTagCount"
      :render-tag="renderTag"
      @search="getData"
      @update:value="updateValue"
    >
      <template #action>
        <div class="flex justify-end">
          <NPagination
            v-if="props.isPagination"
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :item-count="pagination.itemCount"
            :page-sizes="pagination.pageSizes"
            :show-size-picker="pagination.showSizePicker"
            :show-quick-jumper="pagination.showQuickJumper"
            @update:page-size="updatePageSize"
            @update:page="updatePage"
          />
        </div>
      </template>
    </NSelect>
  </div>
</template>
