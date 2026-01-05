<script setup lang="ts">
import { h, ref } from 'vue';
import { NButton } from 'naive-ui';
import DictData from './modules/dict-data.vue';
const dictRef = ref();
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/dict-type/index',
    add: 'core/dict-type/add',
    edit: 'core/dict-type/edit',
    del: 'core/dict-type/del',
    multi: 'core/dict-type/multi'
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
      operator: 'like'
    },
    {
      key: 'name',
      title: '名称标识',
      operator: 'like',
      component: {
        props: {
          allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)
        }
      }
    },
    {
      key: 'scope',
      title: '可见范围',
      component: {
        name: 'condor-dict-radio',
        props: {
          code: 'dict_scope',
          type: 'number'
        }
      }
    },
    {
      key: 'remark',
      title: '备注',
      operator: false
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
      key: 'createtime',
      title: '创建时间',
      form: false,
      operator: false
    },
    {
      type: 'operate',
      title: '操作',
      width: 200,
      key: 'operation',
      buttons: [
        (row: any) => {
          return h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => {
                dictRef.value.open(row.id);
              }
            },
            {
              default: () => '字典数据'
            }
          );
        },
        'edit',
        'del'
      ]
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config" />
    <DictData ref="dictRef"></DictData>
  </div>
</template>
