<script lang="ts" setup>
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import CrudHeader from './modules/header.vue';
import CrudAttribute from './modules/attribute.vue';
// import CrudComponent from './modules/component.vue';
const formList = ref<any>([]);
const formIndex = ref(0);
const remove = (index: number | string) => {
  formIndex.value = 0;
  formList.value.splice(index, 1);
};
const updateForm = (data: any) => {
  formList.value[formIndex.value].form = { ...data };
};
const updateTable = (data: any) => {
  formList.value[formIndex.value].table = { ...data };
};
const fieldChange = (data: any) => {
  formList.value = [];
  data.forEach((item: any) => {
    const row = {
      id: `${item.id}_${Math.random().toString(36).slice(2)}`,
      field: item.field,
      title: item.title,
      name: '文本',
      type: 'text',
      form: {
        is_form: true,
        is_textarea: false,
        show_button: true,
        checked_value: 1,
        unchecked_value: 0,
        max_upload: 1,
        dict_type: 'condor-dict-radio',
        dict_code: ''
      },
      table: {
        operator: '=',
        visible: true
      }
    };
    if (['id', 'createtime', 'updatetime'].includes(item.field)) {
      row.form.is_form = false;
    }
    if (['int', 'bigint', 'tinyint', 'float', 'decimal'].includes(item.type)) {
      row.type = 'number';
      row.name = '数字';
    }
    // 富文本
    else if (['content'].includes(item.field)) {
      row.type = 'editor';
      row.name = '富文本';
    }
    formList.value.push(row);
  });
};
</script>

<template>
  <div>
    <div class="rounded-md bg-white px-3 pt-3 dark:bg-black">
      <CrudHeader :form-list="formList" @change="fieldChange" />
    </div>
    <NGrid cols="1 968:9" :x-gap="12">
      <!--
 <NGridItem :span="2" class="my-3 rounded-md bg-white p-3 dark:bg-black">
        <CrudComponent />
      </NGridItem> 
-->
      <NGridItem :span="6" class="my-3 rounded-md bg-white dark:bg-black">
        <VueDraggable
          v-model="formList"
          handle=".handle"
          :animation="150"
          group="people"
          ghost-class="ghost"
          class="min-h-[50vh]"
        >
          <div
            v-for="(item, index) in formList"
            :key="item.id"
            class="form-item flex items-center justify-between"
            :class="{ active: formIndex === Number(index), 'mt-[5px]': index !== 0 }"
            @click="formIndex = Number(index)"
          >
            <div class="flex-1">
              <NSpace vertical>
                <NInputGroup>
                  <NInput v-model:value="item.field" readonly placeholder="请输入字段名称">
                    <template #prefix>
                      <div class="pr-1 text-[#7B7B7B]">字段名</div>
                    </template>
                  </NInput>
                  <NInput v-model:value="item.title" placeholder="请输入字段标题">
                    <template #prefix>
                      <div class="pr-1 text-[#7B7B7B]">字段标题</div>
                    </template>
                  </NInput>
                </NInputGroup>
              </NSpace>
            </div>
            <div class="right items-top flex justify-center pl-3">
              <NButton size="small" type="error" @click.stop="remove(index)">
                <icon-material-symbols-delete-outline></icon-material-symbols-delete-outline>
              </NButton>
              <NButton size="small" type="primary" class="handle ml-2">
                <icon-mynaui-move-solid :font-size="16"></icon-mynaui-move-solid>
              </NButton>
            </div>
          </div>
        </VueDraggable>
      </NGridItem>
      <NGridItem :span="3" class="my-3 rounded-md bg-white px-3 py-2 dark:bg-black">
        <CrudAttribute
          v-if="formList.length"
          v-model:title="formList[formIndex].title"
          v-model:field="formList[formIndex].field"
          v-model:type="formList[formIndex].type"
          :form="formList[formIndex].form"
          :table="formList[formIndex].table"
          @update:name="value => (formList[formIndex].name = value)"
          @update:form="updateForm"
          @update:table="updateTable"
        />
        <div v-else class="h-full flex items-center justify-center text-[#7B7B7B]">请先选中字段</div>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style lang="scss" scoped>
.form-item {
  border: 1px dashed #ccc;
  padding: 10px;
  border-radius: 5px;
  &.active {
    border-color: #1890ff;
  }
}
</style>
