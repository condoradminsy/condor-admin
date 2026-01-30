<script lang="ts" setup>
import { computed, ref } from 'vue';
import { request } from '@/service/request';
import { $t } from '@/locales';
defineOptions({
  name: 'CondorTreeCheck'
});
const props = withDefaults(
  defineProps<{
    value: any;
    url: string;
    checkStrategy?: 'all' | 'parent' | 'child';
    multiple?: boolean;
    checkable?: boolean;
    placeholder?: any;
    labelField?: string;
    keyField?: string;
    param?: any;
    format?: string;
    showLine?: boolean;
    renderPrefix?: any;
    renderSuffix?: any;
    showIrrelevantNodes?: boolean;
    childrenField?: string;
  }>(),
  {
    checkStrategy: 'all',
    multiple: false,
    checkable: false,
    placeholder: $t('condor.component.please_select'),
    labelField: 'name',
    keyField: 'id',
    format: 'string',
    showLine: true,
    childrenField: 'children',
    showIrrelevantNodes: false,
    renderPrefix: () => undefined,
    renderSuffix: () => undefined,
    param: () => ({})
  }
);
const defaultExpandAll = ref(true);
const cascade = ref(false);
const checkedAll = ref(false);
const pattern = ref('');
const treeList = ref([]);
const emit = defineEmits<{
  (e: 'update:value', value: any): void;
}>();
const value = computed({
  get() {
    if (Array.isArray(props.value)) {
      return props.value.map(Number);
    } else if (props.value) {
      return props.value.split(',').map(Number).filter(Boolean);
    }
    return [];
  },
  set(val) {
    if (props.format === 'string' && Array.isArray(val)) {
      emit('update:value', val.join(','));
    } else {
      emit('update:value', val);
    }
  }
});
const updateChecked = (checked: boolean) => {
  if (checked) {
    if (!cascade.value) {
      // 级联选择
      value.value = treeList.value.reduce((acc: any[], item: any) => {
        const getAllKeys = (node: any) => {
          acc.push(node[props.keyField]);
          if (node[props.childrenField] && node[props.childrenField].length) {
            node[props.childrenField].forEach((child: any) => {
              getAllKeys(child);
            });
          }
        };
        getAllKeys(item);
        return acc;
      }, []);
      return;
    }
    value.value = treeList.value.map((item: any) => item[props.keyField]);
  } else {
    // 全不选
    value.value = [];
  }
};
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
  <div>
    <div class="flex items-center space-x-5">
      <NCheckbox v-model:checked="defaultExpandAll" :label="$t('condor.component.expand_or_collapse')" />
      <NCheckbox
        v-model:checked="checkedAll"
        :label="$t('condor.component.check_all_uncheck_all')"
        @update:checked="updateChecked"
      />
      <NCheckbox v-model:checked="cascade" :label="$t('condor.component.parent_child_linkage')" />
    </div>
    <div class="mt-2 border-2 rounded-md p-1">
      <div class="p-2">
        <NInput v-model:value="pattern" clearable :placeholder="$t('condor.component.filter_data')" />
      </div>
      <NTree
        v-model:checked-keys="value"
        :data="treeList"
        :show-line="props.showLine"
        :key-field="props.keyField"
        :cascade="cascade"
        :pattern="pattern"
        :children-field="props.childrenField"
        :show-irrelevant-nodes="props.showIrrelevantNodes"
        :render-prefix="props.renderPrefix"
        :render-suffix="props.renderSuffix"
        :label-field="props.labelField"
        :checkable="props.checkable"
        :multiple="props.multiple"
        :placeholder="props.placeholder"
        :check-strategy="props.checkStrategy"
        :default-expand-all="defaultExpandAll"
      ></NTree>
    </div>
  </div>
</template>
