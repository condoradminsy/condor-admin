<script setup lang="ts">
import {
  type VNode,
  type VNodeArrayChildren,
  computed,
  onActivated,
  onBeforeMount,
  onDeactivated,
  onMounted,
  onUnmounted,
  provide,
  ref,
  useSlots,
  watch
} from 'vue';
defineOptions({
  name: 'CondorGrid'
});
interface Props {
  cols?: number | Record<Condor.Grid.BreakPoint, number>;
  collapsed?: boolean;
  collapsedRows?: number;
  gap?: [number, number] | number;
}
const props = withDefaults(defineProps<Props>(), {
  cols: () => ({ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }),
  collapsed: false,
  collapsedRows: 1,
  gap: 0
});
// 注入响应式断点
const breakPoint = ref<Condor.Grid.BreakPoint>('xl');
// 监听屏幕变化
const getBreakPoint = (width: number) => {
  if (width < 768) return 'xs';
  if (width >= 768 && width < 992) return 'sm';
  if (width >= 992 && width < 1200) return 'md';
  if (width >= 1200 && width < 1920) return 'lg';
  return 'xl';
};

const resize = (e: UIEvent) => {
  breakPoint.value = getBreakPoint((e.target as Window).innerWidth);
};

onMounted(() => {
  resize({ target: { innerWidth: window.innerWidth } } as any);
  window.addEventListener('resize', resize);
});
onActivated(() => {
  resize({ target: { innerWidth: window.innerWidth } } as any);
  window.addEventListener('resize', resize);
});
onUnmounted(() => {
  window.removeEventListener('resize', resize);
});
onDeactivated(() => {
  window.removeEventListener('resize', resize);
});

// 注入 gap 间距
provide('gap', Array.isArray(props.gap) ? props.gap[0] : props.gap);
provide('breakPoint', breakPoint);

// 注入要开始折叠的 index
const hiddenIndex = ref(-1);
provide('shouldHiddenIndex', hiddenIndex);

// 注入 cols
const cols = computed(() => {
  if (typeof props.cols === 'object') return props.cols[breakPoint.value] ?? props.cols;
  return props.cols;
});
provide('cols', cols);

const slots = useSlots().default!();
// 寻找需要开始折叠的字段 index
const findIndex = () => {
  const fields: VNodeArrayChildren = [];
  const suffix: any = null;
  slots.forEach((slot: any) => {
    // eslint-disable-next-line no-underscore-dangle
    if (typeof slot.type === 'object' && slot.type.__name === 'condor-grid-item') {
      if (slot.props?.suffix === undefined) {
        fields.push(slot);
      } else {
        // suffix = slot;
      }
    }
    if (typeof slot.type === 'symbol' && Array.isArray(slot.children))
      slot.children.forEach((child: any) => fields.push(child));
  });

  // 计算 suffix 所占用的列
  let suffixCols = 0;
  if (suffix) {
    suffixCols =
      (suffix.props![breakPoint.value]?.span ?? suffix.props?.span ?? 1) +
      (suffix.props![breakPoint.value]?.offset ?? suffix.props?.offset ?? 0);
  }
  try {
    let find = false;
    fields.reduce((prev, current, index) => {
      const currentProps = (current as VNode)!.props ?? {};
      const newValue =
        prev +
        (currentProps![breakPoint.value]?.span ?? currentProps?.span ?? 1) +
        (currentProps![breakPoint.value]?.offset ?? currentProps?.offset ?? 0);
      if (newValue > props.collapsedRows * cols.value - suffixCols) {
        hiddenIndex.value = index;
        find = true;
        throw new Error('find it');
      }
      return newValue;
    }, 0);
    if (!find) hiddenIndex.value = -1;
  } catch {
    // console.error(e);
  }
};
onBeforeMount(() => props.collapsed && findIndex());
// 断点变化时 执行 findIndex
watch(
  () => breakPoint.value,
  () => {
    if (props.collapsed) findIndex();
  }
);

// 监听 collapsed
watch(
  () => props.collapsed,
  value => {
    if (value) {
      findIndex();
      return;
    }
    hiddenIndex.value = -1;
  }
);

// 设置间距
const gap = computed(() => {
  if (typeof props.gap === 'number') return `${props.gap}px`;
  if (Array.isArray(props.gap)) return `${props.gap[1]}px ${props.gap[0]}px`;
  return 'unset';
});

// 设置 style
const style = computed(() => {
  return {
    display: 'grid',
    gridGap: gap.value,
    gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`
  };
});

defineExpose({ breakPoint });
</script>

<template>
  <div :style="style">
    <slot></slot>
  </div>
</template>
