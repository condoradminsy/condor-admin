<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/admin/index',
    add: '/core/admin/add',
    edit: '/core/admin/edit',
    del: '/core/admin/del',
    multi: '/core/admin/multi'
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
      key: 'role_ids',
      title() {
        return $t('system.admin.role');
      },
      operator: false,
      component: {
        name: 'condor-tree-select',
        props: {
          url: 'core/role/selectpage',
          checkable: true,
          multiple: true
        }
      },
      visible: false
    },
    {
      key: 'username',
      title() {
        return $t('system.admin.username');
      },
      operator: 'like',
      rules: [
        {
          required: true,
          message() {
            return $t('system.admin.please_input_the_username');
          },
          trigger: 'blur'
        }
      ]
    },
    {
      key: 'nickname',
      title() {
        return $t('system.admin.nickname');
      },
      operator: 'like'
    },
    {
      key: 'password',
      title() {
        return $t('system.admin.password');
      },
      operator: false,
      visible: false
    },
    {
      key: 'email',
      title() {
        return $t('system.admin.email');
      },
      operator: 'like'
    },
    {
      key: 'mobile',
      title() {
        return $t('system.admin.mobile');
      },
      operator: 'like'
    },
    {
      key: 'logintime',
      title() {
        return $t('system.admin.logintime');
      },
      operator: false,
      formatter: 'datetime',
      form: false
    },
    {
      key: 'loginip',
      title() {
        return $t('system.admin.loginip');
      },
      operator: false,
      form: false
    },
    {
      key: 'createtime',
      title() {
        return $t('condor.common.createtime');
      },
      form: false
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
      width: 120,
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
