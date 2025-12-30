declare namespace Condor {
  namespace Search {
    interface searchItem {
      span?: number;
      offset?: number;
      xs?: Condor.Grid.Responsive;
      sm?: Condor.Grid.Responsive;
      md?: Condor.Grid.Responsive;
      lg?: Condor.Grid.Responsive;
      xl?: Condor.Grid.Responsive;
    }

    interface Column {
      // 字符串或函数
      title: string | ((row: any) => string);
      key: string;
      value?: string | number | boolean | null;
      operator?: string | false;
      search?: Search.searchItem;
      component?: any;
      [key: string]: any;
    }

    interface FormItem {
      [key: string]: any;
    }
  }
}
