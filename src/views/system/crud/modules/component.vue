<script lang="ts" setup>
import { ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useThemeStore } from '@/store/modules/theme';
import { componentList } from './data';
defineOptions({
  name: 'CrudComponent'
});
const themeStore = useThemeStore();
const list = ref([...componentList]);
const clone = (element: Record<'name' | 'value' | 'id', string>) => {
  return {
    ...element,
    id: `${element.id}_${Math.random().toString(36).slice(2, 9)}`
  };
};
</script>

<template>
  <div>
    <NCollapse default-expanded-names="basic">
      <NCollapseItem v-for="(item, index) in list" :key="index" :title="item.name" :name="item.id">
        <VueDraggable
          v-model="item.children"
          :animation="150"
          ghost-class="ghost"
          :group="{ name: 'people', pull: 'clone', put: false }"
          :clone="clone"
          :sort="false"
          class="flex flex-wrap gap-2"
        >
          <div
            v-for="row in item.children"
            :key="row.id"
            class="item cursor-pointer rounded-md px-2 py-1"
            :style="{ '--crud-primary-color': themeStore.themeColor }"
          >
            {{ row.name }}
          </div>
        </VueDraggable>
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<style lang="scss" scoped>
.item {
  border: 1px dashed #dedede;
  color: #333;
  cursor: pointer;
  display: inline-block;
  &:hover {
    border-color: var(--crud-primary-color);
  }
}
</style>
