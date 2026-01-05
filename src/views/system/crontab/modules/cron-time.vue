<script lang="ts" setup>
import { ref, watch } from 'vue';
const props = withDefaults(
  defineProps<{
    value: any;
    format?: string;
  }>(),
  {
    format: 'string'
  }
);
const emit = defineEmits<{
  (e: 'update:value', val: any): void;
}>();
function defaultCron() {
  return {
    type: 1,
    month: 1,
    day: 1,
    week: 0,
    hour: null,
    minute: null,
    second: null
  };
}

function parseValue(v: any) {
  try {
    if (!v) return defaultCron();
    return typeof v === 'string' ? JSON.parse(v) : v;
  } catch {
    return defaultCron();
  }
}

const cron_value = ref(parseValue(props.value));

watch(
  () => props.value,
  v => {
    cron_value.value = parseValue(v);
  }
);

watch(
  cron_value,
  val => {
    emit('update:value', props.format === 'string' ? JSON.stringify(val) : val);
  },
  { deep: true }
);

const cronOptions1 = [
  {
    label: '每天',
    value: 1
  },
  {
    label: '每小时',
    value: 2
  },
  {
    label: 'N小时',
    value: 3
  },
  {
    label: 'N分钟',
    value: 4
  },
  {
    label: 'N秒',
    value: 5
  },
  {
    label: '每周',
    value: 6
  },
  {
    label: '每月',
    value: 7
  },
  {
    label: '每年',
    value: 8
  }
];
const cronOptions2 = [
  {
    label: '周一',
    value: 1
  },
  {
    label: '周二',
    value: 2
  },
  {
    label: '周三',
    value: 3
  },
  {
    label: '周四',
    value: 4
  },
  {
    label: '周五',
    value: 5
  },
  {
    label: '周六',
    value: 6
  },
  {
    label: '周日',
    value: 0
  }
];
</script>

<template>
  <div>
    <NSpace>
      <NSelect v-model:value="cron_value.type" class="w-[100px]" :options="cronOptions1" placeholder="请选择" />
      <template v-if="cron_value.type == 8">
        <NInputNumber v-model:value="cron_value.month" :min="1" :max="12" :show-button="false" class="w-[90px]">
          <template #suffix>月</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type > 6">
        <NInputNumber v-model:value="cron_value.day" :min="1" :max="31" :show-button="false" class="w-[90px]">
          <template #suffix>日</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type == 6">
        <NSelect v-model:value="cron_value.week" class="w-[100px]" :options="cronOptions2" placeholder="请选择" />
      </template>
      <template v-if="[1, 3, 6, 7, 8].includes(cron_value.type)">
        <NInputNumber v-model:value="cron_value.hour" :min="0" :max="23" :show-button="false" class="w-[90px]">
          <template #suffix>时</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type != 5">
        <NInputNumber v-model:value="cron_value.minute" :min="0" :max="59" :show-button="false" class="w-[90px]">
          <template #suffix>分</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type == 5">
        <NInputNumber v-model:value="cron_value.second" :min="0" :max="59" :show-button="false" class="w-[90px]">
          <template #suffix>秒</template>
        </NInputNumber>
      </template>
    </NSpace>
  </div>
</template>
