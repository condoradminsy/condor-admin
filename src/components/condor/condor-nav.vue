<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import { transformColorWithOpacity } from '@sa/color';
import { useThemeStore } from '@/store/modules/theme';
defineOptions({
  name: 'CondorNav'
});
const props = defineProps<{
  list: { label: string; value: string | number | boolean }[];
  index?: number;
}>();
const navRef = ref<HTMLElement | null>(null);
const active = ref(props.index || 0);
const width = ref(0);
const height = ref(0);
const left = ref(5);
const themeStore = useThemeStore();
const bgColor1 = transformColorWithOpacity(themeStore.themeColor, 0.1);
const bgColor2 = transformColorWithOpacity(themeStore.themeColor, 0.3, '#000000');
interface Emits {
  (e: 'change', index: number, item: { label: string; value: string | number | boolean }): void;
}
const emit = defineEmits<Emits>();
const renderNavBar = () => {
  if (navRef.value) {
    const activeEl = navRef.value.children[active.value] as HTMLElement;
    if (activeEl) {
      width.value = activeEl.offsetWidth;
      height.value = activeEl.offsetHeight;
      left.value = activeEl.offsetLeft;
    }
  }
};
onMounted(() => {
  nextTick(renderNavBar);
});
const changeNav = (index: number) => {
  active.value = index;
  nextTick(renderNavBar);
  emit('change', index, props.list[index]);
};
</script>

<template>
  <div class="condor-nav-box">
    <div
      ref="navRef"
      class="condor-nav inline-flex items-center rounded-md bg-[--bg-condor-nav1] p-[5px] before:bg-[--bg-condor-nav-before] dark:bg-[--bg-condor-nav2] dark:before:bg-black"
      :style="{
        '--width': width + 'px',
        '--height': height + 'px',
        '--left': left + 'px',
        '--bg-condor-nav1': bgColor1,
        '--bg-condor-nav2': bgColor2,
        '--bg-condor-nav-before': themeStore.themeColor
      }"
    >
      <div
        v-for="(item, i) in props.list"
        :key="i"
        :class="{ active: active === i }"
        class="text-grey-600 relative z-10 mr-2 cursor-pointer rounded-md px-[8px] py-[5px]"
        @click="changeNav(i)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.condor-nav-box {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 10px;
}
.condor-nav {
  position: relative;
  border-radius: 0.375rem;
  white-space: nowrap;
  min-width: max-content;
  &::before {
    border-radius: 0.375rem;
    width: var(--width);
    height: var(--height);
    content: '';
    position: absolute;
    left: var(--left);
    top: 5px;
    z-index: 1;
    transition: all 0.3s ease;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
  }
  .active {
    color: #ffffff;
  }
}
</style>
