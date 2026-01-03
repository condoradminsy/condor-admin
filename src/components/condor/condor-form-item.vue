<script lang="ts" setup>
import { computed, h } from 'vue';
import {
  NAutoComplete,
  NCascader,
  NCheckbox,
  NCheckboxGroup,
  NColorPicker,
  NDatePicker,
  NDynamicInput,
  NDynamicTags,
  NInput,
  NInputNumber,
  NInputOtp,
  NRadio,
  NRadioGroup,
  NSelect,
  NSlider,
  NSwitch,
  NTimePicker,
  NTreeSelect
} from 'naive-ui';
import CondorArray from '@/components/condor/condor-array.vue';
import CondorSelect from '@/components/condor/condor-select.vue';
import CondorTreeCheck from '@/components/condor/condor-tree-check.vue';
import CondorTreeSelect from '@/components/condor/condor-tree-select.vue';
import CondorDictRadio from '@/components/condor/condor-dict-radio.vue';
import CondorDictSelect from '@/components/condor/condor-dict-select.vue';
import CondroDictCheckbox from '@/components/condor/condor-dict-checkbox.vue';
import CondorUpload from '@/components/condor/condor-upload.vue';
import condorEditor from '@/components/condor/condor-editor.vue';
defineOptions({
  name: 'CondorFormItem'
});
const props = defineProps<{
  column: Condor.Search.Column;
  value: any;
}>();
const emit = defineEmits<{
  (e: 'update:value', value: any): void;
}>();
const value = computed<any>({
  get() {
    return props.value;
  },
  set(val: any) {
    emit('update:value', val);
  }
});
const componentMapping: any = {
  'n-input': NInput,
  'n-input-number': NInputNumber,
  'n-auto-complete': NAutoComplete,
  'n-cascader': NCascader,
  'n-color-picker': NColorPicker,
  'n-checkbox-group': NCheckboxGroup,
  'n-date-picker': NDatePicker,
  'n-dynamic-input': NDynamicInput,
  'n-dynamic-tags': NDynamicTags,
  'n-input-otp': NInputOtp,
  'n-radio-group': NRadioGroup,
  'n-select': NSelect,
  'n-slider': NSlider,
  'n-switch': NSwitch,
  'n-time-picker': NTimePicker,
  'n-tree-select': NTreeSelect,
  'condor-array': CondorArray,
  'condor-select': CondorSelect,
  'condor-tree-check': CondorTreeCheck,
  'condor-tree-select': CondorTreeSelect,
  'condor-dict-radio': CondorDictRadio,
  'condor-dict-select': CondorDictSelect,
  'condor-dict-checkbox': CondroDictCheckbox,
  'condor-upload': CondorUpload,
  'condor-editor': condorEditor
};
// 组件属性
const componentProps = computed(() => {
  const oldProps = {
    ...(props.column.component?.props || {})
  };
  return {
    clearable: true,
    ...oldProps,
    onUpdateValue: (val: any) => {
      value.value = val;
      if (typeof oldProps.onUpdateValue === 'function') {
        oldProps.onUpdateValue(val);
      }
    }
  };
});
// 组件插槽
const componentSlots = computed(() => {
  const slots = {
    ...(props.column.component?.slots || {})
  };
  if (props.column.component?.name === 'n-radio-group') {
    if (props.column.component?.props?.options?.length) {
      slots.default = () =>
        props.column.component.props.options.map((item: any) => {
          return h(NRadio, { value: item.value, label: item.label });
        });
    }
  }
  if (props.column.component?.name === 'n-checkbox-group') {
    if (props.column.component?.props?.options?.length) {
      slots.default = () =>
        props.column.component.props.options.map((item: any) => {
          return h(NCheckbox, { value: item.value, label: item.label });
        });
    }
  }
  return slots;
});

// 当前组件
const currentComponent = computed(() => {
  const name = props.column.component?.name || 'n-input';
  return h(componentMapping[name] || NInput, componentProps.value, componentSlots.value);
});
</script>

<template>
  <component :is="currentComponent" v-model:value="value"></component>
</template>
