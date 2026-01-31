<script lang="ts" setup>
import { computed, h, isVNode, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { VueDraggable } from 'vue-draggable-plus';
import { Icon } from '@iconify/vue';
import { transformColorWithOpacity } from '@sa/color';
import { useDictStore } from '@/store/modules/dict';
import { useAuthStore } from '@/store/modules/auth';
import { useTable } from '@/hooks/condor/table';
import { useForm } from '@/hooks/condor/form';
import { useColumns } from '@/hooks/condor/column';
import { useXlsx } from '@/hooks/condor/xlsx';
import { $t } from '@/locales';
defineOptions({
  name: 'CondorTable'
});
const props = withDefaults(
  defineProps<{
    isTable?: boolean;
    bordered?: boolean;
    striped?: boolean;
    isPagination?: boolean;
    showSearch?: boolean;
    header?: Condor.Table.Header;
    buttons?: ('refresh' | 'add' | 'multi' | 'del')[];
    tools?: ('grid' | 'column' | 'search' | 'export')[];
    config: Condor.Table.Config;
    scrollX?: number | undefined;
    colSpan?: number;
    formLabelWidth?: string;
    defaultExpandAll?: boolean;
    initSearchParams?: Record<string, any>;
    renderExpandIcon?: (row: Record<string, any>) => any;
  }>(),
  {
    isTable: true,
    bordered: true,
    striped: true,
    isPagination: true,
    showSearch: true,
    defaultExpandAll: false,
    header: () => ({
      params: []
    }),
    buttons: () => ['refresh', 'add', 'del'],
    tools: () => ['grid', 'column', 'search', 'export'],
    renderExpandIcon: ({ expanded }: any) => {
      return h(
        'div',
        {},
        {
          default: () => [
            h(Icon, {
              icon: expanded ? 'fluent-subtract-square-24-regular' : 'fluent-add-square-24-regular',
              width: 18,
              height: 18
            })
          ]
        }
      );
    },
    scrollX: undefined,
    colSpan: 24,
    formLabelWidth: '100px',
    initSearchParams: () => ({})
  }
);
const dictStore = useDictStore();
const authStore = useAuthStore();
const tableOrList = ref(props.isTable);
const formModalRef = ref();
const formRef = ref();
const isShowSearch = ref(props.showSearch);
const checkedRowKeys = ref([]);
const columns = ref<any>([]);
const route = useRoute();
watch(
  () => props.config.columns,
  newVal => {
    columns.value =
      newVal?.map((item: any, index: number) => {
        return {
          ...item,
          CondorDwbTableColumnCheckedKey: `${item.key}|${index}`
        };
      }) || [];
  },
  { immediate: true, deep: true }
);
// 搜索列,配置列
const { searchColumns, configColumns } = useColumns(columns);
// 表格
const {
  tableData,
  pagination,
  getTableData,
  tabsParams,
  totalParams,
  initParams,
  isLoading,
  search,
  handleCurrentChange,
  handleSizeChange,
  getDelBtn,
  getSwitchBtn,
  toDelete,
  isFirstRender
} = useTable({
  urls: props.config.urls,
  isPagination: props.isPagination,
  orderBy: props.config.orderBy,
  order: props.config.order
});
// 表单
const { form, rules, fields, setForm, hasCondition, submitForm, resetForm, getEditBtn } = useForm({
  columns,
  urls: props.config.urls,
  formRef,
  formModalRef,
  successFn: getTableData
});
// 格式化操作列的值
const formatOperateValue = (v: string) => {
  let parsedV: any = v;
  if (v !== undefined) {
    if (/^-?\d+$/.test(v) || /^-?\d+\.\d+$/.test(v)) {
      parsedV = Number(v);
    } else if (v === 'true' || v === 'false') {
      parsedV = v === 'true';
    }
  }
  return parsedV;
};
// 操作列
const renderOperate = (row: Record<string, any>, col: Condor.Table.Columns) => {
  const buttons: any = [];
  let btns: any = [];
  if (typeof col.buttons === 'function') {
    btns = col.buttons(row);
  } else if (Array.isArray(col.buttons)) {
    btns = col.buttons;
  }
  btns.forEach((btn: any) => {
    if (typeof btn === 'function') {
      buttons.push(btn(row));
    } else if (typeof btn === 'string') {
      const parts = btn.split(':');
      const op = parts[0];
      const k = parts[1];
      const v = formatOperateValue(parts[2]);
      if (op === 'edit' && authStore.hasPermission(props.config.urls.edit)) {
        if (k === undefined || row[k] !== v) {
          buttons.push(getEditBtn(row));
        }
      } else if (op === 'del' && authStore.hasPermission(props.config.urls.del)) {
        if (k === undefined || row[k] !== v) {
          buttons.push(getDelBtn(row));
        }
      }
    }
  });
  if (buttons.length === 0) {
    col.visible = false;
    return '';
  }
  return h(
    'div',
    {
      class: 'flex items-center justify-center space-x-2'
    },
    buttons
  );
};
// 表格列
const tableColumns = computed<any>(() => {
  return columns.value
    .filter((col: any) => {
      return col.visible !== false && col.checked !== false;
    })
    .map((col: any) => {
      // 默认列
      let render;
      if (col.type === 'operate') {
        render = (row: any) => renderOperate(row, col);
      } else if (col.component?.name === 'n-switch' && col.render === undefined) {
        render = (row: any) => getSwitchBtn(row, col);
      } else if (['datetime', 'date'].includes(col.formatter)) {
        render = (row: any) => {
          const tv = Number(row[col.key]);
          if (Number.isNaN(tv)) {
            return row[col.key];
          }
          if (!tv) {
            return '';
          }
          return dayjs(tv.toString().length > 10 ? Number(tv) : tv * 1000).format(
            col.formatter === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
          );
        };
      } else if (
        ['condor-dict-radio', 'condor-dict-select'].includes(col.component?.name) &&
        col.component.props?.code
      ) {
        render = (row: any) => {
          const dictList = dictStore.dictData[col.component.props.code] || [];
          const info = dictList.find((item: any) => `${item.value}` === `${row[col.key]}`) || {};
          const color = info?.color || '#18A058';
          const bgColor = transformColorWithOpacity(color, 0.1);
          return h(
            NTag,
            {
              size: 'small',
              color: {
                color: bgColor,
                textColor: color,
                borderColor: color
              }
            },
            {
              default: () => info?.label || row[col.key] || ''
            }
          );
        };
      }
      return {
        align: 'center',
        render,
        ...col
      };
    });
});
const updateCheckedRowKeys = (val: any) => {
  checkedRowKeys.value = val;
};
// init param
if (Object.keys(props.initSearchParams || {}).length) {
  Object.assign(initParams.value, props.initSearchParams);
}
// nav 参数
const renderNavSearch = (index: number) => {
  const value = props.header.params[index]?.[props.header.valueField || 'value'];
  tabsParams.value[props.header.searchField || 'name'] = props.header.searchOp ? [props.header.searchOp, value] : value;
};
if (props.header?.params?.length) {
  renderNavSearch(props.header.index || 0);
}
// nav 改变
const navChange = (index: number) => {
  renderNavSearch(index);
  getTableData();
};
// 初始获取数据
onMounted(() => {
  // 搜索列是否有默认参数
  searchColumns.value.forEach((col: any) => {
    if (col.value !== undefined && col.value !== null && col.value !== '') {
      totalParams.value[col.key] = col.value;
    }
  });
  // 获取表格数据
  getTableData();
});
// 字典的值
const getDictLabel = (code: string, value: any) => {
  const dictList = dictStore.dictData[code] || [];
  const info = dictList.find((r: any) => `${r.value}` === `${value}`) || {};
  if (info?.label) {
    return info.label;
  }
  return value;
};
// 虚拟dom的值
const getVNodeValue = (v: any) => {
  // console.log('v', v);
  if (typeof v.children === 'string' || typeof v.children === 'number') {
    return v.children;
  } else if (Array.isArray(v.children)) {
    return v.children
      .map((child: any) => {
        if (typeof child === 'string' || typeof child === 'number') return String(child);
        if (isVNode(child)) return String(getVNodeValue(child) ?? '');
        return '';
      })
      .join('');
  } else if (v.props) {
    for (const k of ['value', 'text', 'label', 'title', 'content', 'src', 'href']) {
      if (v.props[k] !== undefined) {
        return v.props[k];
      }
    }
  }
  return '';
};
// 导出excel
const exportTableData = () => {
  if (!tableData.value.length) {
    window.$message?.error($t('condor.common.no_data_available'));
    return;
  }
  const header: any = [];
  const data: any = [];
  columns.value.forEach((item: Condor.Table.Columns) => {
    if (!['operate', 'selection', 'expand'].includes(item.type as string)) {
      const title = typeof item.title === 'function' ? item.title() : item.title;
      header.push(title);
      tableData.value.forEach((tableRow, index) => {
        if (data[index] === undefined) {
          data[index] = [];
        }
        let value = tableRow[item.key];
        if (typeof item.render === 'function') {
          const v = item.render(tableRow);
          if (typeof v === 'string' || typeof v === 'number') {
            value = v;
          } else if (isVNode(v)) {
            value = getVNodeValue(v) || value;
          }
        } else if (
          ['condor-dict-radio', 'condor-dict-select', 'condor-dict-checkbox'].includes(item.component?.name) &&
          item.component.props?.code
        ) {
          value = getDictLabel(item.component.props.code, value);
        }
        data[index].push(value);
      });
    }
  });
  useXlsx({
    data,
    header,
    filename: `${route.meta?.title || 'table'}.xlsx`
  });
};
// expose
defineExpose({
  setForm,
  getTableData,
  getCheckedRowKeys: () => checkedRowKeys.value
});
</script>

<template>
  <!-- header -->
  <slot name="header">
    <div v-if="props.header?.params?.length" class="condor-table-header">
      <div v-if="!!props.header.tips" class="header-tips mb-2">
        <div>{{ props.header.tips }}</div>
      </div>
      <CondorNav :list="props.header.params" :index="props.header.index" @change="navChange"></CondorNav>
    </div>
  </slot>
  <div class="condor-table rounded-md bg-white p-3 dark:bg-black">
    <!--  -->
    <slot name="search">
      <CondorSearch v-show="isShowSearch" :col="2" :columns="searchColumns" @search="search"></CondorSearch>
    </slot>
    <!--  -->
    <div class="grid grid-cols-1 sm:grid-cols-2">
      <slot name="buttons">
        <div class="flex items-center overflow-x-auto space-x-2 md:overflow-visible">
          <template v-for="(item, index) in props.buttons" :key="index">
            <NButton v-if="item === 'refresh'" type="primary" @click="getTableData">
              <icon-solar-refresh-bold class="text-18px" :class="{ 'animate-spin': isLoading }" />
            </NButton>
            <CondorAuth v-else-if="item === 'add'" :permission="props.config.urls.add">
              <NButton type="primary" @click="formModalRef?.open({ title: $t('condor.common.add'), type: 'add' })">
                <icon-material-symbols-add-2-rounded class="text-16px" />
                <span class="ml-1">{{ $t('condor.common.add') }}</span>
              </NButton>
            </CondorAuth>
            <CondorAuth v-else-if="item === 'del'" :permission="props.config.urls.del">
              <NPopconfirm @positive-click="toDelete(checkedRowKeys)">
                <template #trigger>
                  <NButton type="error" :disabled="!checkedRowKeys.length">
                    <icon-material-symbols-delete-outline-sharp class="text-16px" />
                    <span class="ml-1">{{ $t('condor.common.delete') }}</span>
                  </NButton>
                </template>
                <span>{{ $t('condor.component.confirm_delete_selected_data') }}</span>
              </NPopconfirm>
            </CondorAuth>
            <CondorVNode v-else-if="typeof item === 'function'" :render="item"></CondorVNode>
          </template>
        </div>
      </slot>
      <!--  -->
      <slot name="tools">
        <div class="mt-3 flex items-center justify-start sm:mt-0 sm:justify-end space-x-2">
          <template v-for="(item, index) in props.tools" :key="index">
            <!-- eslint-disable -->
            <NTooltip
              v-if="item === 'grid'"
              content-class="text-xs"
              style="padding: 5px 8px"
            >
              <template #trigger>
                <NButton
                  strong
                  secondary
                  circle
                  @click="tableOrList = !tableOrList"
                >
                  <template #icon>
                    <icon-ic-round-list-alt class="text-18px" />
                  </template>
                </NButton>
              </template>
              <span>{{ $t('condor.component.table_list') }}</span>
            </NTooltip>
            <!-- eslint-disable -->
            <NTooltip
              v-else-if="item === 'column'"
              content-class="text-xs"
              style="padding: 5px 8px"
            >
              <template #trigger>
                <div class="table-toolbar-right-icon cursor-pointer">
                  <NPopover
                    :width="220"
                    class="toolbar-popover max-h-1/2"
                    placement="bottom-end"
                    trigger="click"
                    scrollable
                  >
                    <template #trigger>
                      <NButton strong secondary circle>
                        <template #icon>
                          <icon-ic-outline-settings class="text-18px" />
                        </template>
                      </NButton>
                    </template>
                    <NCheckboxGroup v-model:value="configColumns">
                      <VueDraggable
                        v-model="columns"
                        :options="{ animation: 200 }"
                      >
                        <template
                          v-for="(col, colIndex) in columns"
                          :key="colIndex"
                        >
                          <div
                            v-show="col.visible !== false"
                            class="flex items-center p-2"
                          >
                            <icon-ri-drag-move-2-fill
                              class="mr-1 inline-block cursor-move text-16px"
                            />
                            <NCheckbox
                              :label="
                                typeof col.title === 'function'
                                  ? col.title(col)
                                  : col.title
                              "
                              :value="col.CondorDwbTableColumnCheckedKey"
                            ></NCheckbox>
                          </div>
                        </template>
                      </VueDraggable>
                    </NCheckboxGroup>
                  </NPopover>
                </div>
              </template>
              <span>{{ $t('condor.component.column_setting') }}</span>
            </NTooltip>
            <!-- eslint-disable -->
            <NTooltip
              v-else-if="item === 'export'"
              content-class="text-xs"
              style="padding: 5px 8px"
            >
              <template #trigger>
                <NButton strong secondary circle @click="exportTableData">
                  <template #icon>
                    <icon-tdesign-folder-export class="text-18px" />
                  </template>
                </NButton>
              </template>
              <span>{{ $t('condor.common.export') }}</span>
            </NTooltip>
            <!-- eslint-disable -->
            <NTooltip
              v-else-if="item === 'search'"
              content-class="text-xs"
              style="padding: 5px 8px"
            >
              <template #trigger>
                <NButton
                  strong
                  secondary
                  circle
                  @click="isShowSearch = !isShowSearch"
                >
                  <template #icon>
                    <icon-ri-search-line class="text-16px" />
                  </template>
                </NButton>
              </template>
              <span>{{ $t('common.search') }}</span>
            </NTooltip>
            <CondorVNode v-else-if="typeof item === 'function'" :render="item"></CondorVNode>
          </template>
        </div>
      </slot>
    </div>
    <!--  -->
    <slot name="table">
      <div v-if="tableOrList" class="pt-4">
        <NDataTable
          v-if="!props.defaultExpandAll || isFirstRender"
          remote
          :row-key="props.config.rowKey"
          :bordered="props.bordered"
          :striped="props.striped"
          :columns="tableColumns"
          :data="tableData"
          :pagination="props.isPagination ? pagination : false"
          :loading="isLoading"
          :render-expand-icon="props.renderExpandIcon"
          :scroll-x="props.scrollX"
          :default-expand-all="props.defaultExpandAll"
          @update:page="handleCurrentChange"
          @update:page-size="handleSizeChange"
          @update:checked-row-keys="updateCheckedRowKeys"
        ></NDataTable>
      </div>
      <div v-else class="pt-4">
        <CondorTableList
          :columns="tableColumns"
          :row-key="props.config.rowKey"
          :data="tableData"
          :default-expand-all="props.defaultExpandAll"
          :pagination="props.isPagination ? pagination : false"
          @update:page="handleCurrentChange"
          @update:page-size="handleSizeChange"
          @update:checked-row-keys="updateCheckedRowKeys"
        ></CondorTableList>
      </div>
    </slot>
  </div>
  <slot name="form-modal">
    <CondorModal ref="formModalRef" @on-ok="submitForm" @on-close="resetForm">
      <slot name="form">
        <NForm
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="left"
          :label-width="props.formLabelWidth"
        >
          <NGrid :cols="24" :x-gap="24">
            <template v-for="(item, index) in fields" :key="index">
              <NFormItemGi
                v-if="hasCondition(item)"
                :span="item.span || props.colSpan"
                :label="typeof item.title === 'function' ? item.title(form) : item.title"
                :path="item.key"
              >
                <slot :name="`form-item-${item.key}`" :form="form">
                  <div class="w-full">
                    <CondorFormItem
                      v-model:value="form[item.key]"
                      :column="item"
                    ></CondorFormItem>
                    <div v-if="item.tips !== undefined" class="pt-1 text-xs text-gray-500">
                      <icon-ri-information-line class="inline-block" />
                      <span class="ml-1">{{ typeof item.tips === 'function' ? item.tips(form) : item.tips }}</span>
                    </div>
                  </div>
                </slot>
              </NFormItemGi>
            </template>
          </NGrid>
        </NForm>
      </slot>
    </CondorModal>
  </slot>
</template>

<style scoped></style>
