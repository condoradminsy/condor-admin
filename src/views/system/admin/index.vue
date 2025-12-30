<script setup lang="ts">
import { ref } from 'vue';

const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/admin/index',
    add: 'core/admin/add',
    edit: 'core/admin/edit',
    del: 'core/admin/del',
    multi: 'core/admin/multi'
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
      title: '角色',
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
      title: '用户名',
      operator: 'like',
      rules: [
        {
          required: true,
          message: '请输入用户名',
          trigger: 'blur'
        }
      ]
    },
    {
      key: 'nickname',
      title: '昵称',
      operator: 'like'
    },
    {
      key: 'password',
      title: '密码',
      operator: false,
      visible: false
    },
    {
      key: 'email',
      title: '邮箱',
      operator: 'like'
    },
    {
      key: 'mobile',
      title: '手机号码',
      operator: 'like'
    },
    {
      key: 'logintime',
      title: '登录时间',
      operator: false,
      formatter: 'datetime',
      form: false
    },
    {
      key: 'loginip',
      title: '登录IP',
      operator: false,
      form: false
    },
    {
      key: 'createtime',
      title: '创建时间',
      form: false
    },
    {
      key: 'status',
      title: '状态',
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
