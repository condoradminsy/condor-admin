<script lang="ts" setup>
import { computed, ref } from 'vue';
import { $t } from '@/locales';

defineOptions({
  name: 'CondorModal'
});
const props = withDefaults(
  defineProps<{
    title?: string;
    isDraggable?: boolean;
    width?: string | number;
    cancelText?: string;
    subBtuText?: string;
    height?: string | number;
    showAction?: boolean;
    customClass?: string;
  }>(),
  {
    isDraggable: true,
    width: '800px',
    height: '',
    cancelText: $t('common.cancel'),
    subBtuText: $t('common.confirm'),
    title: '',
    showAction: true,
    customClass: 'condor-modal'
  }
);
const modalTitle = ref(props.title);
const modalType = ref('default');
const emit = defineEmits<{
  (e: 'onOk', type: string): void;
  (e: 'onClose'): void;
}>();

const isModal = ref(false);
const subLoading = ref(false);

const getStyle = computed<any>(() => {
  const style = {
    width: '',
    height: 'auto'
  };
  if (typeof props.width === 'number') {
    style.width = `${props.width}px`;
  } else if (typeof props.width === 'string') {
    style.width = props.width;
  }
  if (props.height) {
    if (typeof props.height === 'number') {
      style.height = `${props.height}px`;
    } else if (typeof props.height === 'string') {
      style.height = props.height;
    }
  }
  return style;
});

function setSubLoading(status: boolean) {
  subLoading.value = status;
}

function open(options: any) {
  if (options?.title) {
    modalTitle.value = options.title;
  }
  if (options?.type) {
    modalType.value = options.type;
  }
  isModal.value = true;
}

function close() {
  isModal.value = false;
  subLoading.value = false;
}

function onCloseModal() {
  isModal.value = false;
  emit('onClose');
}

function handleSubmit() {
  subLoading.value = true;
  emit('onOk', modalType.value);
}
defineExpose({
  open,
  close,
  setSubLoading,
  handleSubmit
});
</script>

<template>
  <NModal
    v-model:show="isModal"
    :draggable="props.isDraggable"
    :style="getStyle"
    :class="props.customClass"
    preset="card"
    :on-after-leave="onCloseModal"
  >
    <template #header>
      <div class="w-full" :class="{ 'cursor-move': isDraggable }">
        {{ modalTitle }}
      </div>
    </template>
    <template #default>
      <slot name="default"></slot>
    </template>
    <template #action>
      <slot name="action">
        <NSpace v-if="props.showAction" justify="end">
          <NButton @click="close">{{ props.cancelText }}</NButton>
          <NButton :loading="subLoading" type="primary" @click="handleSubmit">{{ props.subBtuText }}</NButton>
        </NSpace>
      </slot>
    </template>
  </NModal>
</template>

<style lang="scss"></style>
