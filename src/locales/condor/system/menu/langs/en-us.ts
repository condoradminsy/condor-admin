import type { SystemMenuSchema } from '@/typings/condor/i18n/system/menu';
const local: SystemMenuSchema = {
  title: 'Title',
  please_input_the_title: 'Please input the title',
  name: 'Name',
  please_input_the_name: 'Please input the name',
  parent_menu: 'Parent Menu',
  i18nkey: 'I18n Key',
  weigh: 'Weight',
  path: 'Path',
  component: 'Component',
  menu_type: 'Menu Type',
  active_menu: 'Active Menu',
  redirect: 'Redirect',
  hidden: 'Is Hidden',
  is_keep: 'Is Keep',
  the_menu_active_menu_tips:
    'The menu item that should be selected for the current route (used when navigating to routes not displayed in the sidebar but requiring a specific menu item to be highlighted).'
};

export default local;
