<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import { NInput } from 'naive-ui';
import { transformColorWithOpacity } from '@sa/color';
import { request } from '@/service/request';
import { useThemeStore } from '@/store/modules/theme';
const themeStore = useThemeStore();
const bgColor = transformColorWithOpacity(themeStore.themeColor, 0.1);
const props = withDefaults(
  defineProps<{
    value?: number;
  }>(),
  {
    value: 0
  }
);
const emit = defineEmits<{
  (e: 'update:value', value: number): void;
}>();
const value = computed({
  get() {
    return props.value;
  },
  set(val) {
    emit('update:value', val);
  }
});
const urls = {
  add: 'core/attachment-type/add',
  edit: 'core/attachment-type/edit',
  del: 'core/attachment-type/del',
  index: 'core/attachment-type/index'
};
const isLoading = ref(false);
const list = ref<any>([]);
const getList = () => {
  isLoading.value = true;
  request({
    url: urls.index,
    method: 'post',
    data: {
      limit: 500
    }
  })
    .then(({ data, error }) => {
      if (!error) {
        list.value = [
          {
            id: 0,
            name: '未分组'
          },
          ...data.list
        ];
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
};
getList();
const addOrEdit = (row: any) => {
  const name = ref(row.name || null);
  const d: any = window.$dialog?.create({
    title: row.id ? '编辑分组' : '添加分组',
    content: () => {
      return h(
        'div',
        {
          class: 'py-2'
        },
        {
          default: () => [
            h(NInput, {
              value: name.value,
              onUpdateValue: val => {
                name.value = val;
              }
            })
          ]
        }
      );
    },
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      d.loading = true;
      return new Promise((resolve, reject) => {
        request({
          url: row.id ? urls.edit : urls.add,
          method: 'post',
          data: {
            name: name.value,
            id: row.id
          }
        })
          .then(({ error }) => {
            if (!error) {
              getList();
              resolve(true);
            } else {
              d.loading = false;
              reject(error);
            }
          })
          .catch(reject);
      });
    }
  });
};
const toDel = (id: number) => {
  request({
    url: urls.del,
    method: 'post',
    data: {
      id
    }
  }).then(({ error }) => {
    if (!error) {
      getList();
    }
  });
};
</script>

<template>
  <div class="mb-2 border rounded-md bg-white">
    <div
      class="flex items-center justify-between bg-[--bg-attachment-type] py-[5px] pl-3 pr-1"
      :style="{ '--bg-attachment-type': bgColor }"
    >
      <div>分组</div>
      <div class="flex items-center">
        <!-- eslint-disable vue/no-static-inline-styles -->
        <NTooltip trigger="hover" style="padding: 5px 8px">
          <template #trigger>
            <NButton quaternary size="small" circle @click="getList">
              <icon-solar-refresh-bold class="cursor-pointer text-18px" :class="{ 'animate-spin': isLoading }" />
            </NButton>
          </template>
          刷新
        </NTooltip>
        <!-- eslint-disable vue/no-static-inline-styles -->
        <NTooltip trigger="hover" style="padding: 5px 8px">
          <template #trigger>
            <NButton quaternary size="small" circle @click="addOrEdit({})">
              <icon-material-symbols-add-2-rounded class="cursor-pointer text-18px" />
            </NButton>
          </template>
          添加
        </NTooltip>
      </div>
    </div>
    <div class="w-full p-2">
      <NRadioGroup v-model:value="value" class="w-full">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="mb-2 w-full flex items-center justify-between border rounded-sm px-2 py-1"
        >
          <NRadio :value="item.id">
            <span>{{ item.name }}</span>
          </NRadio>
          <div class="flex items-center space-x-2">
            <NButton size="small" text type="primary" @click="addOrEdit(item)">
              <icon-ic-baseline-edit :font-size="16"></icon-ic-baseline-edit>
            </NButton>
            <NPopconfirm placement="top" confirm-type="error" @positive-click="toDel(item.id)">
              <template #trigger>
                <NButton size="small" text type="error">
                  <icon-material-symbols-delete-outline :font-size="16"></icon-material-symbols-delete-outline>
                </NButton>
              </template>
              <div class="text-xs">确认删除分组嘛？</div>
            </NPopconfirm>
          </div>
        </div>
      </NRadioGroup>
    </div>
  </div>
</template>
