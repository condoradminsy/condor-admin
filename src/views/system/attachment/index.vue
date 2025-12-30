<script setup lang="ts">
import { ref } from 'vue';
const header = ref<Condor.Table.Header>({
  // tips: 'This is a header tip',
  params: [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option sdfsdf3', value: 3 },
    { label: 'Option 4', value: 4 },
    { label: 'Option 5', value: 5 },
    { label: 'Option 6', value: 6 }
  ],
  index: 1
});

const config = ref<Condor.Table.Config>({
  urls: {
    index: 'core/attachment/index',
    add: 'core/attachment/upload',
    del: 'core/attachment/del'
  },
  rowKey(row) {
    return row.id;
  },
  columns: [
    {
      type: 'selection',
      key: 'id',
      title: 'ID'
    },
    {
      key: 'name',
      title: 'Name',
      operator: 'like',
      component: {
        name: 'n-input',
        props: {
          placeholder: 'Please enter name'
        }
      }
    },
    {
      key: 'age',
      title: 'Age',
      component: {
        name: 'n-input-number',
        props: {
          class: 'w-full'
        }
      }
    },
    {
      key: 'email',
      title: 'Email'
    },
    {
      key: 'created_at',
      title: 'created_at'
    },
    {
      key: 'mobile',
      title: 'mobile'
    },
    {
      key: 'status',
      title: 'Status',
      component: {
        name: 'n-switch',
        props: {
          checkedValue: 1,
          uncheckedValue: 0
        }
      }
    },
    {
      key: 'id',
      title: 'Role',
      component: {
        name: 'n-input-number',
        props: {
          showButton: false
        }
      }
    },
    {
      type: 'operate',
      title: 'Operation',
      width: 200,
      key: 'operation',
      buttons: ['edit', 'del']
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :header="header" :config="config" />
  </div>
</template>
