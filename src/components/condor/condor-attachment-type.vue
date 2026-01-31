<script lang="ts" setup>
import { computed, h, ref } from 'vue';
import { NInput } from 'naive-ui';
import { transformColorWithOpacity } from '@sa/color';
import { request } from '@/service/request';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';
defineOptions({
  name: 'CondorAttachmentType'
});
const themeStore = useThemeStore();
const bgColor1 = transformColorWithOpacity(themeStore.themeColor, 0.1);
const bgColor2 = transformColorWithOpacity(themeStore.themeColor, 0.3, '#000000');
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
  add: '/core/attachment-type/add',
  edit: '/core/attachment-type/edit',
  del: '/core/attachment-type/del',
  index: '/core/attachment-type/index'
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
        list.value = data;
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
    title: row.id ? $t('condor.component.edit_group') : $t('condor.component.add_group'),
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
    positiveText: $t('common.confirm'),
    negativeText: $t('common.cancel'),
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
  <!-- eslint-disable vue/no-static-inline-styles -->
  <div
    class="mb-2 border rounded-md bg-white dark:border-0 dark:bg-[--bg-attachment-dark]"
    :style="{ '--bg-attachment-dark': '#26262A' }"
  >
    <div
      class="flex items-center justify-between bg-[--bg-attachment-type] py-[5px] pl-3 pr-1 dark:bg-[--bg-dark-attachment-type]"
      :style="{ '--bg-attachment-type': bgColor1, '--bg-dark-attachment-type': bgColor2 }"
    >
      <div>{{ $t('condor.component.group') }}</div>
      <div class="flex items-center">
        <!-- eslint-disable vue/no-static-inline-styles -->
        <NTooltip trigger="hover" style="padding: 5px 8px">
          <template #trigger>
            <NButton quaternary size="small" circle @click="getList">
              <icon-solar-refresh-bold class="cursor-pointer text-18px" :class="{ 'animate-spin': isLoading }" />
            </NButton>
          </template>
          {{ $t('common.refresh') }}
        </NTooltip>
        <!-- eslint-disable vue/no-static-inline-styles -->
        <NTooltip trigger="hover" style="padding: 5px 8px">
          <template #trigger>
            <NButton quaternary size="small" circle @click="addOrEdit({})">
              <icon-material-symbols-add-2-rounded class="cursor-pointer text-18px" />
            </NButton>
          </template>
          {{ $t('condor.common.add') }}
        </NTooltip>
      </div>
    </div>
    <div class="w-full p-2">
      <NRadioGroup v-model:value="value" class="w-full">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="mb-2 w-full flex items-center justify-between border rounded-sm px-2 py-1 dark:border-[#585757]"
        >
          <NRadio :value="item.id">
            <span>{{ item.name }}</span>
          </NRadio>
          <div v-if="item.id" class="flex items-center space-x-2">
            <NButton size="small" text type="primary" @click="addOrEdit(item)">
              <icon-ic-baseline-edit :font-size="16"></icon-ic-baseline-edit>
            </NButton>
            <NPopconfirm placement="top" confirm-type="error" @positive-click="toDel(item.id)">
              <template #trigger>
                <NButton size="small" text type="error">
                  <icon-material-symbols-delete-outline :font-size="16"></icon-material-symbols-delete-outline>
                </NButton>
              </template>
              <div class="text-xs">{{ $t('condor.component.you_want_to_delete_the_group') }}</div>
            </NPopconfirm>
          </div>
        </div>
      </NRadioGroup>
    </div>
  </div>
</template>
