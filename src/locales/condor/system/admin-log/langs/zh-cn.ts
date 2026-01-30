import type { SystemAdminLogSchema } from '@/typings/condor/i18n/system/adminLog';
const local: SystemAdminLogSchema = {
  username: '操作人',
  title: '标题',
  os: '操作系统',
  browser: '浏览器',
  ip_location: 'IP 归属地',
  url: '请求地址',
  content: '内容'
};

export default local;
