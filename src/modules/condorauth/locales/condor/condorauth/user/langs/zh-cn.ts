import type { CondorauthUserSchema } from '@/modules/condorauth/types/i18n/user';

const local: CondorauthUserSchema = {
  pid: '上级用户',
  vip_id: 'VIP等级',
  username: '用户名',
  please_input_the_username: '请输入用户名',
  nickname: '昵称',
  password: '密码',
  email: '邮箱',
  mobile: '手机号',
  avatar: '头像',
  level: '等级',
  gender: '性别',
  money: '余额',
  score: '积分',
  invite_code: '邀请码',
  consecutive_login_days: '连续登录天数',
  logintime: '登录时间',
  loginip: '登录IP',
  loginfailure: '登录失败次数',
  register_ip: '注册IP'
};

export default local;
