<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

defineOptions({
  name: 'CondorArray'
});

// 类型定义
interface ArrayItem {
  [key: string]: string;
}

interface ArrayProps {
  value: ArrayItem[] | string | null | undefined;
  header?: boolean;
  keys?: string[];
  labels?: string[];
}

const props = withDefaults(defineProps<ArrayProps>(), {
  header: true,
  keys: () => ['label', 'value'],
  labels: () => ['condor.common.key', 'condor.common.value']
});

// 绑定关系
const emit = defineEmits<{
  (e: 'update:value', value: ArrayItem[]): void;
}>();

const internal = ref<ArrayItem[]>([]);

function normalizeValue(v: ArrayItem[] | string | null | undefined): ArrayItem[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const isSyncing = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.value,
  (v: ArrayItem[] | string | null | undefined) => {
    if (isSyncing.value) return;
    const arr = normalizeValue(v).map((item: ArrayItem) => ({ ...(item || {}) }));
    internal.value = arr;
  },
  { immediate: true }
);

watch(
  internal,
  async (v: ArrayItem[]) => {
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
  const obj = props.keys.reduce((p: Record<string, string>, c: string) => ({ ...p, [c]: '' }), {});
  internal.value.push(obj as ArrayItem);
}

function del(index: number) {
  if (index >= 0 && index < internal.value.length) {
    internal.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="condor-block-list">
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
.condor-block-list {
  width: 100%;
  .left {
    width: calc(100% - 110px);
  }
  .right {
    width: 110px;
  }
}
</style>
