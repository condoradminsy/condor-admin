declare namespace Condor {
  namespace Table {
    type RowData = Record<string, any>;

    interface DictItem {
      label: string | Record<string, string>;
      value: string | number;
      color?: string;
    }

    interface ComponentProps {
      code?: string;
      checkedValue?: any;
      uncheckedValue?: any;
      disabled?: boolean;
      readonly?: boolean;
      type?: string;
      [key: string]: any;
    }

    interface ComponentConfig {
      name?: string;
      props?: ComponentProps;
      slots?: Record<string, (...args: any[]) => any>;
    }

    interface SearchConfig {
      key?: string;
      value?: any;
      force?: boolean;
      component?: ComponentConfig;
      operator?: string | false;
    }

    type OperateButton = string | ((row: RowData) => import('vue').VNode | string);

    interface Columns {
      title?: string | ((row?: RowData) => string);
      key: string;
      width?: number;
      align?: 'left' | 'center' | 'right';
      sorter?: boolean | 'default';
      sortOrder?: false | 'ascend' | 'descend';
      resizable?: boolean;
      ellipsis?: boolean | { showTitle?: boolean; tooltip?: boolean };
      type?: 'selection' | 'expand' | 'operate';
      render?: string | ((row: RowData) => any);
      formatter?: string;
      visible?: boolean;
      checked?: boolean;
      form?: boolean;
      value?: any;
      span?: number;
      tips?: string | ((form: Record<string, any>) => string);
      condition?: (context: Record<string, any>) => boolean;
      rules?: Record<string, any>;
      component?: ComponentConfig;
      search?: SearchConfig;
      buttons?: OperateButton[] | ((row: RowData) => OperateButton[]);
      CondorDwbTableColumnCheckedKey?: string;
      [key: string]: any;
    }

    interface HeaderParam {
      label: string;
      value: string | number | boolean;
      [key: string]: any;
    }

    interface Header {
      tips?: string;
      searchField?: string;
      searchOp?: string;
      labelField?: string;
      valueField?: string;
      value?: string | number | boolean;
      params: HeaderParam[];
      index?: number;
    }

    interface Urls {
      index: string;
      add?: string;
      edit?: string;
      del?: string;
      multi?: string;
    }

    interface Pagination {
      page: number;
      pageSize: number;
      itemCount: number;
      showSizePicker?: boolean;
      showQuickJumper?: boolean;
      pageSizes?: number[];
      prefix?: (info: {
        startIndex: number;
        endIndex: number;
        page: number;
        pageSize: number;
        pageCount: number;
        itemCount: number | undefined;
      }) => string;
    }

    interface UseTableProps {
      urls: Urls;
      isPagination: boolean;
      orderBy?: string;
      order?: string;
    }

    interface Config {
      multilingualFields?: string[];
      urls: Urls;
      orderBy?: string;
      order?: string;
      columns: Columns[];
      rowKey: (row: RowData) => string;
    }

    interface StateProps {
      tableData: RowData[];
      pagination: Pagination;
      initParams: Record<string, any>;
      totalParams: Record<string, any>;
      tabsParams: Record<string, any>;
      isLoading: boolean;
      isFirstRender: boolean;
    }

    interface ApiResponse {
      list: RowData[];
      total: number;
      [key: string]: any;
    }
  }
}
