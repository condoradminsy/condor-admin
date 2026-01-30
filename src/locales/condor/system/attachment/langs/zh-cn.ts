import type { SystemAttachmentSchema } from '@/typings/condor/i18n/system/attachment';
const local: SystemAttachmentSchema = {
  type_id: '分组',
  url: '文件',
  storage: '储存位置',
  filename: '文件名',
  filesize: '文件大小',
  type: '文件类型',
  mimetype: 'MIME类型',
  upload: '上传文件'
};

export default local;
