<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/condorauth/user/index',
    add: '/condorauth/user/add',
    edit: '/condorauth/user/edit',
    del: '/condorauth/user/del',
    multi: '/condorauth/user/multi'
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
      key: 'pid',
      title() {
        return $t('condorauth.user.pid');
      },
      operator: false,
      visible: false,
      component: {
        name: 'n-input-number',
        props: {
          min: 0
        }
      }
    },
    {
      key: 'vip_id',
      title() {
        return $t('condorauth.user.vip_id');
      },
      operator: false,
      visible: false,
      component: {
        name: 'n-input-number',
        props: {
          min: 0
        }
      }
    },
    {
      key: 'level',
      title() {
        return $t('condorauth.user.level');
      },
      operator: false,
      component: {
        name: 'n-input-number',
        props: {
          min: 0
        }
      }
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
          dictKey: 'user_gender',
          options: [
            { label: '未知', value: 0 },
            { label: '男', value: 1 },
            { label: '女', value: 2 }
          ]
        }
      },
      value: 0
    },
    {
      key: 'money',
      title() {
        return $t('condorauth.user.money');
      },
      operator: false,
      component: {
        name: 'n-input-number',
        props: {
          min: 0,
          precision: 4,
          step: 0.01
        }
      },
      value: 0
    },
    {
      key: 'score',
      title() {
        return $t('condorauth.user.score');
      },
      operator: false,
      component: {
        name: 'n-input-number',
        props: {
          min: 0
        }
      },
      value: 0
    },
    {
      key: 'invite_code',
      title() {
        return $t('condorauth.user.invite_code');
      },
      operator: 'like'
    },
    {
      key: 'consecutive_login_days',
      title() {
        return $t('condorauth.user.consecutive_login_days');
      },
      operator: false,
      form: false
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
      key: 'createtime',
      title() {
        return $t('condor.common.createtime');
      },
      render: 'datetime',
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
