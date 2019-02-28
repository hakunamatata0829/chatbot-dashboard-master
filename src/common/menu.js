import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: 'Roles',
    icon: 'user',
    path: 'roles',
  },
  {
    name: 'Locations',
    icon: 'profile',
    path: 'locations',
  },
  {
    name: 'Applicants',
    icon: 'team',
    path: 'applicants',
  },
  {
    name: 'Billing',
    icon: 'idcard',
    path: 'billing',
    children: [
      {
        name: 'Plans',
        path: 'plans',
      },
      {
        name: 'Cards',
        path: 'payment',
      },
      {
        name: 'Invoices',
        path: 'invoices',
      },
    ],
  },
  {
    name: 'Settings',
    icon: 'setting',
    path: 'settings',
  },
  {
    name: 'User',
    icon: 'user',
    path: 'user',
    authority: 'guest',
    children: [
      {
        name: 'Login',
        path: 'login',
      },
      {
        name: 'Register',
        path: 'register',
      },
      {
        name: 'Register Result',
        path: 'register-result',
      },
    ],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
