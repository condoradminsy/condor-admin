<script lang="ts" setup>
import { provide, ref } from 'vue';
const modalRef = ref();
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/dict-data/index',
    add: 'core/dict-data/add',
    edit: 'core/dict-data/edit',
    del: 'core/dict-data/del',
    multi: 'core/dict-data/multi'
  },
  rowKey(row) {
    return row.id;
  },
  columns: [
    {
      type: 'selection',
      key: 'id',
      title: 'ID'
    },
    {
      key: 'label',
      title: '标题',
      operator: 'like'
    },
    {
      key: 'value',
      title: '值'
    },
    {
      key: 'color',
      title: '颜色',
      operator: false,
      component: {
        name: 'n-color-picker',
        props: {
          modes: ['hex'],
          showAlpha: false
        }
      }
    },
    {
      key: 'weigh',
      title: '权重',
      value: 0,
      operator: false,
      component: {
        name: 'n-input-number',
        props: {
          showButton: false
        }
      }
    },
    {
      key: 'remark',
      title: '备注',
      operator: false
    },
    {
      key: 'status',
      title: '状态',
      value: 1,
      component: {
        name: 'n-switch',
        props: {
          checkedValue: 1,
          uncheckedValue: 2
        }
      }
    },
    {
      type: 'operate',
      title: '操作',
      width: 200,
      key: 'operation',
      buttons: ['edit', 'del']
    }
  ]
});
const initParam = ref({
  type_id: 0
});
provide('onBeforeFormSubmit', (form: any) => {
  form.type_id = initParam.value.type_id;
  return form;
});
defineExpose({
  open: (type_id: number) => {
    initParam.value.type_id = type_id;
    modalRef.value.open();
  }
});
</script>

<template>
  <CondorModal
    ref="modalRef"
    custom-class="dict-modal"
    :show-action="false"
    title="字典数据"
    width="100vw"
    height="100vh"
  >
    <CondorTable :init-search-params="initParam" :config="config"></CondorTable>
  </CondorModal>
</template>
