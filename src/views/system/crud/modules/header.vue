<script lang="ts" setup>
import { ref } from 'vue';
import { request } from '@/service/request';
defineOptions({
  name: 'CrudHeader'
});
const props = defineProps<{
  formList: any;
}>();
const formRef = ref();
const tableList = ref([]);
const options = ref([]);
const loading = ref(false);
const crudForm = ref({
  table: null as string | null,
  module: null as string | null,
  controller: '',
  model: '',
  frontend: localStorage.getItem('CONDOR_CRUD_FRONTEND') || '',
  menu_id: '',
  is_menu: true,
  is_force: false,
  menu_name: '',
  menu_title: '',
  menu_path: '',
  is_soft_delete: false,
  is_route: false,
  is_update_time: false,
  is_create_time: true,
  route_name: '',
  route_group: ''
});
const rules = ref({
  table: {
    required: true,
    message: '请选择数据表',
    trigger: ['blur', 'change']
  },
  module: {
    required: true,
    message: '请选择模块目录',
    trigger: ['blur', 'change']
  },
  controller: {
    required: true,
    message: '请输入控制器名称',
    trigger: ['blur', 'change']
  },
  model: {
    required: true,
    message: '请输入模型名称',
    trigger: ['blur', 'change']
  },
  menu_path: {
    required: true,
    message: '请输入菜单路径',
    trigger: ['blur', 'change']
  }
});
const collapsed = ref(false);
const prefix = ref('');
const emit = defineEmits<{
  (e: 'change', values: any): void;
}>();
const createCrudCode = () => {
  formRef.value.validate((valid: boolean) => {
    if (!valid) {
      loading.value = true;
      request({
        url: '/core/crud/create',
        method: 'post',
        data: {
          ...crudForm.value,
          fields: props.formList
        }
      })
        .then(({ error }) => {
          if (!error) {
            // 成功，弹窗展示代码
          }
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
};
request({
  url: '/core/crud/config'
}).then(({ error, data }) => {
  if (!error) {
    prefix.value = data.prefix;
    options.value = data.modules.map((item: string) => {
      return {
        label: item,
        value: item
      };
    });
    tableList.value = data.tables.map((item: string) => {
      return {
        label: item,
        value: item
      };
    });
  }
});
const getFields = () => {
  request({
    url: '/core/crud/fields',
    method: 'post',
    data: {
      table: crudForm.value.table
    }
  }).then(({ error, data }) => {
    if (!error) {
      emit('change', data);
    }
  });
};
const updateTableValue = (value: string) => {
  crudForm.value.table = value;
  const tableName = value.replace(prefix.value, '').replace(/_/g, ' ');
  const tableArr = tableName.split(' ');
  crudForm.value.menu_name = value.replace(prefix.value, '');
  let name = '';
  for (let i = 0; i < tableArr.length; i += 1) {
    name += tableArr[i].charAt(0).toUpperCase() + tableArr[i].slice(1);
  }
  crudForm.value.controller = `${name}Controller.php`;
  crudForm.value.model = `${name}.php`;
  getFields();
};
const frontentChange = (value: string) => {
  localStorage.setItem('CONDOR_CRUD_FRONTEND', value);
};
const onlyAllowLetter = (value: string) => {
  return !value || /^[a-zA-Z]+$/.test(value);
};
</script>

<template>
  <NForm ref="formRef" :model="crudForm" :rules="rules" label-placement="left">
    <CondorGrid :collapsed="collapsed" :gap="[15, 0]" :cols="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }">
      <CondorGridItem :index="0">
        <NFormItem label="数据表名" path="table">
          <NSelect
            :value="crudForm.table"
            placeholder="请选择数据表"
            clearable
            :options="tableList"
            @update:value="updateTableValue"
          ></NSelect>
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="1">
        <NFormItem label="模块目录" path="module">
          <NSelect v-model:value="crudForm.module" :options="options" placeholder="请选择模块目录" clearable></NSelect>
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="2">
        <NFormItem label="控制器" path="controller">
          <NInput v-model:value="crudForm.controller" :allow-input="onlyAllowLetter"></NInput>
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="3">
        <NFormItem label="模型" path="model">
          <NInput v-model:value="crudForm.model" :allow-input="onlyAllowLetter" />
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="4">
        <div class="flex items-center justify-around space-x-2">
          <NFormItem label="生成菜单" path="is_menu">
            <NSwitch v-model:value="crudForm.is_menu" />
          </NFormItem>
          <NFormItem label="强制覆盖" path="is_force">
            <NSwitch v-model:value="crudForm.is_force" />
          </NFormItem>
        </div>
      </CondorGridItem>
      <CondorGridItem :index="5">
        <NFormItem label="父级菜单" path="menu_id">
          <CondorTreeSelect
            v-model:value="crudForm.menu_id"
            placeholder="请选择父级菜单"
            clearable
            url="core/menu/selectpage"
            label-field="title"
          ></CondorTreeSelect>
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="6">
        <NFormItem label="菜单名称" path="menu_name">
          <NInput v-model:value="crudForm.menu_name" :allow-input="value => !value || /^[a-zA-Z0-9_]+$/.test(value)" />
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="7">
        <NFormItem label="菜单标题" path="menu_title">
          <NInput v-model:value="crudForm.menu_title" />
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="8">
        <NFormItem label="菜单路径" path="menu_path">
          <NInput v-model:value="crudForm.menu_path" :allow-input="value => !value || /^[a-zA-Z_/-]+$/.test(value)" />
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="9">
        <div class="flex items-center justify-around space-x-2">
          <NFormItem label="创建时间" path="is_create_time">
            <NSwitch v-model:value="crudForm.is_create_time" />
          </NFormItem>
          <NFormItem label="更新时间" path="is_update_time">
            <NSwitch v-model:value="crudForm.is_update_time" />
          </NFormItem>
        </div>
      </CondorGridItem>
      <CondorGridItem :index="10">
        <div class="flex items-center justify-around space-x-2">
          <NFormItem label="生成路由" path="is_route">
            <NSwitch v-model:value="crudForm.is_route" />
          </NFormItem>
          <NFormItem label="软删除" path="is_soft_delete">
            <NSwitch v-model:value="crudForm.is_soft_delete" />
          </NFormItem>
        </div>
      </CondorGridItem>
      <CondorGridItem :index="11">
        <NFormItem label="路由分组" path="route_group">
          <NInput v-model:value="crudForm.route_group" :allow-input="value => !value || /^[a-zA-Z/-]+$/.test(value)" />
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="12">
        <NFormItem label="路由名称" path="route_name">
          <NInput
            v-model:value="crudForm.route_name"
            :allow-input="value => !value || /^[a-zA-Z0-9_-]+$/.test(value)"
          />
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem :index="13" :span="2">
        <NFormItem label="VUE路径" path="frontend">
          <NInput v-model:value="crudForm.frontend" @change="frontentChange" />
        </NFormItem>
      </CondorGridItem>
      <CondorGridItem suffix>
        <NFormItem>
          <div class="opearation w-full flex items-center justify-start sm:justify-end space-x-2">
            <NButton type="primary" :loading="loading" @click="createCrudCode">
              <span>生成 CRUD 代码</span>
            </NButton>
            <NButton type="tertiary" @click="collapsed = !collapsed">
              <span>{{ collapsed ? '展开' : '折叠' }}</span>
              <icon-ic-sharp-keyboard-arrow-down
                class="text-22px transition-all delay-100"
                :class="{ 'rotate-180': !collapsed }"
              />
            </NButton>
          </div>
        </NFormItem>
      </CondorGridItem>
    </CondorGrid>
  </NForm>
</template>
