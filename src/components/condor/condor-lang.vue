<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCondorStore } from '@/store/modules/condor';
const props = defineProps<{
  value: string;
}>();
const condorStore = useCondorStore();
const lang = ref(props.value);
const emit = defineEmits<{
  (e: 'update:value', value: string): void;
  (e: 'updateValue', value: string): void;
}>();
function changeLang(value: string) {
  lang.value = value;
  emit('update:value', value);
  emit('updateValue', value);
}
const langLabel = computed(() => {
  return condorStore.languages.find((item: any) => item.key === lang.value)?.label;
});
</script>

<template>
  <div class="condor-lang">
    <NDropdown :value="lang" :options="condorStore.languages" trigger="hover" @select="changeLang">
      <div>
        <ButtonIcon :tooltip-content="$t('condor.component.content_language_switching')" tooltip-placement="top">
          <SvgIcon icon="heroicons:language" />
          <span class="ml-[-5px] text-sm font-300">{{ langLabel }}</span>
        </ButtonIcon>
      </div>
    </NDropdown>
  </div>
</template>
