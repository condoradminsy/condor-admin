<script setup lang="ts">
import { h, ref } from 'vue';
import { NButton } from 'naive-ui';

const tableRef = ref();
const layerRef = ref();
const columns = ref([
  {
    title: '角色名称',
    key: 'name',
    component: {
      props: {
        disabled: true
      }
    }
  },
  {
    title: '权限规则',
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
      title: '上级ID',
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
      title: '角色名称'
    },
    {
      key: 'code',
      title: '角色标识',
      tips: 'superadmin 为超级管理员',
      component: {
        props: {
          allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)
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
                  title: '权限设置',
                  type: 'edit'
                });
              }
            },
            {
              default: () => '权限规则'
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
