<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
defineOptions({
  name: 'CondorArray'
});
const props = withDefaults(
  defineProps<{
    value: any[];
    header?: boolean;
    keys?: string[];
    labels?: string[];
  }>(),
  {
    header: true,
    keys: () => ['label', 'value'],
    labels: () => ['condor.common.key', 'condor.common.value']
  }
);
// 绑定关系
const emit = defineEmits<{
  (e: 'update:value', value: any): void;
}>();

const internal = ref<{ [key: string]: any }[]>([]);

function normalizeValue(v: any) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
}

const isSyncing = ref(false);
let timer: any = null;

watch(
  () => props.value,
  v => {
    if (isSyncing.value) return;
    const arr = normalizeValue(v).map((item: any) => ({ ...(item || {}) }));
    internal.value = arr;
  },
  { immediate: true }
);

watch(
  internal,
  async v => {
    isSyncing.value = true;
    emit('update:value', v);
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      isSyncing.value = false;
    }, 100);
  },
  { deep: true }
);

function add() {
  const obj = props.keys.reduce((p: any, c: string) => ({ ...p, [c]: '' }), {});
  internal.value.push(obj);
}

function del(index: number) {
  if (index >= 0 && index < internal.value.length) {
    internal.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="dx-block-list">
    <div v-if="props.header" class="flex justify-between">
      <NGrid x-gap="12" :cols="props.labels.length" class="mb-2">
        <NGi v-for="(title, key) in props.labels" :key="key">{{ $t(title) }}</NGi>
      </NGrid>
      <div class="right pl-3"></div>
    </div>
    <VueDraggable v-model="internal" handle=".handle" :options="{ animation: 200 }">
      <div v-for="(element, index) in internal" :key="index" class="mb-2 flex justify-between">
        <NGrid x-gap="12" :cols="props.keys.length">
          <NGi v-for="(row, rowIndex) in props.keys" :key="rowIndex">
            <NInput v-model:value="element[row]" type="text" />
          </NGi>
        </NGrid>
        <div class="right flex items-center justify-center pl-3">
          <NButton size="small" type="error" @click="del(index)">
            <icon-material-symbols-delete-outline></icon-material-symbols-delete-outline>
          </NButton>
          <NButton size="small" type="primary" class="handle ml-2">
            <icon-mynaui-move-solid :font-size="16"></icon-mynaui-move-solid>
          </NButton>
        </div>
      </div>
    </VueDraggable>
    <div class="flex justify-end">
      <NButton type="primary" size="small" @click="add">
        <icon-material-symbols-add :font-size="17"></icon-material-symbols-add>
        <span>{{ $t('condor.common.append') }}</span>
      </NButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dx-block-list {
  width: 100%;
  .left {
    width: calc(100% - 110px);
  }
  .right {
    width: 110px;
  }
}
</style>
