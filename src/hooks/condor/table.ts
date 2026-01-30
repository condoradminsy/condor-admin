import { h, inject, reactive, toRefs } from 'vue';
import { NButton, NPopconfirm, NSwitch, NTooltip } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { request } from '@/service/request';
import { useAuthStore } from '@/store/modules/auth';
import condorAuth from '@/components/condor/condor-auth.vue';
import { $t } from '@/locales';

export const useTable = ({ urls, isPagination, orderBy, order }: Condor.Table.UseTableProps) => {
  const state = reactive<Condor.Table.StateProps>({
    // 表格数据
    tableData: [],
    // 分页参数
    pagination: {
      page: 1,
      pageSize: 10,
      itemCount: 0,
      pageSizes: [10, 20, 50, 100, 200, 500],
      showQuickJumper: true,
      showSizePicker: true,
      perfix({ itemCount }: { itemCount: number }) {
        return $t('condor.component.total_items', { total: itemCount });
      }
    },
    initParams: {},
    totalParams: {},
    tabsParams: {},
    // 加载状态
    isLoading: false,
    isFirstRender: false
  });
  // 获取注入的表格数据请求前后钩子
  const onBeforeIndex: any = inject('onBeforeTableIndex', null);
  // 获取注入的表格数据请求前后钩子
  const onAfterIndex: any = inject('onAfterTableIndex', null);
  // 获取表格数据
  const getTableData = () => {
    state.isLoading = true;
    return new Promise((resolve, reject) => {
      // 分页参数
      const pageParams = isPagination
        ? {
            page: state.pagination.page,
            limit: state.pagination.pageSize
          }
        : {};
      let searchData = {
        orderBy,
        order,
        ...state.initParams,
        ...state.tabsParams,
        ...pageParams,
        ...state.totalParams
      };
      if (typeof onBeforeIndex === 'function') {
        const newSearchData = onBeforeIndex(searchData);
        if (newSearchData) {
          searchData = newSearchData;
        }
      }
      // 请求数据
      request({
        url: urls.index,
        method: 'post',
        data: searchData
      })
        .then(({ data, error }) => {
          if (error) {
            reject(error);
            return;
          }
          let dataAny: any = data;
          if (typeof onAfterIndex === 'function') {
            const newData = onAfterIndex(dataAny);
            if (newData) {
              dataAny = newData;
            }
          }
          const list = dataAny.list || dataAny || [];
          const total = dataAny.total || 0;
          state.tableData = list;
          if (isPagination) {
            state.pagination.itemCount = total;
          }
          resolve(data);
        })
        .catch(reject)
        .finally(() => {
          state.isFirstRender = true;
          state.isLoading = false;
        });
    });
  };

  // 页码改变
  const handleCurrentChange = (page: number) => {
    state.pagination.page = page;
    getTableData();
  };

  const handleSizeChange = (pageSize: number) => {
    state.pagination.pageSize = pageSize;
    state.pagination.page = 1;
    getTableData();
  };

  // 更新总的查询参数
  const updateTotalParams = (params: Record<string, any>) => {
    state.totalParams = {};
    const nowSearchParams: Record<string, any> = {};
    if (params) {
      for (const key in params) {
        if (Object.hasOwn(params, key)) {
          const value = params[key];
          if (value || value === 0 || value === false) {
            nowSearchParams[key] = params[key];
          }
        }
      }
      Object.assign(state.totalParams, nowSearchParams);
    }
  };
  // 搜索方法
  const search = (params: Record<string, any> = {}) => {
    state.pagination.page = 1;
    updateTotalParams(params);
    getTableData();
  };

  // 删除方法
  const toDelete = (value: string | number | number[] | string[]) => {
    request({
      url: urls.del,
      method: 'post',
      data: {
        ids: value
      }
    }).then(({ error }) => {
      if (!error) {
        getTableData();
      }
    });
  };

  // 获取删除按钮
  const getDelBtn = (row: Record<string, any>) => {
    return h(
      condorAuth,
      {
        permission: urls.del
      },
      {
        default: () =>
          h(
            NTooltip,
            {
              style: 'padding:5px 8px;',
              contentClass: 'text-xs'
            },
            {
              trigger: () =>
                h(
                  NPopconfirm,
                  {
                    size: 'small',
                    onPositiveClick: () => {
                      toDelete(row.id);
                    }
                  },
                  {
                    default: () => $t('condor.component.are_you_sure_you_want_to_delete_this_record'),
                    trigger: () =>
                      h(
                        NButton,
                        {
                          type: 'error',
                          size: 'small'
                        },
                        { icon: () => h(Icon, { icon: 'material-symbols:delete-outline', width: 16 }) }
                      )
                  }
                ),
              default: () => $t('condor.common.delete')
            }
          )
      }
    );
  };

  // 获取开关按钮
  const getSwitchBtn = (row: any, col: Record<string, any>) => {
    if (row.condorSwitchLoadings === undefined) {
      row.condorSwitchLoadings = {};
    }
    const props = {
      round: false,
      disabled: !useAuthStore().hasPermission(urls.multi)
    };
    if (col.component?.props) {
      Object.assign(props, col.component.props);
    }
    const slots = {
      ...(col.component?.slots || {})
    };
    return h(
      NSwitch,
      {
        value: row[col.key],
        loading: Boolean(row.condorSwitchLoadings[col.key]),
        ...props,
        onUpdateValue: value => {
          row.condorSwitchLoadings[col.key] = true;
          request({
            url: urls.multi,
            method: 'post',
            data: {
              id: row.id,
              field: col.key,
              value
            }
          })
            .then(({ error }: any) => {
              if (!error) {
                row[col.key] = value;
              }
            })
            .finally(() => {
              row.condorSwitchLoadings[col.key] = false;
            });
        }
      },
      slots
    );
  };

  return {
    ...toRefs(state),
    getTableData,
    search,
    handleCurrentChange,
    handleSizeChange,
    getDelBtn,
    getSwitchBtn,
    toDelete
  };
};
