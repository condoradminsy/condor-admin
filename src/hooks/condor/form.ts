import { computed, h, inject, reactive, toRefs, watch } from 'vue';
import { NButton, NTooltip } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { request } from '@/service/request';
import condorAuth from '@/components/condor/condor-auth.vue';
import { $t } from '@/locales';
export const useForm = ({ columns, urls, formRef, formModalRef, successFn }: any) => {
  const state = reactive<Condor.Form.StateProps>({
    // 加载状态
    isLoading: false,
    form: {}
  });
  // 获取注入的表单提交前钩子
  const onBeforeSubmit: any = inject('onBeforeFormSubmit', null);
  // fields 根据 columns.value 动态计算
  const fields = computed(() => {
    const cols = columns?.value ?? [];
    return cols.filter((col: any) => !['selection', 'expand', 'operate'].includes(col.type) && col.form !== false);
  });

  // rules 根据 columns.value 动态计算
  const rules = computed(() => {
    const cols = columns?.value ?? [];
    const acc: Record<string, any> = {};
    cols.forEach((cur: any) => {
      if (cur.rules) acc[cur.key] = cur.rules;
    });
    return acc;
  });

  // 构建初始表单对象（或根据列的默认 value 填充）
  const buildForm = () => {
    const cols = columns?.value ?? [];
    const f: Record<string, any> = {};
    cols.forEach((col: any) => {
      if (col.key && !['selection', 'expand', 'operate'].includes(col.type) && col.form !== false) {
        // 优先使用列中提供的 value，否则根据类型给默认值
        if (col.value !== undefined) f[col.key] = col.value;
        else if (col.type === 'switch') f[col.key] = false;
        else f[col.key] = null;
      }
    });
    return f;
  };

  // 初次构建
  state.form = buildForm();

  // 当 columns 改变时，重建或同步 state.form（保留已存在值）
  watch(
    columns,
    () => {
      const newForm = buildForm();
      // 保留已有值（若 key 相同）
      Object.keys(newForm).forEach(k => {
        if (state.form[k] !== undefined) newForm[k] = state.form[k];
      });
      state.form = newForm;
    },
    { immediate: true, deep: true }
  );

  const hasCondition = (col: any) => {
    if (typeof col.condition === 'function') {
      return col.condition({ ...state.form });
    }
    return true;
  };

  // 提交表单
  const submitForm = (type: string) => {
    formRef.value.validate((valid: boolean) => {
      if (!valid) {
        let data: any = { ...state.form };
        if (typeof onBeforeSubmit === 'function') {
          const newData = onBeforeSubmit(data);
          if (newData) {
            data = newData;
          }
        }
        request({
          url: urls[type] || '',
          method: 'post',
          data
        })
          .then(({ error }: any) => {
            if (!error) {
              formModalRef.value.close();
              // 成功回调
              if (typeof successFn === 'function') {
                successFn();
              }
            }
          })
          .finally(() => {
            formModalRef.value.setSubLoading(false);
          });
      } else {
        formModalRef.value.setSubLoading(false);
      }
    });
  };

  // 重置表单
  const resetForm = () => {
    state.form = buildForm();
  };

  // 设置表单
  const setForm = (form: any, filedKeys = '') => {
    Object.keys(state.form).forEach(key => {
      state.form[key] = form[key] ?? state.form[key] ?? null;
      if (filedKeys) {
        // 附加参数，用于设置部分字段
        const keys = filedKeys.split(',');
        for (const k of keys) {
          const kt = k.trim();
          if (kt && form[kt] !== undefined) {
            state.form[kt] = form[kt];
          }
        }
      }
    });
  };

  // 获取编辑按钮
  const getEditBtn = (row: Record<string, any>) => {
    return h(
      condorAuth,
      {
        permission: urls.edit
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
                  NButton,
                  {
                    type: 'primary',
                    size: 'small',
                    onClick: () => {
                      formModalRef.value?.open({ title: $t('condor.common.edit'), type: 'edit' });
                      setForm(row, 'id');
                    }
                  },
                  {
                    icon: () => h(Icon, { icon: 'ic:baseline-edit', width: 16 })
                  }
                ),
              default: () => $t('condor.common.edit')
            }
          )
      }
    );
  };

  return {
    ...toRefs(state),
    fields,
    rules,
    hasCondition,
    submitForm,
    resetForm,
    setForm,
    getEditBtn
  };
};
