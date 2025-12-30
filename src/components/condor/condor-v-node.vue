<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CondorVNode',
  props: {
    // 支持传入渲染函数或已构建好的 vnode/object
    render: {
      type: [Function, Object] as unknown as () => ((h: typeof import('vue').h, param?: any) => any) | any,
      default: null
    },
    row: {
      type: Object as () => Record<string, any>,
      default: () => ({})
    }
  },
  setup(props) {
    return () => {
      const { render, row } = props;
      if (!render) return null;

      if (typeof render === 'function') {
        try {
          return render(row);
        } catch {
          return null;
        }
      }
      // 如果直接传入的是 vnode / 元素对象，直接返回
      return render;
    };
  }
});
</script>
