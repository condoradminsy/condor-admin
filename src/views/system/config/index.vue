<script setup lang="ts">
import { computed, ref } from 'vue';
import { request } from '@/service/request';
import ConfigGroup from './modules/config-group.vue';
const group = ref<{
  id: number;
  name: string;
  code: string;
  remark: string;
}>({
  id: 0,
  name: '',
  code: '',
  remark: ''
});
const layerFormRef = ref();
const formRef = ref();
const urls = {
  add: 'core/config/add',
  edit: 'core/config/edit',
  del: 'core/config/del',
  index: 'core/config/index',
  save: 'core/config/save'
};
const configColumns = [
  {
    key: 'key',
    title: '变量名',
    component: {
      props: {
        allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)
      }
    },
    rules: [{ required: true, message: '变量名不能为空' }]
  },
  {
    key: 'title',
    title: '变量标题',
    rules: [{ required: true, message: '变量标题不能为空' }]
  },
  {
    key: 'value',
    title: '变量值',
    component: {
      props: {
        type: 'textarea',
        rows: 2
      }
    }
  },
  {
    key: 'type',
    title: '变量类型',
    rules: [{ required: true, message: '变量类型不能为空' }],
    component: {
      name: 'condor-dict-select',
      props: {
        code: 'config_form_type'
      }
    }
  },
  {
    key: 'dict_type',
    title: '字典类型',
    rules: [{ required: true, message: '字典类型不能为空' }],
    condition(form: any) {
      return form.type === 'dict';
    },
    component: {
      name: 'condor-dict-radio',
      props: {
        code: 'dict_component'
      }
    }
  },
  {
    key: 'dict_code',
    title: '关联字典',
    rules: [{ required: true, message: '关联字典不能为空' }],
    condition(form: any) {
      return form.type === 'dict';
    },
    component: {
      name: 'condor-select',
      props: {
        url: 'core/dict-type/selectpage',
        labelField: 'title',
        keyField: 'name'
      }
    }
  },
  {
    key: 'is_visible',
    title: '是否显示',
    value: 1,
    component: {
      name: 'n-switch',
      props: {
        checkedValue: 1,
        uncheckedValue: 0
      }
    }
  },
  {
    key: 'weigh',
    title: '权重',
    value: 0,
    component: {
      name: 'n-input-number',
      props: {
        min: 0,
        showButton: false
      }
    }
  },
  {
    key: 'tips',
    title: '变量说明',
    component: {
      props: {
        type: 'textarea',
        rows: 2
      }
    }
  },
  {
    key: 'status',
    title: '状态',
    value: 1,
    component: {
      name: 'n-switch',
      props: {
        checkedValue: 1,
        uncheckedValue: 0
      }
    }
  }
];
const forms = ref<any>({});
const configList = ref<any>([]);
const getList = () => {
  forms.value = {};
  configList.value = [];
  request({
    url: urls.index,
    method: 'POST',
    data: {
      group_id: group.value.id
    }
  }).then(({ error, data }) => {
    if (!error) {
      for (const item of data) {
        if (['daterange', 'array', 'datetimerange'].includes(item.type)) {
          forms.value[item.key] = item.value ? JSON.parse(item.value) : null;
        } else if (['number', 'date', 'datetime'].includes(item.type)) {
          forms.value[item.key] = item.value ? Number(item.value) : null;
        } else {
          forms.value[item.key] = item.value;
        }
      }
      configList.value = data;
    }
  });
};
const dictTypeMap: { [key: string]: string } = {
  radio: 'condor-dict-radio',
  checkbox: 'condor-dict-checkbox',
  default: 'condor-dict-select'
};
const fields = computed(() => {
  return configList.value.map((item: any) => {
    switch (item.type) {
      case 'number':
        return {
          ...item,
          component: {
            name: 'n-input-number'
          }
        };
      case 'textarea':
        return {
          ...item,
          component: {
            props: {
              type: 'textarea',
              rows: 4
            }
          }
        };
      case 'dict':
        return {
          ...item,
          component: {
            name: dictTypeMap[item.dict_type] || dictTypeMap.default,
            props: {
              code: item.dict_code
            }
          }
        };
      case 'switch':
        return {
          ...item,
          component: {
            name: 'n-switch',
            props: {
              checkedValue: '1',
              uncheckedValue: '2'
            }
          }
        };
      case 'date':
      case 'datetime':
      case 'daterange':
      case 'datetimerange':
        return {
          key: item.key,
          title: item.title,
          type: item.type,
          component: {
            name: 'n-date-picker',
            props: {
              type: item.type
            }
          }
        };
      case 'array':
        return {
          ...item,
          component: {
            name: 'condor-array'
          }
        };
      case 'image':
        return {
          ...item,
          component: {
            name: 'condor-upload'
          }
        };
      case 'images':
        return {
          ...item,
          component: {
            name: 'condor-upload',
            props: {
              multiple: true,
              max: 9
            }
          }
        };
      default:
        return item;
    }
  });
});
const updateGroup = (row: any) => {
  group.value = row;
  getList();
};

