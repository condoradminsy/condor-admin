<script lang="ts" setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
const authStore = useAuthStore();
const props = defineProps<{
  permission: string | string[] | undefined;
}>();
const permissions = computed(() => authStore.userInfo.buttons);
const showSlot = computed(() => authStore.hasPermission(props.permission));
</script>

<template>
  <slot v-if="showSlot" :user-permisstions="permissions"></slot>
</template>
