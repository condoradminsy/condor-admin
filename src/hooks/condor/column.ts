import { computed } from 'vue';
import { $t } from '@/locales';
export const useColumns = (columns: any) => {
  // 开关组件
  const handleSwitchComponent = (item: any, component: any) => {
    return {
      ...item,
      value: item.search?.value ?? null,
      component: {
        name: 'n-select',
        props: {
          options: [
            {
              label() {
                return $t('common.yesOrNo.yes');
              },
              value: component.props?.checkedValue ?? true
            },
            {
              label() {
                return $t('common.yesOrNo.no');
              },
              value: component.props?.uncheckedValue ?? false
            }
          ]
        }
      }
    };
  };
  // 日期组件
  const handleDateComponent = (item: any) => {
    return {
      ...item,
      value: item.search?.value ?? null,
      component: {
        name: 'n-date-picker',
        props: {
          type: 'datetimerange',
          shortcuts: {
            [$t('condor.component.recent_week')]: () => [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
            [$t('condor.component.recent_month')]: () => [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
            [$t('condor.component.recent_three_month')]: () => [
              new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              new Date()
            ]
          }
        }
      }
    };
  };

  // 下拉组件
  const handleSelectComponent = (item: any, component: any) => {
    return {
      ...item,
      value: item.search?.value ?? null,
      component: {
        name: 'condor-dict-select',
        props: {
          ...(component.props ?? {})
        }
      }
    };
  };
  // 清除组件属性
  const cleanComponentProps = (props: any) => {
    const { disabled: _disabled, readonly: _readonly, type, ...rest } = props || {};
    // 保留 type 除非是 textarea
    if (type && type !== 'textarea') {
      rest.type = type;
    }
    return rest;
  };

  // 搜索列
  const searchColumns = computed<Condor.Search.Column[]>(() => {
    return columns.value
      .filter((item: any) => item.operator !== false && item.type === undefined)
      .map((item: any) => {
        const component = item.search?.component === undefined ? item.component : item.search.component;
        // 如果搜索项没有强制要求，则根据组件类型自动转换
        if (item.search?.force !== true) {
          if (component?.name === 'n-switch') {
            return handleSwitchComponent(item, component);
          } else if (component?.name === 'n-date-picker' || item.key.endsWith('time')) {
            return handleDateComponent(item);
          } else if (['condor-dict-radio', 'condor-dict-checkbox'].includes(component?.name)) {
            return handleSelectComponent(item, component);
          }
        }
        return {
          ...item,
          value: item.search?.value ?? null,
          component: {
            ...component,
            props: cleanComponentProps(component?.props ?? {})
          }
        };
      });
  });
  // 配置列
  const configColumns = computed({
    get() {
      return columns.value
        .filter((col: any) => col.checked !== false)
        .map((col: any) => col.CondorDwbTableColumnCheckedKey);
    },
    set(val: string[]) {
      const setKeys = new Set(val);
      columns.value.forEach((col: any) => {
        col.checked = setKeys.has(col.CondorDwbTableColumnCheckedKey);
      });
    }
  });
  return {
    searchColumns,
    configColumns
  };
};
