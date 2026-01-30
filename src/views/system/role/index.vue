<script setup lang="ts">
import { h, ref } from 'vue';
import { NButton } from 'naive-ui';
import { $t } from '@/locales';

const tableRef = ref();
const layerRef = ref();
const columns = ref([
  {
    title() {
      return $t('system.role.name');
    },
    key: 'name',
    component: {
      props: {
        disabled: true
      }
    }
  },
  {
    title() {
      return $t('system.role.rules');
    },
    key: 'rules',
    component: {
      name: 'condor-tree-check',
      props: {
        url: 'core/menu/selectpage',
        labelField: 'title',
        multiple: true,
        checkable: true
      }
    }
  }
]);
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/role/index',
    add: 'core/role/add',
    edit: 'core/role/edit',
    del: 'core/role/del',
    multi: 'core/role/multi'
  },
  rowKey(row) {
    return row.id;
  },
  columns: [
    {
      type: 'selection',
      key: 'id',
      title: 'ID',
      disabled(row: any) {
        return row.id === 1;
      }
    },
    {
      key: 'pid',
      title() {
        return $t('system.role.pid');
      },
      operator: false,
      component: {
        name: 'condor-tree-select',
        props: {
          url: 'core/role/selectpage'
        }
      },
      visible: false
    },
    {
      key: 'name',
      title() {
        return $t('system.role.name');
      }
    },
    {
      key: 'code',
      title() {
        return $t('system.role.code');
      },
      tips() {
        return $t('system.role.code_tips');
      },
      component: {
        props: {
          allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)
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
      width: 200,
      key: 'operation',
      buttons: [
        (row: any) => {
          if (row.code === 'superadmin') {
            return h('span', {});
          }
          return h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => {
                layerRef.value.setForm(row, 'id,pid,code,status');
                layerRef.value.open({
                  title: $t('system.role.setting'),
                  type: 'edit'
                });
              }
            },
            {
              default: () => $t('system.role.rules')
            }
          );
        },
        'edit:id:1',
        'del:id:1'
      ]
    }
  ]
});

const getTableData = () => {
  tableRef.value.getTableData();
};
</script>

<template>
  <div>
    <CondorTable ref="tableRef" :config="config" :is-pagination="false" :default-expand-all="true" />
    <CondorLayerForm ref="layerRef" :columns="columns" :urls="config.urls" @on-ok="getTableData"></CondorLayerForm>
  </div>
</template>
