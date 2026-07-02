<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/condorauth/user/index',
    add: '/core/condorauth/user/add',
    edit: '/core/condorauth/user/edit',
    del: '/core/condorauth/user/del',
    multi: '/core/condorauth/user/multi'
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
        return $t('condorauth.user.username');
      },
      operator: 'like',
      rules: [
        {
          required: true,
          message() {
            return $t('condorauth.user.please_input_the_username');
          },
          trigger: 'blur'
        }
      ]
    },
    {
      key: 'nickname',
      title() {
        return $t('condorauth.user.nickname');
      },
      operator: 'like'
    },
    {
      key: 'invite_code',
      title() {
        return $t('condorauth.user.invite_code');
      },
      operator: 'like',
      form: false
    },
    {
      key: 'password',
      title() {
        return $t('condorauth.user.password');
      },
      operator: false,
      visible: false,
      component: {
        name: 'n-input',
        props: {
          type: 'password',
          showPasswordOn: 'click'
        }
      }
    },
    {
      key: 'email',
      title() {
        return $t('condorauth.user.email');
      },
      operator: 'like',
      rules: [
        {
          type: 'email',
          message: '请输入有效的邮箱地址',
          trigger: 'blur'
        }
      ]
    },
    {
      key: 'mobile',
      title() {
        return $t('condorauth.user.mobile');
      },
      operator: 'like',
      rules: [
        {
          pattern: /^1[3-9]\d{9}$/,
          message: '请输入有效的手机号',
          trigger: 'blur'
        }
      ]
    },
    {
      key: 'avatar',
      title() {
        return $t('condorauth.user.avatar');
      },
      operator: false,
      component: {
        name: 'condor-upload',
        props: {
          type: 'image'
        }
      },
      render: 'image'
    },
    {
      key: 'gender',
      title() {
        return $t('condorauth.user.gender');
      },
      operator: '=',
      component: {
        name: 'condor-dict-radio',
        props: {
          code: 'gender'
        }
      },
      value: 0
    },
    {
      key: 'logintime',
      title() {
        return $t('condorauth.user.logintime');
      },
      operator: false,
      render: 'datetime',
      form: false
    },
    {
      key: 'loginip',
      title() {
        return $t('condorauth.user.loginip');
      },
      operator: false,
      form: false
    },
    {
      key: 'loginfailure',
      title() {
        return $t('condorauth.user.loginfailure');
      },
      operator: false,
      form: false
    },
    {
      key: 'register_ip',
      title() {
        return $t('condorauth.user.register_ip');
      },
      operator: false,
      form: false
    },
    {
      key: 'status',
      title() {
        return $t('condor.common.status');
      },
      value: 1,
      operator: '=',
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
      fixed: 'right',
      key: 'operation',
      buttons: ['edit', 'del']
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config" :scroll-x="1500" />
  </div>
</template>
