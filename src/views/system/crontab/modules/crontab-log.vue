<script setup lang="ts">
import { h, ref } from 'vue';
import { NTag } from 'naive-ui';
import { $t } from '@/locales';
const modalRef = ref();
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/crontab-log/index'
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
      key: 'name',
      title() {
        return $t('system.crontab.name');
      },
      operator: 'like'
    },
    {
      key: 'target',
      title() {
        return $t('system.crontab.target');
      },
      operator: false
    },
    {
      key: 'params',
      title() {
        return $t('system.crontab.params');
      },
      operator: false
    },
    {
      key: 'exception_info',
      title() {
        return $t('system.crontab.exception_info');
      },
      operator: false
    },
    {
      key: 'status',
      title() {
        return $t('condor.common.status');
      },
      search: {
        component: {
          name: 'n-select',
          props: {
            options: [
              {
                label() {
                  return $t('system.crontab.successful');
                },
                value: 1
              },
              {
                label() {
                  return $t('system.crontab.failure');
                },
                value: 2
              }
            ]
          }
        }
      },
      render(row) {
        return h(
          NTag,
          {
            type: row.status === 1 ? 'success' : 'error',
            size: 'small'
          },
          {
            default: () => (row.status === 1 ? $t('system.crontab.successful') : $t('system.crontab.failure'))
          }
        );
      }
    },
    {
      key: 'createtime',
      title() {
        return $t('condor.common.createtime');
      },
      form: false,
      operator: false
    },
    {
      type: 'operate',
      title() {
        return $t('common.operate');
      },
      width: 100,
      key: 'operation',
      buttons: ['del']
    }
  ]
});
const initParam = ref({
  crontab_id: 0
});
defineExpose({
  open: (crontab_id: number) => {
    initParam.value.crontab_id = crontab_id;
    modalRef.value.open();
  }
});
</script>

<template>
  <CondorModal
    ref="modalRef"
    width="80vw"
    height="700px"
    :show-action="false"
    :title="$t('system.crontab.crontab_log')"
  >
    <CondorTable :config="config" :init-search-params="initParam" :buttons="['refresh', 'del']" />
  </CondorModal>
</template>
