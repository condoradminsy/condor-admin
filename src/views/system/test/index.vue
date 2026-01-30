<script setup lang="ts">
import { ref } from 'vue';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/system-test/index',
    add: '/core/system-test/add',
    edit: '/core/system-test/edit',
    del: '/core/system-test/del'
  },
  rowKey(row) {
    return row.id;
  },
  columns: [
    {
      title: 'ID',
      key: 'id',
      form: false,
      operator: false,
      visible: false
    },
    {
      title() {
        return $t('system.test.name');
      },
      key: 'name',
      operator: 'like'
    },
    {
      title() {
        return $t('system.test.target');
      },
      key: 'target',
      operator: false,
      visible: false,
      component: {
        props: {
          type: 'textarea',
          rows: 4
        }
      }
    },
    {
      title() {
        return $t('system.test.title');
      },
      key: 'title',
      operator: 'like'
    },
    {
      title() {
        return $t('system.test.content');
      },
      key: 'content',
      operator: false,
      visible: false,
      component: {
        name: 'condor-editor'
      }
    },
    {
      title() {
        return $t('system.test.image');
      },
      key: 'image',
      operator: false,
      component: {
        name: 'condor-upload',
        props: {
          max: 1,
          multiple: false
        }
      }
    },
    {
      title() {
        return $t('system.test.images');
      },
      key: 'images',
      operator: false,
      visible: false,
      component: {
        name: 'condor-upload',
        props: {
          max: 9,
          multiple: true
        }
      }
    },
    {
      title() {
        return $t('system.test.attachfile');
      },
      key: 'attachfile',
      operator: false,
      component: {
        name: 'condor-upload',
        props: {
          max: 1,
          multiple: false
        }
      }
    },
    {
      title() {
        return $t('system.test.keywords');
      },
      key: 'keywords',
      operator: false,
      component: {
        props: {
          type: 'textarea',
          rows: 4
        }
      }
    },
    {
      title() {
        return $t('system.test.description');
      },
      key: 'description',
      operator: false,
      component: {
        props: {
          type: 'textarea',
          rows: 4
        }
      }
    },
    {
      title() {
        return $t('system.test.price');
      },
      key: 'price',
      component: {
        name: 'n-input-number',
        props: {
          showButton: false
        }
      }
    },
    {
      title() {
        return $t('system.test.views');
      },
      key: 'views',
      component: {
        name: 'n-input-number',
        props: {
          showButton: false
        }
      }
    },
    {
      title() {
        return $t('system.test.activitytime');
      },
      key: 'activitytime',
      operator: 'between',
      component: {
        name: 'n-date-picker',
        props: {
          type: 'datetime'
        }
      }
    },
    {
      title() {
        return $t('system.test.refreshtime');
      },
      key: 'refreshtime',
      operator: 'between',
      component: {
        name: 'n-date-picker',
        props: {
          type: 'datetime'
        }
      }
    },
    {
      title() {
        return $t('condor.common.createtime');
      },
      key: 'createtime',
      form: false,
      operator: 'between'
    },
    {
      title() {
        return $t('condor.common.updatetime');
      },
      key: 'updatetime',
      form: false,
      operator: false,
      visible: false
    }
  ]
});
</script>

<template>
  <div>
    <CondorTable :config="config" />
  </div>
</template>
