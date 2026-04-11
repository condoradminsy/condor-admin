<script lang="ts" setup>
import { type VNode, computed, h, isVNode, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NImage, NTag } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import dayjs from 'dayjs';
import { VueDraggable } from 'vue-draggable-plus';
import { Icon } from '@iconify/vue';
import { transformColorWithOpacity } from '@sa/color';
import { getBaseUrl } from '@/service/request/shared';
import { useCondorStore } from '@/store/modules/condor';
import { useAuthStore } from '@/store/modules/auth';
import { useTable } from '@/hooks/condor/table';
import { useForm } from '@/hooks/condor/form';
import { useColumns } from '@/hooks/condor/column';
import { useXlsx } from '@/hooks/condor/xlsx';
import { $t, getLocale, getValueByLocale } from '@/locales';
defineOptions({
  name: 'CondorTable'
});
type ButtonItem = 'refresh' | 'add' | 'multi' | 'del' | ((...args: any[]) => VNode);
type ToolItem = 'grid' | 'column' | 'search' | 'export' | ((...args: any[]) => VNode);

interface ExpandIconProps {
  expanded: boolean;
  rowData: Record<string, unknown>;
}

interface FormModalInstance {
  open: (options: { title: string; type: string }) => void;
  close: () => void;
  setSubLoading: (loading: boolean) => void;
}

