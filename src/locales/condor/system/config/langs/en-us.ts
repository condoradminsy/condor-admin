import type { SystemConfigSchema } from '@/typings/condor/i18n/system/config';
const local: SystemConfigSchema = {
  key: 'Key Name',
  key_required: 'Variable name cannot be empty',
  title: 'Variable Title',
  title_required: 'Variable title cannot be empty',
  value: 'Variable Value',
  type: 'Variable Type',
  type_required: 'Variable type cannot be empty',
  dict_type: 'Dict Type',
  dict_type_required: 'Dict type cannot be empty',
  dict_code: 'Associative Dictionary',
  dict_code_required: 'Associated dictionary cannot be empty',
  is_visible: 'Is visible',
  weigh: 'Weight',
  tips: 'Variable Tips',
  add_config: 'Add Config',
  update_config: 'Update Config',
  delete_config_tips: 'Are you sure you want to delete this configuration?',
  save_config: 'Save Config',
  name: 'Group Name',
  name_required: 'Group name cannot be empty',
  code: 'Group Code',
  code_required: 'Group code cannot be empty',
  remark: 'Remark',
  update_group: 'Update Group',
  add_group: 'Add Group',
  config_group: 'Config Group',
  delete_group_tips: 'Are you sure you want to delete this group?'
};

export default local;
