<script setup lang="ts">
import { h, ref } from 'vue';
import { Icon } from '@iconify/vue';

const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/menu/index',
    add: 'core/menu/add',
    edit: 'core/menu/edit',
    del: 'core/menu/del',
    multi: 'core/menu/multi'
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
      key: 'title',
      title: '标题',
      operator: 'like',
      rules: [{ required: true, message: '请输入标题', trigger: 'blur' }]
    },
    {
      key: 'name',
      title: '名称',
      operator: 'like',
      component: {
        // 只能输入字母数字下划线，且字母开头
        props: {
          allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)
        }
      },
      rules: [{ required: true, message: '请输入名称', trigger: 'blur' }]
    },
    {
      key: 'pid',
      title: '父级菜单',
      operator: false,
      component: {
        name: 'condor-tree-select',
        props: {
          url: 'core/menu/selectpage',
          labelField: 'title'
        }
      },
      visible: false
    },
    {
      key: 'i18nkey',
      title: '国际化键',
      operator: false,
      condition(form: any) {
        return form.menu_type === 1;
      }
    },
    {
      key: 'icon',
      title: 'Icon',
      operator: false,
      render(row) {
        return h(
          'div',
          { class: 'flex justify-center' },
          { default: () => [h(Icon, { icon: row.icon, width: 18, height: 18 })] }
        );
      }
    },
    {
      key: 'weigh',
      title: '权重',
      value: 0,
      operator: false,
      component: {
        name: 'n-input-number',
        props: {
          showButton: false
        }
      }
    },
    {
      key: 'path',
      title: '路径',
      operator: false
    },
    {
      key: 'component',
      title: '组件',
      operator: false,
      condition(form: any) {
        return form.menu_type === 1;
      }
    },
    {
      key: 'menu_type',
      title: '类型',
      operator: false,
      value: 1,
      component: {
        name: 'condor-dict-radio',
        props: {
          code: 'menu_type',
          type: 'number'
        }
      }
    },
    {
      key: 'active_menu',
      title: '选中的菜单项',
      operator: false,
      condition(form: any) {
        return form.menu_type === 1;
      },
      tips: '当前路由需要选中的菜单项(用于跳转至不在左侧菜单显示的路由且需要高亮某个菜单的情况)'
    },
    {
      key: 'redirect',
      title: '重定向',
      operator: false,
      visible: false,
      condition(form: any) {
        return form.menu_type === 1;
      }
    },
    {
      key: 'hidden',
      title: '是否隐藏',
      operator: false,
      condition(form: any) {
        return form.menu_type === 1;
      },
      component: {
        name: 'n-switch',
        props: {
          checkedValue: 1,
          uncheckedValue: 0
        }
      }
    },
    {
      key: 'is_keep',
      title: '是否缓存',
      operator: false,
      condition(form: any) {
        return form.menu_type === 1;
      },
      component: {
        name: 'n-switch',
        props: {
          checkedValue: 1,
          uncheckedValue: 0
        }
      }
    },
    {
      key: 'status',
      title: '状态',
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
      title: '操作',
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
    <CondorTable :config="config" :is-pagination="false" :scroll-x="2000" :default-expand-all="true" />
  </div>
</template>
