<script lang="ts" setup>
import '@wangeditor/editor/dist/css/style.css';
import { computed, onBeforeUnmount, shallowRef } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { getBaseUrl } from '@/service/request/shared';
import { fetchUpload } from '@/service/api';
import { $t } from '@/locales';

defineOptions({
  name: 'CondorEditor'
});
type InsertFnType = (url: string, alt: string, href: string) => void;
const { baseURL } = getBaseUrl();
const props = withDefaults(
  defineProps<{
    value: string | null;
    height?: number;
    disabled?: boolean;
    mode?: 'default' | 'simple';
    placeholder?: string;
  }>(),
  {
    mode: 'default',
    height: 300,
    disabled: false,
    placeholder: $t('condor.component.please_enter_the_content')
  }
);
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const emit = defineEmits<{
  (e: 'update:value', value: string | null): void;
}>();
// 内容 HTML
const valueHtml = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('update:value', val);
  }
});

const toolbarConfig = {};
// 自定义上传
const customUpload = (file: File, insertFn: InsertFnType) => {
  const formData = new FormData();
  formData.append('file', file);
  fetchUpload(formData)
    .then(({ error, data }) => {
      if (error) {
        return;
      }
      const url = data.url.startsWith('http') ? data.url : `${baseURL}${data.url}`;
      const alt = data.filename;
      const href = data.fullurl;
      insertFn(url, alt, href);
    })
    .catch(err => {
      window.$message?.error(err.message || $t('condor.component.upload_failed'));
    });
};
const editorConfig = {
  placeholder: props.placeholder,
  readOnly: props.disabled, // 只读
  autoFocus: true,
  MENU_CONF: {
    uploadImage: {
      customUpload
    },
    uploadVideo: {
      customUpload
    }
  }
};
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  editor?.destroy();
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
</script>

<template>
  <div class="border">
    <Toolbar class="border" :editor="editorRef" :default-config="toolbarConfig" :mode="mode" />
    <Editor
      v-model="valueHtml"
      :style="{ height: `${props.height}px` }"
      :default-config="editorConfig"
      :mode="mode"
      @on-created="handleCreated"
    />
  </div>
</template>
