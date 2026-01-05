<script setup lang="ts">
import { h, ref } from 'vue';
import { NTag } from 'naive-ui';
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
      title: '名称',
      operator: 'like'
    },
    {
      key: 'target',
      title: '任务调用',
      operator: false
    },
    {
      key: 'params',
      title: '任务参数',
      operator: false
    },
    {
      key: 'exception_info',
      title: '异常信息',
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
  <CondorModal ref="modalRef" width="80vw" height="700px" :show-action="false" title="任务日志">
    <CondorTable :config="config" :init-search-params="initParam" :buttons="['refresh', 'del']" />
  </CondorModal>
</template>
