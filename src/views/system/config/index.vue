<script setup lang="ts">
import { computed, ref } from 'vue';
import { request } from '@/service/request';
import { useThemeStore } from '@/store/modules/theme';
import { $t, getValueByLocale } from '@/locales';
import ConfigGroup from './modules/config-group.vue';

const themeStore = useThemeStore();
const group = ref<{
  id: number;
  name: any;
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
  add: '/core/config/add',
  edit: '/core/config/edit',
  del: '/core/config/del',
  index: '/core/config/index',
  save: '/core/config/save'
};
const configColumns = [
  {
    key: 'key',
    title() {
      return $t('system.config.key');
    },
    component: {
      props: {
        allowInput: (value: string) => !value || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)
      }
    },
    rules: [
      {
        required: true,
        message() {
          return $t('system.config.key_required');
        }
      }
    ]
  },
  {
    key: 'title',
    title() {
      return $t('system.config.title');
    },
    rules: [
      {
        required: true,
        message() {
          return $t('system.config.title_required');
        }
      }
    ]
  },
  {
    key: 'value',
    title() {
      return $t('system.config.value');
    },
    component: {
      props: {
        type: 'textarea',
        rows: 2
      }
    }
  },
  {
    key: 'type',
    title() {
      return $t('system.config.type');
    },
    rules: [
      {
        required: true,
        message() {
          return $t('system.config.type_required');
        }
      }
    ],
    component: {
      name: 'condor-dict-select',
      props: {
        code: 'config_form_type'
      }
    }
  },
  {
    key: 'dict_type',
    title() {
      return $t('system.config.dict_type');
    },
    rules: [
      {
        required: true,
        message() {
          return $t('system.config.dict_type_required');
        }
      }
    ],
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
    title() {
      return $t('system.config.dict_code');
    },
    rules: [
      {
        required: true,
        message() {
          return $t('system.config.dict_code_required');
        }
      }
    ],
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
    title() {
      return $t('system.config.is_visible');
    },
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
    title() {
      return $t('system.config.weigh');
    },
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
    title() {
      return $t('system.config.tips');
    },
    component: {
      props: {
        type: 'textarea',
        rows: 2
      }
    }
  },
  {
    key: 'status',
    title() {
      return $t('condor.common.status');
    },
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
const testEmail = ref('');
const loading = ref(false);
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
            name: 'n-input-number',
            props: {
              showButton: false
            }
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
      case 'editor':
        return {
          ...item,
          component: {
            name: 'condor-editor'
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
  layerFormRef.value.open({ type: 'add', title: $t('system.config.add_config') });
  layerFormRef.value.setForm({ group_id: group.value.id, group_code: group.value.code }, 'group_id,group_code');
};

const edit = (row: any) => {
  layerFormRef.value.setForm(row, 'id,group_id,group_code,dict_type,dict_code');
  layerFormRef.value.open({ type: 'edit', title: $t('system.config.update_config') });
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
// 测试邮件发送
const testEmailSend = () => {
  if (!testEmail.value) {
    window.$message?.error($t('system.config.test_email_required'));
    return;
  }
  loading.value = true;
  request({
    url: '/core/config/send-test-email',
    method: 'POST',
    data: {
      email: testEmail.value
    }
  })
    .then(({ error, response }) => {
      if (!error) {
        window.$message?.success(response.data.msg);
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>

<template>
  <div>
    <NGrid cols="1 700:7" :x-gap="12" class="rounded-md bg-white px-3 dark:bg-black">
      <NGridItem :span="2" class="my-3 border rounded-md dark:border-[#333]">
        <ConfigGroup @update:active="updateGroup" />
      </NGridItem>
      <NGridItem :span="5" class="my-3 border rounded-md dark:border-[#303133]">
        <div class="flex items-center justify-between border-b border-[#e0e0e0] px-3 py-2 dark:border-[#303133]">
          <div>{{ getValueByLocale(group.name) }}</div>
          <NButton size="small" type="primary" @click="addConfig">
            <icon-material-symbols-add-2 :font-size="16"></icon-material-symbols-add-2>
            <span class="ml-[5px]">{{ $t('system.config.add_config') }}</span>
          </NButton>
        </div>
        <NForm ref="formRef" label-placement="left" label-width="150px" :model="forms">
          <div
            v-for="(item, index) in fields"
            :key="index"
            class="config-form-item px-2 pt-2"
            :class="{ 'is-dark': themeStore.darkMode }"
          >
            <NFormItem :label="getValueByLocale(item.title)" class="">
              <div class="w-full flex items-start justify-between pr-2">
                <div class="flex-1 pr-4">
                  <CondorFormItem v-model:value="forms[item.key]" :column="item" />
                  <div v-if="item.tips" class="pt-1 text-xs text-gray-500">{{ getValueByLocale(item.tips) }}</div>
                </div>
                <div v-if="item.is_sys != 1" class="flex space-x-2">
                  <NButton size="small" text type="primary" @click="edit(item)">
                    <icon-ic-baseline-edit :font-size="14"></icon-ic-baseline-edit>
                  </NButton>
                  <NPopconfirm placement="top" confirm-type="error" @positive-click="toDel(item.id)">
                    <template #trigger>
                      <NButton size="small" text type="error">
                        <icon-material-symbols-delete-outline :font-size="14"></icon-material-symbols-delete-outline>
                      </NButton>
                    </template>
                    <div class="text-xs">{{ $t('system.config.delete_config_tips') }}</div>
                  </NPopconfirm>
                </div>
              </div>
            </NFormItem>
          </div>
        </NForm>
        <div
          class="flex items-center px-3 pb-5"
          :class="{
            'pt-4': !fields.length,
            'justify-between': group.code === 'email_config',
            'justify-end': group.code !== 'email_config'
          }"
        >
          <div v-if="group.code === 'email_config'" class="w-1/2 flex items-center pl-5 space-x-2">
            <NInput v-model:value="testEmail" :placeholder="$t('system.config.test_email')" />
            <NButton type="primary" :loading="loading" @click="testEmailSend">
              {{ $t('system.config.test_email_send') }}
            </NButton>
          </div>
          <div class="flex items-center space-x-2">
            <NButton @click="resetForm">{{ $t('common.reset') }}</NButton>
            <NButton type="primary" @click="submit">{{ $t('system.config.save_config') }}</NButton>
          </div>
        </div>
      </NGridItem>
    </NGrid>
    <CondorLayerForm
      ref="layerFormRef"
      :multilingual-fields="['title', 'tips']"
      :columns="configColumns"
      :urls="urls"
      @on-ok="getList"
    />
  </div>
</template>

<style lang="scss" scoped>
.config-form-item {
  &:nth-child(2n + 1) {
    background-color: #f7fafc;
  }
  &.is-dark {
    &:nth-child(2n + 1) {
      background-color: #0b0f18;
    }
  }
}
</style>
