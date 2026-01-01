<script setup lang="ts">
import { h, provide, ref } from 'vue';
import { NButton, NImage } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { fetchUpload } from '@/service/api';
import AttachmentType from './modules/attachment-type.vue';
const header = ref<Condor.Table.Header>({
  params: [
    { label: '全部', value: 'all' },
    { label: '图片', value: 'image' },
    { label: '视频', value: 'video' },
    { label: '音频', value: 'audio' },
    { label: '文本', value: 'text' },
    { label: '文档', value: 'document' },
    { label: 'Excel', value: 'excel' },
    { label: 'PPT', value: 'ppt' },
    { label: 'PDF', value: 'pdf' },
    { label: '压缩包', value: 'zip' },
    { label: '其他', value: 'other' }
  ],
  index: 0,
  searchField: 'a.type'
});
const type_id = ref(0);
const tableRef = ref();
const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/attachment/index',
    add: 'core/attachment/upload',
    del: 'core/attachment/del'
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
      title: '分组',
      operator: false,
      render(row) {
        return row.type_name || '未分组';
      }
    },
    {
      key: 'url',
      title: '文件',
      operator: false,
      width: 60,
      render(row) {
        const typeMap: any = {
          video: 'ion-film-outline',
          audio: 'gridicons-audio',
          txt: 'tabler-file-type-txt',
          word: 'ep-document',
          excel: 'mdi-microsoft-excel',
          ppt: 'lsicon-file-ppt-filled',
          pdf: 'lsicon-file-pdf-outline',
          zip: 'hugeicons-zip-02',
          other: 'solar-documents-bold'
        };
        switch (row.type) {
          case 'image':
            return h(NImage, {
              width: 50,
              height: 50,
              src: `http://127.0.0.1:5566${row.url}`
            });
          case 'video':
            return h(
              'a',
              {
                class: 'flex justify-center items-center cursor-pointer',
                href: `http://127.0.0.1:5566${row.url}`,
                target: '_blank'
              },
              {
                default: () => [
                  h(Icon, {
                    icon: typeMap[row.type],
                    class: 'text-xl'
                  })
                ]
              }
            );
          default:
            return h(
              'a',
              {
                href: `http://127.0.0.1:5566${row.url}`
              },
              {
                default: () => row.filename
              }
            );
        }
      }
    },
    {
      key: 'storage',
      title: '储存位置'
    },
    {
      key: 'filename',
      title: '文件名',
      width: 290
    },
    {
      key: 'filesize',
      title: '文件大小',
      operator: false,
      render(row) {
        const val = row.filesize / 1024;
        return val > 1024 ? `${(val / 1024).toFixed(2)}M` : `${val.toFixed(2)}KB`;
      }
    },
    {
      key: 'type',
      title: '类型',
      operator: false
    },
    {
      key: 'mimetype',
      title: 'mime类型',
      operator: false
    },
    {
      key: 'createtime',
      title: '创建时间',
      form: false
    },
    {
      type: 'operate',
      title: '操作',
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
        default: () => '上传文件'
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
        <AttachmentType :value="type_id" @update:value="selectType" />
      </NGridItem>
      <NGridItem :span="4" class="rounded-md">
        <CondorTable ref="tableRef" :header="header" :config="config" :buttons="buttons" />
      </NGridItem>
    </NGrid>
  </div>
</template>
