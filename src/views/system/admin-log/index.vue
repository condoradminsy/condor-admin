<script setup lang="ts">
import { h, ref } from 'vue';
import { NCode, NPopover } from 'naive-ui';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
hljs.registerLanguage('json', json);
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/admin-log/index',
    del: 'core/admin-log/del'
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
      title: '操作人',
      operator: 'like'
    },
    {
      key: 'title',
      title: '标题',
      operator: 'like'
    },
    {
      key: 'os',
      title: '操作系统',
      operator: false
    },
    {
      key: 'browser',
      title: '浏览器',
      operator: false
    },
    {
      key: 'ip',
      title: 'IP',
      operator: false
    },
    {
      key: 'ip_location',
      title: 'IP 归属地',
      operator: false
    },
    {
      key: 'url',
      title: '请求地址',
      width: 200,
      operator: 'like'
    },
    {
      key: 'content',
      title: '请求内容',
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
      title: '创建时间',
      width: 200,
      form: false,
      operator: false
    },
    {
      type: 'operate',
      title: '操作',
      width: 60,
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