const addConfig = () => {
  layerFormRef.value.open({ type: 'add', title: '添加配置' });
  layerFormRef.value.setForm({ group_id: group.value.id, group_code: group.value.code }, 'group_id,group_code');
};

const edit = (row: any) => {
  layerFormRef.value.setForm(row, 'id,group_id,group_code,dict_type,dict_code');
  layerFormRef.value.open({ type: 'edit', title: '编辑配置' });
};

const toDel = (id: number) => {
  request({
    url: urls.del,
    method: 'POST',
    data: {
      id
    }
  }).then(({ error }) => {
    if (!error) {
      getList();
    }
  });
};
// 保存配置
const submit = () => {
  formRef.value.validate((valid: boolean) => {
    if (!valid) {
      request({
        url: urls.save,
        method: 'POST',
        data: {
          group_code: group.value.code,
          configs: forms.value
        }
      }).then(({ error, response }) => {
        if (!error) {
          window.$message?.success(response.data.msg);
        }
      });
    }
  });
};
// 重置配置
const resetForm = () => {
  forms.value = {};
  configList.value.forEach((item: any) => {
    forms.value[item.key] = item.type === 'number' ? Number(item.value) : item.value;
  });
};
</script>

<template>
  <div>
    <NGrid cols="1 700:3" :x-gap="12" class="rounded-md bg-white px-3">
      <NGridItem :span="1" class="my-3 border rounded-md">
        <ConfigGroup @update:active="updateGroup" />
      </NGridItem>
      <NGridItem :span="2" class="my-3 border rounded-md">
        <div class="flex items-center justify-between border-b border-[#e0e0e0] px-3 py-2">
          <div>{{ group.name || '' }}</div>
          <NButton size="small" type="primary" @click="addConfig">
            <icon-material-symbols-add-2 :font-size="16"></icon-material-symbols-add-2>
            <span class="ml-[5px]">添加配置</span>
          </NButton>
        </div>
        <NForm ref="formRef" label-placement="left" label-width="100px" :model="forms">
          <div v-for="(item, index) in fields" :key="index" class="config-form-item px-2 pt-2">
            <NFormItem :label="item.title" class="">
              <div class="w-full flex items-start justify-between">
                <div class="flex-1 pr-4">
                  <CondorFormItem v-model:value="forms[item.key]" :column="item" />
                </div>
                <div class="flex space-x-2">
                  <NButton size="small" text type="primary" @click="edit(item)">
                    <icon-ic-baseline-edit :font-size="14"></icon-ic-baseline-edit>
                  </NButton>
                  <NPopconfirm placement="top" confirm-type="error" @positive-click="toDel(item.id)">
                    <template #trigger>
                      <NButton size="small" text type="error">
                        <icon-material-symbols-delete-outline :font-size="14"></icon-material-symbols-delete-outline>
                      </NButton>
                    </template>
                    <div class="text-xs">确定要删除该配置吗？</div>
                  </NPopconfirm>
                </div>
              </div>
            </NFormItem>
          </div>
        </NForm>
        <div class="flex items-center justify-end pb-5 pr-3 space-x-2" :class="{ 'pt-4': !fields.length }">
          <NButton @click="resetForm">重置</NButton>
          <NButton type="primary" @click="submit">保存配置</NButton>
        </div>
      </NGridItem>
    </NGrid>
    <CondorLayerForm ref="layerFormRef" :columns="configColumns" :urls="urls" @on-ok="getList" />
  </div>
</template>

<style lang="scss" scoped>
.config-form-item {
  &:nth-child(2n + 1) {
    background-color: #f7fafc;
  }
}
</style>