const props = withDefaults(
  defineProps<{
    isTable?: boolean;
    bordered?: boolean;
    striped?: boolean;
    isPagination?: boolean;
    showSearch?: boolean;
    header?: Condor.Table.Header;
    buttons?: ButtonItem[];
    tools?: ToolItem[];
    config: Condor.Table.Config;
    scrollX?: number;
    colSpan?: number;
    formLabelWidth?: string;
    defaultExpandAll?: boolean;
    initSearchParams?: Record<string, any>;
    renderExpandIcon?: (props: ExpandIconProps) => VNode;
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
    renderExpandIcon: ({ expanded }: ExpandIconProps) => {
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
const { baseURL } = getBaseUrl();
const condorStore = useCondorStore();
const authStore = useAuthStore();
const tableOrList = ref(props.isTable);
const formModalRef = ref<FormModalInstance>();
const formRef = ref();
const isShowSearch = ref(props.showSearch);
const checkedRowKeys = ref<(string | number)[]>([]);
const columns = ref<Condor.Table.Columns[]>([]);
const route = useRoute();
watch(
  () => props.config.columns,
  newVal => {
    columns.value =
      newVal?.map((item: Condor.Table.Columns, index: number) => {
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
  multilingualFields: props.config.multilingualFields,
  urls: props.config.urls,
  formRef,
  formModalRef,
  successFn: getTableData
});
const currentLocale = ref(getLocale().toLocaleLowerCase());
// 弹窗打开，更新当前语言
const onOpenModal = () => {
  currentLocale.value = getLocale().toLocaleLowerCase();
};
// 格式化操作列的值
const formatOperateValue = (v: string): string | number | boolean => {
  let parsedV: string | number | boolean = v;
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
const renderOperate = (row: Condor.Table.RowData, col: Condor.Table.Columns) => {
  const buttons: (VNode | string)[] = [];
  let btns: Condor.Table.OperateButton[] = [];
  if (typeof col.buttons === 'function') {
    btns = col.buttons(row);
  } else if (Array.isArray(col.buttons)) {
    btns = col.buttons;
  }
  btns.forEach((btn: Condor.Table.OperateButton) => {
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
// 字典列
const renderDictColumn = (row: Condor.Table.RowData, col: Condor.Table.Columns) => {
  const dictCode = col.component?.props?.code;
  const dictList: Condor.Table.DictItem[] = (dictCode ? condorStore.dictData[dictCode] : []) || [];
  const info =
    dictList.find((item: Condor.Table.DictItem) => `${item.value}` === `${row[col.key]}`) ||
    ({} as Condor.Table.DictItem);
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
      default: () => getValueByLocale(info?.label || row[col.key])
    }
  );
};
// 时间列
const renderTimeColumn = (row: Condor.Table.RowData, col: Condor.Table.Columns) => {
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
const typeMap: Record<string, string> = {
  video: 'ion-film-outline',
  audio: 'gridicons-audio',
  txt: 'tabler-file-type-txt',
  word: 'ep-document',
  excel: 'mdi-microsoft-excel',
  ppt: 'lsicon-file-ppt-filled',
  pdf: 'lsicon-file-pdf-outline',
  zip: 'hugeicons-zip-02',
  other: 'solar-documents-bold'
};
// 根据后缀名判断类型
const getTypeByExtension = (extension: string | undefined) => {
  let type = 'other';
  if (!extension) return type;
  if (['mp4', 'avi', 'mov', '3gp', 'm4v'].includes(extension)) {
    type = 'video';
  } else if (['mp3', 'wav'].includes(extension)) {
    type = 'audio';
  } else if (['doc', 'docx'].includes(extension)) {
    type = 'word';
  } else if (['xls', 'xlsx'].includes(extension)) {
    type = 'excel';
  } else if (['ppt', 'pptx'].includes(extension)) {
    type = 'ppt';
  } else if (['pdf'].includes(extension)) {
    type = 'pdf';
  } else if (['zip', 'rar'].includes(extension)) {
    type = 'zip';
  } else if (['txt'].includes(extension)) {
    type = 'txt';
  } else if (['png', 'jpg', 'jpge', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(extension)) {
    type = 'image';
  }
  return type;
};
// 附件列
const renderUploadColumn = (row: Condor.Table.RowData, col: Condor.Table.Columns) => {
  let values = row[col.key];
  if (props.config.multilingualFields?.length && props.config.multilingualFields.includes(col.key)) {
    values = getValueByLocale(row[col.key]);
  }
  if (!values) return '';
  values = Array.isArray(values) ? values : values.split(',');
  return h(
    'div',
    {
      class: 'flex items-center justify-center space-x-2'
    },
    {
      default: () =>
        values.map((value: string) => {
          const extension = value?.split('.').pop()?.toLowerCase();
          const type = row.type || getTypeByExtension(extension);
          if (type === 'image') {
            return h(NImage, {
              width: '50px',
              height: '50px',
              objectFit: 'contain',
              src: value?.startsWith('http') ? value : `${baseURL}${value}`
            });
          }
          return h(
            'a',
            {
              class: 'flex justify-center items-center cursor-pointer',
              href: value?.startsWith('http') ? value : `${baseURL}${value}`,
              target: '_blank'
            },
            {
              default: () => [
                h(Icon, {
                  icon: typeMap[type],
                  class: 'text-3xl'
                })
              ]
            }
          );
        })
    }
  );
};
// 表格列
const isDictColumn = (col: Condor.Table.Columns): boolean => {
  const dictNames = ['condor-dict-radio', 'condor-dict-select'];
  return (
    dictNames.includes(col.component?.name ?? '') && Boolean(col.component?.props?.code) && col.render === undefined
  );
};

const getColumnRender = (col: Condor.Table.Columns): ((row: Condor.Table.RowData) => VNode | string) | undefined => {
  if (col.type === 'operate') return (row: Condor.Table.RowData) => renderOperate(row, col);
  if (col.component?.name === 'n-switch' && col.render === undefined)
    return (row: Condor.Table.RowData) => getSwitchBtn(row, col) as VNode;
  if (['datetime', 'date'].includes(col.render as string))
    return (row: Condor.Table.RowData) => renderTimeColumn(row, col);
  if (isDictColumn(col)) return (row: Condor.Table.RowData) => renderDictColumn(row, col);
  if ((col.component?.name === 'condor-upload' && col.render === undefined) || col.render === 'image')
    return (row: Condor.Table.RowData) => renderUploadColumn(row, col);
  if (props.config.multilingualFields?.length && props.config.multilingualFields.includes(col.key))
    return (row: Condor.Table.RowData) => getValueByLocale(row[col.key]) as string;
  if (typeof col.render === 'function')
    return (row: Condor.Table.RowData) => (col.render as (row: Condor.Table.RowData) => VNode | string)(row);
  return undefined;
};

const tableColumns = computed<DataTableColumns<Condor.Table.RowData>>(() => {
  return columns.value
    .filter((col: Condor.Table.Columns) => col.visible !== false && col.checked !== false)
    .map((col: Condor.Table.Columns) => ({
      align: 'center' as const,
      ...col,
      render: getColumnRender(col)
    })) as unknown as DataTableColumns<Condor.Table.RowData>;
});
const updateCheckedRowKeys = (val: (string | number)[]) => {
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
  searchColumns.value.forEach((col: Condor.Table.SearchConfig) => {
    if (col.value !== undefined && col.value !== null && col.value !== '') {
      totalParams.value[col.key as string] = col.value;
    }
  });
  // 获取表格数据
  getTableData();
});
// 字典的值
const getDictLabel = (code: string, value: any) => {
  const dictList = condorStore.dictData[code] || [];
  const info = dictList.find((r: any) => `${r.value}` === `${value}`) || {};
  if (info?.label) {
    return info.label;
  }
  return value;
};
// 虚拟dom的值
const getVNodeValue = (v: VNode): string => {
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (v.children && Array.isArray(v.children)) {
    return (v.children as any[])
      .map((child: any) => {
        if (typeof child === 'string' || typeof child === 'number') return String(child);
        if (isVNode(child)) return String(getVNodeValue(child) ?? '');
        return '';
      })
      .join('');
  } else if (v.props) {
    for (const k of ['value', 'text', 'label', 'title', 'content', 'src', 'href']) {
      if (v.props[k] !== undefined) {
        return String(v.props[k]);
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
  const header: string[] = [];
  const data: string[][] = [];
  columns.value.forEach((item: Condor.Table.Columns) => {
    if (!['operate', 'selection', 'expand'].includes(item.type as string)) {
      const title = typeof item.title === 'function' ? item.title() : item.title || '';
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
          ['condor-dict-radio', 'condor-dict-select', 'condor-dict-checkbox'].includes(item.component?.name ?? '') &&
          item.component?.props?.code
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
              <NButton
                type="primary"
                @click="
                  formModalRef?.open({
                    title: $t('condor.common.add'),
                    type: 'add'
                  })
                "
              >
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
              <span>{{ $t("condor.component.table_list") }}</span>
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
              <span>{{ $t("condor.component.column_setting") }}</span>
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
              <span>{{ $t("condor.common.export") }}</span>
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
              <span>{{ $t("common.search") }}</span>
            </NTooltip>
            <CondorVNode
              v-else-if="typeof item === 'function'"
              :render="item"
            ></CondorVNode>
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
    <CondorModal
      ref="formModalRef"
      :isMultilingual="
        props.config.multilingualFields &&
        props.config.multilingualFields.length > 0
      "
      @on-ok="submitForm"
      @on-close="resetForm"
      @on-open="onOpenModal"
    >
    <template #multilingual>
      <CondorLang v-model:value="currentLocale"></CondorLang>
    </template>
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
                :label="
                  typeof item.title === 'function'
                    ? item.title(form)
                    : item.title
                "
                :path="item.key"
              >
                <slot :name="`form-item-${item.key}`" :form="form">
                  <div
                    class="w-full"
                    v-if="props.config.multilingualFields?.includes(item.key)"
                  >
                    <CondorFormItem
                      v-model:value="form[item.key][currentLocale]"
                      :column="item"
                    ></CondorFormItem>
                    <div
                      v-if="item.tips !== undefined"
                      class="pt-1 text-xs text-gray-500"
                    >
                      <icon-ri-information-line class="inline-block" />
                      <span class="ml-1">{{
                        typeof item.tips === "function"
                          ? item.tips(form)
                          : item.tips
                      }}</span>
                    </div>
                  </div>
                  <div class="w-full" v-else>
                    <CondorFormItem
                      v-model:value="form[item.key]"
                      :column="item"
                    ></CondorFormItem>
                    <div
                      v-if="item.tips !== undefined"
                      class="pt-1 text-xs text-gray-500"
                    >
                      <icon-ri-information-line class="inline-block" />
                      <span class="ml-1">{{
                        typeof item.tips === "function"
                          ? item.tips(form)
                          : item.tips
                      }}</span>
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
