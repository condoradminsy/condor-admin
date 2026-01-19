<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { componentList } from './data';
defineOptions({
  name: 'CrudAttribute'
});
const props = defineProps<{
  title: string;
  type: string;
  field: string;
  form: any;
  table: any;
}>();

const emit = defineEmits<{
  (e: 'update:title', value: string): void;
  (e: 'update:field', value: string): void;
  (e: 'update:type', value: string): void;
  (e: 'update:name', value: string): void;
  (e: 'update:form', value: any): void;
  (e: 'update:table', value: any): void;
}>();

const options = [
  {
    label: '不搜索',
    value: -1
  },
  {
    label: '=',
    value: '='
  },
  {
    label: '!=',
    value: '!='
  },
  {
    label: '>',
    value: '>'
  },
  {
    label: '<',
    value: '<'
  },
  {
    label: '>=',
    value: '>='
  },
  {
    label: '<=',
    value: '<='
  },
  {
    label: 'like',
    value: 'like'
  },
  {
    label: 'not like',
    value: 'not like'
  },
  {
    label: 'in',
    value: 'in'
  },
  {
    label: 'not in',
    value: 'not in'
  },
  {
    label: 'between',
    value: 'between'
  },
  {
    label: 'not between',
    value: 'not between'
  },
  {
    label: 'is null',
    value: 'is null'
  },
  {
    label: 'is not null',
    value: 'is not null'
  }
];

const titleValue = computed({
  get() {
    return props.title;
  },
  set(value) {
    emit('update:title', value);
  }
});
const fieldValue = computed({
  get() {
    return props.field;
  },
  set(value) {
    emit('update:field', value);
  }
});
const formValue = ref({ ...props.form });
watch(
  () => props.form,
  () => {
    formValue.value = { ...props.form };
  },
  { deep: true }
);
watch(
  () => formValue.value,
  newVal => {
    try {
      if (JSON.stringify(newVal) !== JSON.stringify(props.form)) {
        emit('update:form', newVal);
      }
    } catch {
      emit('update:form', newVal);
    }
  },
  { deep: true }
);
const tableValue = ref({ ...props.table });
watch(
  () => props.table,
  () => {
    tableValue.value = { ...props.table };
  },
  { deep: true }
);
watch(
  () => tableValue.value,
  newVal => {
    try {
      if (JSON.stringify(newVal) !== JSON.stringify(props.table)) {
        emit('update:table', newVal);
      }
    } catch {
      emit('update:table', newVal);
    }
  },
  { deep: true }
);
function onUpdateValue(_: string, option: any) {
  emit('update:name', option.name);
  emit('update:type', option.type);
}
</script>

<template>
  <div>
    <div class="flex items-center">
      <div class="w-[40px]">组件</div>
      <NSelect
        :value="props.type"
        placeholder="请选择组件类型"
        label-field="name"
        value-field="type"
        :options="componentList"
        :on-update:value="onUpdateValue"
      />
    </div>
    <NDivider title-placement="left">
      <div class="text-sm">基础属性</div>
    </NDivider>
    <NInputGroup>
      <NInputGroupLabel>字段名</NInputGroupLabel>
      <NInput v-model:value="fieldValue" readonly placeholder="请输入字段名称" />
    </NInputGroup>
    <NInputGroup class="my-2">
      <NInputGroupLabel>字段标题</NInputGroupLabel>
      <NInput v-model:value="titleValue" placeholder="请输入字段标题" />
    </NInputGroup>
    <NDivider title-placement="left">
      <div class="text-sm">表单属性</div>
    </NDivider>
    <NInputGroup>
      <NInputGroupLabel>是否表单</NInputGroupLabel>
      <div class="h-[34px] w-full flex items-center border pl-3">
        <NSwitch v-model:value="formValue.is_form" :checked-value="true" :unchecked-value="false" />
      </div>
    </NInputGroup>
    <NInputGroup v-if="props.type === 'text'" class="mt-2">
      <NInputGroupLabel>是否多行</NInputGroupLabel>
      <div class="h-[34px] w-full flex items-center border pl-3">
        <NSwitch v-model:value="formValue.is_textarea" :checked-value="true" :unchecked-value="false" />
      </div>
    </NInputGroup>
    <NInputGroup v-if="props.type === 'number'" class="mt-2">
      <NInputGroupLabel>展示按钮</NInputGroupLabel>
      <div class="h-[34px] w-full flex items-center border pl-3">
        <NSwitch v-model:value="formValue.show_button" :checked-value="true" :unchecked-value="false" />
      </div>
    </NInputGroup>
    <NInputGroup v-if="props.type === 'switch'" class="mt-2">
      <NInputGroupLabel>选中的值</NInputGroupLabel>
      <NInputNumber
        v-model:value="formValue.checked_value"
        class="w-full"
        :show-button="false"
        placeholder="请输入选中的值"
      />
    </NInputGroup>
    <NInputGroup v-if="props.type === 'switch'" class="mt-2">
      <NInputGroupLabel>未选中的值</NInputGroupLabel>
      <NInputNumber
        v-model:value="formValue.unchecked_value"
        class="w-full"
        :show-button="false"
        placeholder="请输入未选中的值"
      />
    </NInputGroup>
    <NInputGroup v-if="props.type === 'upload'" class="mt-2">
      <NInputGroupLabel>最大上传数量</NInputGroupLabel>
      <NInputNumber
        v-model:value="formValue.max_upload"
        class="w-full"
        :show-button="false"
        placeholder="请输入最大上传数量"
      />
    </NInputGroup>
    <NInputGroup v-if="props.type === 'dict'" class="mt-2">
      <NInputGroupLabel>字典类型</NInputGroupLabel>
      <div class="h-[34px] w-full flex items-center border pl-3">
        <NRadioGroup v-model:value="formValue.dict_type">
          <NRadio label="单选" value="condor-dict-radio" />
          <NRadio label="多选" value="condor-dict-checkbox" />
          <NRadio label="下拉" value="condor-dict-select" />
        </NRadioGroup>
      </div>
    </NInputGroup>

    <NInputGroup v-if="props.type === 'dict'" class="mt-2">
      <NInputGroupLabel>关联字典</NInputGroupLabel>
      <CondorSelect
        v-model:value="formValue.dict_code"
        class="w-full"
        placeholder="请选择关联字典"
        url="core/dict-type/selectpage"
        label-field="title"
        key-field="name"
      />
    </NInputGroup>

    <NInputGroup class="mt-2">
      <NInputGroupLabel>默认值</NInputGroupLabel>
      <NInput v-model:value="formValue.value" placeholder="请输入默认值" />
    </NInputGroup>
    <NDivider title-placement="left">
      <div class="text-sm">表格属性</div>
    </NDivider>
    <NInputGroup>
      <NInputGroupLabel>搜索方式</NInputGroupLabel>
      <NSelect v-model:value="tableValue.operator" placeholder="请选择搜索方式" :options="options" />
    </NInputGroup>
    <NInputGroup class="mt-2">
      <NInputGroupLabel>是否展示</NInputGroupLabel>
      <div class="h-[34px] w-full flex items-center border pl-3">
        <NSwitch v-model:value="tableValue.visible" :checked-value="true" :unchecked-value="false" />
      </div>
    </NInputGroup>
  </div>
</template>

<style lang="scss" scoped>
::v-deep(.n-divider:not(.n-divider--vertical)) {
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
