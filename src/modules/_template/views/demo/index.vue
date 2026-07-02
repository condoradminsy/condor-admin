<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/{module}/{name}/index',
    add: '/core/{module}/{name}/add',
    edit: '/core/{module}/{name}/edit',
    del: '/core/{module}/{name}/del',
    multi: '/core/{module}/{name}/multi'
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
        // 替换为实际 i18n 键，如: $t('condorauth.user.username')
        return '';
      },
      operator: 'like',
      rules: [{ required: true, trigger: 'blur' }]
    },
    {
      key: 'status',
      title() {
        return $t('condor.common.status');
      },
      operator: '=',
      component: {
        name: 'n-switch',
        props: { checkedValue: 1, uncheckedValue: 2 }
      }
    },
    {
      type: 'operate',
      title() {
        return $t('common.operate');
      },
      width: 120,
      fixed: 'right',
      key: 'operation',
      buttons: ['edit', 'del']
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config" />
  </div>
</template>
