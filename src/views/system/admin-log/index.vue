<script setup lang="ts">
import { h, ref } from 'vue';
import { NCode, NPopover } from 'naive-ui';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import { $t } from '@/locales';

hljs.registerLanguage('json', json);

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/admin-log/index',
    del: '/core/admin-log/del'
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
        return $t('system.admin-log.username');
      },
      operator: 'like'
    },
    {
      key: 'title',
      title() {
        return $t('system.admin-log.title');
      },
      operator: 'like'
    },
    {
      key: 'os',
      title() {
        return $t('system.admin-log.os');
      },
      operator: false
    },
    {
      key: 'browser',
      title() {
        return $t('system.admin-log.browser');
      },
      operator: false
    },
    {
      key: 'ip',
      title: 'IP',
      operator: false
    },
    {
      key: 'ip_location',
      title() {
        return $t('system.admin-log.ip_location');
      },
      operator: false
    },
    {
      key: 'url',
      title() {
        return $t('system.admin-log.url');
      },
      width: 200,
      operator: 'like'
    },
    {
      key: 'content',
      title() {
        return $t('system.admin-log.content');
      },
      operator: false,
      width: 200,
      render(row) {
        let value = row.content;
        try {
          value = JSON.parse(row.content);
          value = JSON.stringify(value, null, 2);
        } catch {
          value = row.content;
        }
        return h(
          NPopover,
          { trigger: 'hover' },
          {
            trigger: () =>
              h(
                'div',
                {
                  class: 'w-[200px] overflow-hidden text-ellipsis whitespace-nowrap break-all'
                },
                row.content
              ),
            default: () => h(NCode, { code: value, language: 'json', hljs })
          }
        );
      }
    },
    {
      key: 'createtime',
      title() {
        return $t('condor.common.createtime');
      },
      width: 200,
      form: false,
      operator: false
    },
    {
      type: 'operate',
      title() {
        return $t('common.operate');
      },
      width: 80,
      key: 'operation',
      buttons: ['del']
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config" :buttons="['refresh', 'del']" />
  </div>
</template>
