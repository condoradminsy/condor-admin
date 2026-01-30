<script lang="ts" setup>
import { ref, watch } from 'vue';
import { $t } from '@/locales';
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
    label() {
      return $t('system.crontab.every_day');
    },
    value: 1
  },
  {
    label() {
      return $t('system.crontab.every_hour');
    },
    value: 2
  },
  {
    label() {
      return $t('system.crontab.n_hour');
    },
    value: 3
  },
  {
    label() {
      return $t('system.crontab.n_minute');
    },
    value: 4
  },
  {
    label() {
      return $t('system.crontab.n_second');
    },
    value: 5
  },
  {
    label() {
      return $t('system.crontab.every_week');
    },
    value: 6
  },
  {
    label() {
      return $t('system.crontab.every_month');
    },
    value: 7
  },
  {
    label() {
      return $t('system.crontab.every_year');
    },
    value: 8
  }
];
const cronOptions2 = [
  {
    label() {
      return $t('system.crontab.monday');
    },
    value: 1
  },
  {
    label() {
      return $t('system.crontab.tuesday');
    },
    value: 2
  },
  {
    label() {
      return $t('system.crontab.wednesday');
    },
    value: 3
  },
  {
    label() {
      return $t('system.crontab.thursday');
    },
    value: 4
  },
  {
    label() {
      return $t('system.crontab.friday');
    },
    value: 5
  },
  {
    label() {
      return $t('system.crontab.saturday');
    },
    value: 6
  },
  {
    label() {
      return $t('system.crontab.sunday');
    },
    value: 0
  }
];
</script>

<template>
  <div>
    <NSpace>
      <NSelect v-model:value="cron_value.type" class="w-[130px]" :options="cronOptions1" />
      <template v-if="cron_value.type == 8">
        <NInputNumber v-model:value="cron_value.month" :min="1" :max="12" :show-button="false" class="w-[110px]">
          <template #suffix>{{ $t('system.crontab.month') }}</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type > 6">
        <NInputNumber v-model:value="cron_value.day" :min="1" :max="31" :show-button="false" class="w-[110px]">
          <template #suffix>{{ $t('system.crontab.day') }}</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type == 6">
        <NSelect v-model:value="cron_value.week" class="w-[110px]" :options="cronOptions2" />
      </template>
      <template v-if="[1, 3, 6, 7, 8].includes(cron_value.type)">
        <NInputNumber v-model:value="cron_value.hour" :min="0" :max="23" :show-button="false" class="w-[110px]">
          <template #suffix>{{ $t('system.crontab.hour') }}</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type != 5">
        <NInputNumber v-model:value="cron_value.minute" :min="0" :max="59" :show-button="false" class="w-[110px]">
          <template #suffix>{{ $t('system.crontab.minute') }}</template>
        </NInputNumber>
      </template>
      <template v-if="cron_value.type == 5">
        <NInputNumber v-model:value="cron_value.second" :min="0" :max="59" :show-button="false" class="w-[110px]">
          <template #suffix>{{ $t('system.crontab.second') }}</template>
        </NInputNumber>
      </template>
    </NSpace>
  </div>
</template>
