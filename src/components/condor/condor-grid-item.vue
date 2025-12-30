<script setup lang="ts">
import type { Ref } from 'vue';
import { computed, inject, ref, useAttrs, watch } from 'vue';
interface Props {
  offset?: number;
  span?: number;
  suffix?: boolean;
  xs?: Condor.Grid.Responsive;
  sm?: Condor.Grid.Responsive;
  md?: Condor.Grid.Responsive;
  lg?: Condor.Grid.Responsive;
  xl?: Condor.Grid.Responsive;
}
const props = withDefaults(defineProps<Props>(), {
  offset: 0,
  span: 1,
  suffix: false,
  xs: undefined,
  sm: undefined,
  md: undefined,
  lg: undefined,
  xl: undefined
});

const attrs = useAttrs() as any;
const isShow = ref(true);

// 注入断点
const breakPoint = inject<Ref<Condor.Grid.BreakPoint>>('breakPoint', ref('xl'));
const shouldHiddenIndex = inject<Ref<number>>('shouldHiddenIndex', ref(-1));
watch(
  () => [shouldHiddenIndex.value, breakPoint.value],
  n => {
    if (attrs.index) {
      isShow.value = !(n[0] !== -1 && Math.trunc(attrs.index) >= Number(n[0]));
    }
  },
  { immediate: true }
);

const gap = inject('gap', 0);
const cols = inject<Ref<number>>('cols', ref(4));
const style = computed(() => {
  const span = props[breakPoint.value]?.span ?? props.span;
  const offset = props[breakPoint.value]?.offset ?? props.offset;
  if (props.suffix) {
    return {
      gridColumnStart: cols.value - span - offset + 1,
      gridColumnEnd: `span ${span + offset}`,
      marginLeft: offset !== 0 ? `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})` : 'unset'
    };
  }
  return {
    gridColumn: `span ${span + offset > cols.value ? cols.value : span + offset}/span ${
      span + offset > cols.value ? cols.value : span + offset
    }`,
    marginLeft: offset !== 0 ? `calc(((100% + ${gap}px) / ${span + offset}) * ${offset})` : 'unset'
  };
});
</script>

<template>
  <div v-show="isShow" :style="style">
    <slot></slot>
  </div>
</template>
