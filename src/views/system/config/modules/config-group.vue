<script setup lang="ts">
import { ref } from 'vue';
import { request } from '@/service/request';
import { useThemeStore } from '@/store/modules/theme';
import { $t } from '@/locales';

const themeStore = useThemeStore();
const groupRef = ref();
const activeId = ref(0);
const groupList = ref<
  {
    id: number;
    name: string;
    code: string;
    remark: string;
  }[]
>([]);
const urls = {
  add: 'core/config-group/add',
  edit: 'core/config-group/edit',
  del: 'core/config-group/del',
  index: 'core/config-group/index'
};
const emit = defineEmits<{
  (e: 'update:active', value: any): void;
}>();
const getGroupList = () => {
  request({
    url: urls.index,
    method: 'POST'
  }).then(({ data, error }) => {
    if (error) return;
    groupList.value = data;
    if (data.length > 0 && !activeId.value) {
      activeId.value = data[0].id;
      emit('update:active', data[0]);
    }
  });
};
getGroupList();
const groupColumns = [
  {
    key: 'name',
    title() {
      return $t('system.config.name');
    },
    rules: [
      {
        required: true,
        message() {
          return $t('system.config.name_required');
        }
      }
    ]
  },
  {
    key: 'code',
    title() {
      return $t('system.config.code');
    },
    rules: [
      {
        required: true,
        message() {
          return $t('system.config.code_required');
        }
      }
    ],
    component: {
      props: {
        allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)
      }
    }
  },
  {
    key: 'remark',
    title() {
      return $t('system.config.remark');
    }
  }
];

const selectGroup = (row: any) => {
  activeId.value = row.id;
  emit('update:active', row);
};

const edit = (row: any) => {
  groupRef.value.setForm(row, 'id');
  groupRef.value.open({
    type: 'edit',
    title: $t('system.config.update_group'),
    row
  });
};

const toDel = (id: number) => {
  request({
    url: urls.del,
    method: 'POST',
    data: {
      ids: [id]
    }
  }).then(({ error }) => {
    if (!error) {
      if (activeId.value === id) {
        activeId.value = 0;
      }
      getGroupList();
    }
  });
};
</script>

<template>
  <div class="flex items-center justify-between p-2">
    <div>{{ $t('system.config.config_group') }}</div>
    <!-- eslint-disable -->
    <NTooltip style="padding: 5px 8px">
      <template #trigger>
        <NButton
          size="small"
          circle
          type="primary"
          @click="groupRef.open({ type: 'add', title: $t('system.config.add_group') })"
        >
          <icon-material-symbols-add-2
            :font-size="16"
          ></icon-material-symbols-add-2>
        </NButton>
      </template>
      <div class="text-xs">{{ $t('system.config.add_group') }}</div>
    </NTooltip>
  </div>
  <div
    class="flex items-center justify-between border-b py-2 pl-3 pr-2 dark:border-[#303133]" 
    :class="{ 'border-t':index === 0 }"
    v-for="(item, index) in groupList"
    :key="item.id"
  >
    <div
      class="cursor-pointer py-[2px] px-2 border rounded-md"
      :style="{ '--text-color': themeStore.themeColor }"
      :class="{
        'border-[--text-color]': item.id === activeId,
        'border-white': !themeStore.darkMode && item.id !== activeId,
        'border-[#303133]': themeStore.darkMode && item.id !== activeId
      }"
      @click="selectGroup(item)"
    >
      <span>{{ item.name }}</span>
      <span class="text-xs">({{ item.code }})</span>
    </div>
    <div class="flex space-x-2">
      <NButton size="small" text type="primary" @click="edit(item)">
        <icon-ic-baseline-edit :font-size="14"></icon-ic-baseline-edit>
      </NButton>
      <NPopconfirm
        placement="top"
        confirm-type="error"
        @positive-click="toDel(item.id)"
      >
        <template #trigger>
          <NButton size="small" text type="error">
            <icon-material-symbols-delete-outline
              :font-size="14"
            ></icon-material-symbols-delete-outline>
          </NButton>
        </template>
        <div class="text-xs">{{ $t('system.config.delete_group_tips') }}</div>
      </NPopconfirm>
    </div>
  </div>
  <!-- 分组表单 -->
  <CondorLayerForm
    ref="groupRef"
    :columns="groupColumns"
    :urls="urls"
    @on-ok="getGroupList"
  ></CondorLayerForm>
</template>
