<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useForm } from '@/hooks/condor/form';
import { $t, getLocale } from '@/locales';

defineOptions({
  name: 'CondorLayerForm'
});
const props = withDefaults(
  defineProps<{
    isDraggable?: boolean;
    width?: string | number;
    cancelText?: string;
    subBtuText?: string;
    columns: any[];
    formLabelWidth?: string | number;
    colSpan?: number;
    urls: any;
    multilingualFields?: string[];
  }>(),
  {
    isDraggable: true,
    width: '800px',
    cancelText: $t('common.cancel'),
    subBtuText: $t('common.confirm'),
    formLabelWidth: '100px',
    colSpan: 24,
    multilingualFields: () => []
  }
);
const formModalRef = ref();
const formRef = ref();
const emit = defineEmits<{
  (e: 'onOk'): void;
  (e: 'onClose'): void;
}>();

const currentLocale = ref(getLocale().toLocaleLowerCase());
// 弹窗打开，更新当前语言
const onOpenModal = () => {
  currentLocale.value = getLocale().toLocaleLowerCase();
};
const { form, rules, fields, hasCondition, submitForm, resetForm, setForm } = useForm({
  columns: computed(() => props.columns),
  urls: props.urls,
  multilingualFields: props.multilingualFields,
  formRef,
  formModalRef,
  successFn: () => {
    emit('onOk');
  }
});

const onClose = () => {
  resetForm();
  emit('onClose');
};

defineExpose({
  open(value: any) {
    formModalRef.value.open(value);
  },
  setForm
});
</script>

<template>
  <CondorModal
    ref="formModalRef"
    :is-multilingual="props.multilingualFields && props.multilingualFields.length > 0"
    :is-draggable="props.isDraggable"
    :width="props.width"
    :cancel-text="props.cancelText"
    :sub-btu-text="props.subBtuText"
    @on-ok="submitForm"
    @on-close="onClose"
    @on-open="onOpenModal"
  >
    <template #multilingual>
      <CondorLang v-model:value="currentLocale"></CondorLang>
    </template>
    <slot name="form">
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" :label-width="props.formLabelWidth">
        <NGrid :cols="24" :x-gap="24">
          <template v-for="(item, index) in fields" :key="index">
            <NFormItemGi
              v-if="hasCondition(item)"
              :span="item.span || props.colSpan"
              :label="typeof item.title === 'function' ? item.title(form) : item.title"
              :path="item.key"
            >
              <slot :name="`form-${item.key}`">
                <div v-if="props.multilingualFields?.includes(item.key)" class="w-full">
                  <CondorFormItem v-model:value="form[item.key][currentLocale]" :column="item"></CondorFormItem>
                  <div v-if="item.tips" class="pt-1 text-xs text-gray-500">
                    <icon-ri-information-line class="inline-block" />
                    <span class="ml-1">{{ typeof item.tips === 'function' ? item.tips(form) : item.tips }}</span>
                  </div>
                </div>
                <div v-else class="w-full">
                  <CondorFormItem v-model:value="form[item.key]" :column="item"></CondorFormItem>
                  <div v-if="item.tips" class="pt-1 text-xs text-gray-500">
                    <icon-ri-information-line class="inline-block" />
                    <span class="ml-1">{{ typeof item.tips === 'function' ? item.tips(form) : item.tips }}</span>
                  </div>
                </div>
              </slot>
            </NFormItemGi>
          </template>
        </NGrid>
      </NForm>
    </slot>
  </CondorModal>
</template>
