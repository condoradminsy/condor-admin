declare namespace Condor {
  namespace Table {
    interface Header {
      tips?: string;
      searchField?: string;
      searchOp?: string;
      labelField?: string;
      valueField?: string;
      value?: string | number | boolean;
      params: { label: string; value: string | number | boolean; [key: string]: any }[];
      index?: number;
    }
    interface Columns {
      title?: string | ((row?: any) => string);
      key: string;
      width?: number;
      align?: 'left' | 'center' | 'right';
      sorter?: boolean | 'default';
      sortOrder?: false | 'ascend' | 'descend';
      resizable?: boolean;
      ellipsis?: boolean | { showTitle?: boolean; tooltip?: boolean };
      type?: 'selection' | 'expand' | 'operate';
      render?: string | ((row: any) => any);
      // 自定义属性
      [key: string]: any;
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
      perfix?: any;
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
      rowKey: (row: any) => string;
    }
    interface StateProps {
      tableData: any[];
      pagination: Pagination;
      initParams: Record<string, any>;
      totalParams: Record<string, any>;
      tabsParams: Record<string, any>;
      isLoading: boolean;
      isFirstRender: boolean;
    }
  }
}
