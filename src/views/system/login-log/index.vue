<script setup lang="ts">
import { h, ref } from 'vue';
import { NTag } from 'naive-ui';
const modalRef = ref();
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/login-log/index',
    del: 'core/login-log/del'
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
      title: '用户名',
      operator: 'like'
    },
    {
      key: 'os',
      title: '操作系统',
      operator: false
    },
    {
      key: 'browser',
      title: '浏览器',
      operator: false
    },
    {
      key: 'ip',
      title: 'IP',
      operator: false
    },
    {
      key: 'ip_location',
      title: 'IP 归属地',
      operator: false
    },
    {
      key: 'status',
      title: '状态',
      search: {
        component: {
          name: 'n-select',
          props: {
            options: [
              {
                label: '成功',
                value: 1
              },
              {
                label: '失败',
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
            default: () => (row.status === 1 ? '成功' : '失败')
          }
        );
      }
    },
    {
      key: 'createtime',
      title: '创建时间',
      form: false,
      operator: false
    },
    {
      type: 'operate',
      title: '操作',
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
