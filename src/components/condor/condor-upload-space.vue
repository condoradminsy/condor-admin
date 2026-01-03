<script setup lang="ts">
import { h, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { request } from '@/service/request';
import { getBaseUrl } from '@/service/request/shared';
import { useDictStore } from '@/store/modules/dict';
defineOptions({
  name: 'CondorUploadSpace'
});
const { baseURL } = getBaseUrl();
const dictStore = useDictStore();
const modalRef = ref();
const imageList = ref<any>([]);
const showRef = ref(false);
const imageUrl = ref('');
const values = ref<string[]>([]);
const params = ref({
  page: 1,
  limit: 40,
  'a.type_id': 0,
  'a.type': 'all'
});
const total = ref(0);
const typeMap: any = {
  video: 'ion-film-outline',
  audio: 'gridicons-audio',
  txt: 'tabler-file-type-txt',
  word: 'ep-document',
  excel: 'mdi-microsoft-excel',
  ppt: 'lsicon-file-ppt-filled',
  pdf: 'lsicon-file-pdf-outline',
  zip: 'hugeicons-zip-02',
  other: 'solar-documents-bold'
};
const emit = defineEmits<{
  (e: 'onSelect', value: string[]): void;
}>();
const getList = () => {
  request({
    url: '/core/attachment/index',
    method: 'post',
    data: params.value
  }).then(({ error, data }) => {
    if (!error) {
      imageList.value = data.list;
      total.value = data.total;
    }
  });
};
getList();

const handleCurrentChange = (page: number) => {
  params.value.page = page;
  getList();
};

const handleSizeChange = (size: number) => {
  params.value.limit = size;
  params.value.page = 1;
  getList();
};

const selectType = (id: number) => {
  params.value['a.type_id'] = id;
  params.value.page = 1;
  getList();
};

const navChange = (index: number) => {
  const row = dictStore.dictData.attachment_type[index];
  params.value['a.type'] = row.value;
  params.value.page = 1;
  getList();
};

const previewImage = (url: string) => {
  imageUrl.value = url.startsWith('http') ? url : `${baseURL}${url}`;
  showRef.value = true;
};

const selectImage = (url: string) => {
  // 如果存在，移除
  const index = values.value.indexOf(url);
  if (index > -1) {
    values.value.splice(index, 1);
  } else {
    values.value.push(url);
  }
};

const onOk = () => {
  emit('onSelect', values.value);
  modalRef.value.close();
};

defineExpose({
  open() {
    values.value = [];
    modalRef.value.open({ title: '选择图片' });
  }
});
</script>

<template>
  <CondorModal ref="modalRef" width="1000px" @on-ok="onOk">
    <NGrid cols="12" :x-gap="12">
      <NGridItem :span="3">
        <CondorAttachmentType :value="params['a.type_id']" @update:value="selectType" />
      </NGridItem>
      <NGridItem :span="9" class="rounded-md">
        <CondorNav :list="dictStore.dictData.attachment_type" @change="navChange"></CondorNav>
        <div class="grid grid-cols-8 gap-[8px]">
          <div
            v-for="(item, index) in imageList"
            :key="index"
            class="parent parent relative h-[82px] flex items-center justify-center rounded-md bg-gray-100 p-[5px]"
            @click="selectImage(item.url)"
          >
            <div
              class="mask-box absolute left-0 top-0 hidden h-full w-full"
              :class="{ 'parent-hover:block': item.type === 'image' }"
            >
              <div class="h-full w-full flex items-center justify-center">
                <icon-ic-round-remove-red-eye
                  color="white"
                  font-size="20px"
                  class="cursor-pointer"
                  @click.stop="previewImage(item.url)"
                />
              </div>
            </div>
            <img
              v-if="values.includes(item.url)"
              class="absolute bottom-0 right-0 z-10 w-[25px]"
              src="@/assets/imgs/selected.png"
              draggable="false"
            />
            <img
              v-if="item.type === 'image'"
              :src="item.url.startsWith('http') ? item.url : `${baseURL}${item.url}`"
              class="h-full w-full object-contain"
            />
            <div v-else class="h-full w-full flex items-center justify-center">
              <component :is="h(Icon, { icon: typeMap[item.type] })" class="text-4xl text-gray-500" />
            </div>
          </div>
        </div>
        <div v-if="!imageList.length" class="pt-3">
          <NResult status="info" title="" description="暂无数据"></NResult>
        </div>
        <div class="w-full flex justify-end pt-4">
          <NPagination
            v-model:page="params.page"
            v-model:page-size="params.limit"
            :item-count="total"
            @update:page="handleCurrentChange"
            @update-page-size="handleSizeChange"
          />
        </div>
      </NGridItem>
    </NGrid>
    <NImagePreview v-model:show="showRef" :src="imageUrl" />
  </CondorModal>
</template>

<style scoped>
.mask-box {
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
