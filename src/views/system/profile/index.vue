<script setup lang="ts">
import { ref } from 'vue';
import { fetchUpdateProfile } from '@/service/api';
import { useAuthStore } from '@/store/modules/auth';
import { $t } from '@/locales';

const config = ref<Condor.Table.Config>({
  urls: {
    index: '/core/admin-log/index'
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
      key: 'title',
      align: 'left',
      title() {
        return $t('condor.common.title');
      },
      operator: 'like'
    },
    {
      key: 'ip',
      title: 'IP',
      operator: false
    },
    {
      key: 'url',
      title() {
        return $t('condor.common.url');
      },
      width: 200,
      operator: false
    },
    {
      key: 'createtime',
      title() {
        return $t('condor.common.createtime');
      },
      width: 200,
      form: false,
      operator: false
    }
  ]
});
const authStore = useAuthStore();
const avatar = ref(authStore.userInfo.avatar);
const email = ref(authStore.userInfo.email);
const password = ref('');
const isLoading = ref(false);
const submit = () => {
  isLoading.value = true;
  fetchUpdateProfile({
    avatar: avatar.value,
    email: email.value,
    password: password.value
  })
    .then(({ error }) => {
      if (!error) {
        authStore.initUserInfo();
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<template>
  <div>
    <NGrid cols="1 700:12" :x-gap="12" class="rounded-md bg-white px-3 dark:bg-black">
      <NGridItem :span="4" class="border rounded-md dark:border-[#333]">
        <div class="p-4">
          <div class="font-bold">{{ $t('route.system_profile') }}</div>
          <div class="flex justify-center pt-5">
            <CondorUpload v-model:value="avatar"></CondorUpload>
          </div>
          <div class="py-3 text-center font-bold">{{ authStore.userInfo.username }}</div>
          <NForm>
            <NFormItem :label="$t('condor.common.username')">
              <NInput :value="authStore.userInfo.username" disabled></NInput>
            </NFormItem>
            <NFormItem :label="$t('condor.common.email')">
              <NInput v-model:value="email"></NInput>
            </NFormItem>
            <NFormItem :label="$t('condor.common.password')">
              <NInput v-model:value="password" type="password" :show-password-toggle="true"></NInput>
            </NFormItem>
            <NFormItem>
              <NButton type="primary" block :loading="isLoading" @click="submit">{{ $t('condor.route.save') }}</NButton>
            </NFormItem>
          </NForm>
        </div>
      </NGridItem>
      <NGridItem :span="8" class="border rounded-md dark:border-[#333]">
        <CondorTable :config="config" :buttons="['refresh']" />
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped></style>
