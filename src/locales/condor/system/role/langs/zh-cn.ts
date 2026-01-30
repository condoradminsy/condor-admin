import type { SystemRoleSchema } from '@/typings/condor/i18n/system/role';
const local: SystemRoleSchema = {
  name: '角色名称',
  rules: '权限规则',
  pid: '上级ID',
  code: '角色编码',
  code_tips: 'superadmin 为超级管理员',
  setting: '权限设置'
};

export default local;
