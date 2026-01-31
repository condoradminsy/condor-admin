<script setup lang="ts">
import { h, ref } from 'vue';
import { NTag } from 'naive-ui';
import { $t } from '@/locales';

const modalRef = ref();
const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/login-log/index',
    del: '/core/login-log/del'
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
      key: 'username',
      title() {
        return $t('system.login-log.username');
      },
      operator: 'like'
    },
    {
      key: 'os',
      title() {
        return $t('system.login-log.os');
      },
      operator: false
    },
    {
      key: 'browser',
      title() {
        return $t('system.login-log.browser');
      },
      operator: false
    },
    {
      key: 'ip',
      title: 'IP',
      operator: false
    },
    {
      key: 'ip_location',
      title() {
        return $t('system.login-log.ip_location');
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
                  return $t('system.login-log.successful');
                },
                value: 1
              },
              {
                label() {
                  return $t('system.login-log.failed');
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
            default: () => (row.status === 1 ? $t('system.login-log.successful') : $t('system.login-log.failed'))
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
  <div>
    <CondorTable :config="config" :init-search-params="initParam" :buttons="['refresh', 'del']" />
  </div>
</template>
