import type { SystemConfigSchema } from '@/typings/condor/i18n/system/config';
const local: SystemConfigSchema = {
  key: '变量名',
  key_required: '变量名不能为空',
  title: '变量标题',
  title_required: '变量标题不能为空',
  value: '变量值',
  type: '变量类型',
  type_required: '变量类型不能为空',
  dict_type: '字典类型',
  dict_type_required: '字典类型不能为空',
  dict_code: '关联字典',
  dict_code_required: '关联字典不能为空',
  is_visible: '是否可见',
  weigh: '权重',
  tips: '变量说明',
  add_config: '添加配置',
  update_config: '编辑配置',
  delete_config_tips: '确定要删除该配置吗？',
  save_config: '保存配置',
  name: '分组名称',
  name_required: '分组名称不能为空',
  code: '分组标识',
  code_required: '分组标识不能为空',
  remark: '备注',
  update_group: '编辑分组',
  add_group: '添加分组',
  config_group: '配置分组',
  delete_group_tips: '确定要删除该分组吗？'
};

export default local;
