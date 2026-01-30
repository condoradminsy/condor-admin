<script setup lang="ts">
import { h, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { $t } from '@/locales';

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
      title() {
        return $t('system.menu.title');
      },
      align: 'left',
      rules: [
        {
          required: true,
          message() {
            return $t('system.menu.please_input_the_title');
          },
          trigger: 'blur'
        }
      ],
      render(row) {
        return row.i18nkey ? $t(row.i18nkey) : row.title;
      }
    },
    {
      key: 'name',
      title() {
        return $t('system.menu.name');
      },
      component: {
        // 只能输入字母数字下划线，且字母开头
        props: {
          allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)
        }
      },
      rules: [
        {
          required: true,
          message() {
            return $t('system.menu.please_input_the_name');
          },
          trigger: 'blur'
        }
      ]
    },
    {
      key: 'pid',
      title() {
        return $t('system.menu.parent_menu');
      },
      operator: false,
      component: {
        name: 'condor-tree-select',
        props: {
          url: 'core/menu/selectpage',
          labelField: 'title',
          param: {
            menu_type: 1
          }
        }
      },
      visible: false
    },
    {
      key: 'i18nkey',
      title() {
        return $t('system.menu.i18nkey');
      },
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
      title() {
        return $t('system.menu.weigh');
      },
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
      title() {
        return $t('system.menu.path');
      },
      operator: false
    },
    {
      key: 'component',
      title() {
        return $t('system.menu.component');
      },
      operator: false,
      condition(form: any) {
        return form.menu_type === 1;
      }
    },
    {
      key: 'menu_type',
      title() {
        return $t('system.menu.menu_type');
      },
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
      title() {
        return $t('system.menu.active_menu');
      },
      operator: false,
      condition(form: any) {
        return form.menu_type === 1;
      },
      tips() {
        return $t('system.menu.the_menu_active_menu_tips');
      }
    },
    {
      key: 'redirect',
      title() {
        return $t('system.menu.redirect');
      },
      operator: false,
      visible: false,
      condition(form: any) {
        return form.menu_type === 1;
      }
    },
    {
      key: 'hidden',
      title() {
        return $t('system.menu.hidden');
      },
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
      title() {
        return $t('system.menu.is_keep');
      },
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
