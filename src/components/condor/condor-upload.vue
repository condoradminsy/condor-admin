<script setup lang="ts">
import { h, ref, watch } from 'vue';
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui';
import { transformColorWithOpacity } from '@sa/color';
import { fetchUpload } from '@/service/api';
import { useThemeStore } from '@/store/modules/theme';
import { getServiceBaseURL } from '@/utils/service';
const themeStore = useThemeStore();
const bgColor = transformColorWithOpacity(themeStore.themeColor, 0.1);
const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);
const spaceRef = ref();
const props = withDefaults(
  defineProps<{
    value: string | string[] | null | undefined;
    multiple?: boolean;
    max?: number;
    disabled?: boolean;
  }>(),
  {
    multiple: false,
    max: 1,
    disabled: false
  }
);
const fileList = ref<string[]>([]);
const uploadFileList = ref<UploadFileInfo[]>([]);
const isUpdate = ref(false);
// 初始化
watch(
  () => props.value,
  newValue => {
    if (isUpdate.value) {
      return;
    }
    if (!newValue) {
      uploadFileList.value = [];
    } else if (props.multiple) {
      uploadFileList.value = (Array.isArray(newValue) ? newValue : newValue.split(',')).map(item => {
        return {
          name: item,
          status: 'finished',
          url: item.startsWith('http') ? item : `${baseURL}${item}`,
          id: item
        };
      });
    } else {
      uploadFileList.value = [
        {
          name: newValue as string,
          status: 'finished',
          url: (newValue as string).startsWith('http') ? (newValue as string) : `${baseURL}${newValue}`,
          id: newValue as string
        }
      ];
    }
    fileList.value = [...uploadFileList.value.map(item => item.id)];
  },
  {
    immediate: true
  }
);
// 绑定关系
const emit = defineEmits<{
  (e: 'update:value', value: string | string[] | null | undefined): void;
}>();
const customRequest = ({ file, onFinish, onError }: UploadCustomRequestOptions) => {
  const formData = new FormData();
  formData.append('file', file.file as File);
  fetchUpload(formData)
    .then(({ error, data }) => {
      if (error) {
        onError();
        return;
      }
      fileList.value = [...fileList.value, data.url];
      onFinish();
    })
    .catch(onError);
};
const onUploadFinish = () => {
  isUpdate.value = true;
  if (props.multiple) {
    emit('update:value', fileList.value.join(','));
  } else {
    emit('update:value', fileList.value[0]);
  }
  setTimeout(() => {
    isUpdate.value = false;
  }, 100);
};
const onRemove = ({ index }: { index: number }) => {
  fileList.value.splice(index, 1);
  onUploadFinish();
};

const onSelect = (list: string[]) => {
  fileList.value = [...fileList.value, ...list];
  uploadFileList.value = [
    ...uploadFileList.value,
    ...list.map(item => {
      return {
        name: item,
        status: 'finished' as any,
        url: item.startsWith('http') ? item : `${baseURL}${item}`,
        id: item
      };
    })
  ];
  onUploadFinish();
};
const renderIcon = () => {
  return h(
    'div',
    {},
    {
      default: () => 'sdf'
    }
  );
};
</script>

<template>
  <div>
    <NUpload
      v-model:file-list="uploadFileList"
      :multiple="props.multiple"
      :max="props.max"
      :disabled="props.disabled"
      list-type="image-card"
      response-type="json"
      :custom-request="customRequest"
      :on-finish="onUploadFinish"
      :on-remove="onRemove"
      :render-icon="renderIcon"
    >
      <div class="parent relative h-full w-full">
        <div
          class="select-btn absolute left-0 top-0 hidden h-[32%] w-full parent-hover:block"
          :style="{ '--bg-select-coloe': bgColor, '--select-color': themeStore.themeColor }"
          @click.stop="spaceRef.open()"
        >
          <div class="h-full w-full flex items-center justify-center text-xs">选择</div>
        </div>
        <div class="h-full w-full flex items-center justify-center">上传</div>
      </div>
    </NUpload>
    <CondorUploadSpace ref="spaceRef" @on-select="onSelect"></CondorUploadSpace>
  </div>
</template>

<style lang="scss" scoped>
.select-btn {
  border: 1px dashed #999999;
  border-top: none;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  &:hover {
    background-color: var(--bg-select-coloe);
    border-color: var(--select-color);
  }
}
</style>
