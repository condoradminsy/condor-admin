<script setup lang="ts">
import { h, ref } from 'vue';
import { NButton } from 'naive-ui';
import { $t } from '@/locales';
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
      title() {
        return $t('system.dict-type.title');
      },
      operator: 'like'
    },
    {
      key: 'name',
      title() {
        return $t('system.dict-type.name');
      },
      operator: 'like',
      component: {
        props: {
          allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)
        }
      }
    },
    {
      key: 'scope',
      title() {
        return $t('system.dict-type.scope');
      },
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
      title() {
        return $t('system.dict-type.remark');
      },
      operator: false
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
      key: 'createtime',
      title() {
        return $t('condor.common.createtime');
      },
      form: false,
      operator: false
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
              default: () => $t('system.dict-type.dictData')
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
