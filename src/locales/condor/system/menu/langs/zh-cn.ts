import type { SystemMenuSchema } from '@/typings/condor/i18n/system/menu';
const local: SystemMenuSchema = {
  title: '标题',
  please_input_the_title: '请输入标题',
  name: '名称',
  please_input_the_name: '请输入名称',
  parent_menu: '父级菜单',
  i18nkey: '国际化键',
  weigh: '权重',
  path: '路径',
  component: '组件',
  menu_type: '菜单类型',
  active_menu: '选中的菜单项',
  redirect: '重定向',
  hidden: '是否隐藏',
  is_keep: '是否缓存',
  the_menu_active_menu_tips: '当前路由需要选中的菜单项(用于跳转至不在左侧菜单显示的路由且需要高亮某个菜单的情况)'
};

export default local;
