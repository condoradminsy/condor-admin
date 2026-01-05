<script setup lang="ts">
import { h, ref } from 'vue';
import { NButton } from 'naive-ui';
import { request } from '@/service/request';
import CronTime from './modules/cron-time.vue';
import CrontabLog from './modules/crontab-log.vue';
const logRef = ref();
const loadingMap = ref(new Map());
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/crontab/index',
    add: 'core/crontab/add',
    edit: 'core/crontab/edit',
    del: 'core/crontab/del',
    multi: 'core/crontab/multi'
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
      key: 'name',
      title: '任务名称',
      operator: 'like'
    },
    {
      key: 'type',
      title: '任务类型',
      component: {
        name: 'condor-dict-select',
        props: {
          code: 'crontab_type',
          type: 'number'
        }
      },
      operator: false
    },
    {
      key: 'target',
      title: '调用任务',
      operator: false,
      visible: false,
      component: {
        name: 'n-input',
        props: {
          type: 'textarea'
        }
      }
    },
    {
      key: 'cron_value',
      title: '定时规则',
      operator: false,
      render(row) {
        return row.cron;
      }
    },
    {
      key: 'params',
      title: '调用参数',
      operator: false,
      visible: false,
      component: {
        name: 'n-input',
        props: {
          type: 'textarea'
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
      width: 250,
      key: 'operation',
      buttons: [
        'edit',
        'del',
        (row: any) => {
          return h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              loading: loadingMap.value.get(row.id) === true,
              onClick: () => {
                loadingMap.value.set(row.id, true);
                request({
                  url: '/core/crontab/run-once',
                  method: 'post',
                  data: {
                    id: row.id
                  }
                })
                  .then(({ error, data }) => {
                    if (!error) {
                      if (data.data) {
                        window.$message?.success(data.msg);
                      } else {
                        window.$message?.error(data.msg);
                      }
                    }
                  })
                  .finally(() => {
                    loadingMap.value.delete(row.id);
                  });
              }
            },
            {
              default: () => '执行一次'
            }
          );
        },
        (row: any) => {
          return h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              onClick: () => {
                logRef.value.open(row.id);
              }
            },
            {
              default: () => '任务日志'
            }
          );
        }
      ]
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config">
      <template #form-item-cron_value="row">
        <CronTime v-model:value="row.form.cron_value" />
      </template>
    </CondorTable>
    <CrontabLog ref="logRef" />
  </div>
</template>
