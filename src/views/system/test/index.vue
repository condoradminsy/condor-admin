<script setup lang="ts">
import { ref } from 'vue';
const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/system-test/index',
    add: '/core/system-test/add',
    edit: '/core/system-test/edit',
    del: '/core/system-test/del'
  },
  rowKey(row) {
    return row.id;
  },
  columns: [
    {
      title: 'ID',
      key: 'id',
      form: false
    },
    {
      title: '名称',
      key: 'name',
      component: {
        name: 'condor-dict-radio',
        props: {
          code: 'dict_component'
        }
      }
    },
    {
      title: '目标',
      key: 'target',
      component: {
        name: 'n-date-picker',
        props: {
          type: 'date'
        }
      }
    },
    {
      title: '图片',
      key: 'image',
      component: {
        name: 'n-date-picker',
        props: {
          type: 'datetime'
        }
      }
    },
    {
      title: '创建时间',
      key: 'createtime',
      component: {
        name: 'n-date-picker',
        props: {
          type: 'daterange'
        }
      }
    },
    {
      title: '更新时间',
      key: 'updatetime',
      form: false
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config" />
  </div>
</template>
