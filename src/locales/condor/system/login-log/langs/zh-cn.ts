import type { SystemLoginLogSchema } from '@/typings/condor/i18n/system/loginLog';
const local: SystemLoginLogSchema = {
  username: '用户名',
  os: '操作系统',
  browser: '浏览器',
  ip_location: 'IP 归属地',
  url: '请求地址',
  content: '内容',
  successful: '成功',
  failed: '失败'
};

export default local;
