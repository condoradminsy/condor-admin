<script setup lang="ts">
import { computed, h, provide, ref } from 'vue';
import { NButton } from 'naive-ui';
import { fetchUpload } from '@/service/api';
import { useDictStore } from '@/store/modules/dict';
import { $t } from '@/locales';

const dictStore = useDictStore();
const header = computed<Condor.Table.Header>(() => {
  return {
    params: dictStore.dictData.attachment_type,
    index: 0,
    searchField: 'a.type'
  };
});
const type_id = ref(0);
const tableRef = ref();
const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/attachment/index',
    add: '/core/attachment/upload',
    del: '/core/attachment/del'
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
      key: 'type_id',
      title() {
        return $t('system.attachment.type');
      },
      operator: false,
      render(row) {
        return row.type_name || '未分组';
      }
    },
    {
      key: 'url',
      title() {
        return $t('system.attachment.url');
      },
      operator: false,
      width: 60,
      render: 'image'
    },
    {
      key: 'storage',
      title() {
        return $t('system.attachment.storage');
      },
      operator: 'like'
    },
    {
      key: 'filename',
      title() {
        return $t('system.attachment.filename');
      },
      width: 150,
      operator: 'like',
      ellipsis: {
        tooltip: true
      }
    },
    {
      key: 'filesize',
      title() {
        return $t('system.attachment.filesize');
      },
      operator: false,
      render(row) {
        const val = row.filesize / 1024;
        return val > 1024 ? `${(val / 1024).toFixed(2)}M` : `${val.toFixed(2)}KB`;
      }
    },
    {
      key: 'type',
      title() {
        return $t('system.attachment.type');
      },
      operator: false
    },
    {
      key: 'mimetype',
      title() {
        return $t('system.attachment.mimetype');
      },
      operator: false,
      ellipsis: {
        tooltip: true
      },
      width: 150
    },
    {
      key: 'createtime',
      title() {
        return $t('condor.common.createtime');
      },
      form: false,
      width: 180
    },
    {
      type: 'operate',
      title() {
        return $t('common.operate');
      },
      width: 100,
      key: 'operation',
      buttons: ['del']
    }
  ]
});
const buttons: any = [
  'refresh',
  'del',
  () => {
    return h(
      NButton,
      {
        type: 'primary',
        onClick: () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.click();
          input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement | null;
            const file = target?.files?.[0];
            if (!file) {
              return;
            }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type_id', type_id.value.toString());
            fetchUpload(formData).then(({ error }) => {
              if (!error) {
                tableRef.value.getTableData();
              }
            });
          };
        }
      },
      {
        default: () => $t('system.attachment.upload')
      }
    );
  }
];
const selectType = (id: number) => {
  type_id.value = id;
  tableRef.value.getTableData();
};
provide('onBeforeTableIndex', (params: any) => {
  return {
    ...params,
    'a.type_id': type_id.value
  };
});
</script>

<template>
  <div>
    <NGrid cols="1 1080:5" :x-gap="12">
      <NGridItem :span="1">
        <CondorAttachmentType :value="type_id" @update:value="selectType" />
      </NGridItem>
      <NGridItem :span="4" class="rounded-md">
        <CondorTable ref="tableRef" :header="header" :config="config" :buttons="buttons" />
      </NGridItem>
    </NGrid>
  </div>
</template>
