<script setup lang="ts">
import { h, ref } from 'vue';
import { NButton } from 'naive-ui';
import { request } from '@/service/request';
import { $t } from '@/locales';
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
      title() {
        return $t('system.crontab.name');
      },
      operator: 'like'
    },
    {
      key: 'type',
      title() {
        return $t('system.crontab.type');
      },
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
      title() {
        return $t('system.crontab.target');
      },
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
      title() {
        return $t('system.crontab.cron_value');
      },
      operator: false,
      render(row) {
        return row.cron;
      }
    },
    {
      key: 'params',
      title() {
        return $t('system.crontab.params');
      },
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
      title() {
        return $t('system.crontab.remark');
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
              default: () => $t('system.crontab.run_once')
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
              default: () => $t('system.crontab.crontab_log')
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
