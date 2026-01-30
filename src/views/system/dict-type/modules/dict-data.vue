<script lang="ts" setup>
import { provide, ref } from 'vue';
import { $t } from '@/locales';
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
      title() {
        return $t('system.dict-type.title');
      },
      operator: 'like'
    },
    {
      key: 'value',
      title() {
        return $t('system.dict-type.value');
      }
    },
    {
      key: 'color',
      title() {
        return $t('system.dict-type.color');
      },
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
      title() {
        return $t('system.dict-type.weigh');
      },
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
      title() {
        return $t('system.dict-type.remark');
      },
      operator: false
    },
    {
      key: 'status',
      title() {
        return $t('condor.common.status');
      },
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
      title() {
        return $t('common.operate');
      },
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
    :title="$t('system.dict-type.dictData')"
    width="100vw"
    height="100vh"
  >
    <CondorTable :init-search-params="initParam" :config="config"></CondorTable>
  </CondorModal>
</template>
