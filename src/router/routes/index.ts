import { INDEX_LAYOUT } from '/@/router/constant';
import type { AppRouteRecordRaw, AppRouteModule } from '/@/router/types';

// import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from '/@/router/routes/basic';

import { mainOutRoutes } from './mainOut';
import { PageEnum } from '/@/enums/pageEnum';
import { t } from '/@/hooks/web/useI18n';

// const modules = import.meta.globEager('./modules/**/*.ts');

// const routeModuleList: AppRouteModule[] = [];

// Object.keys(modules).forEach((key) => {
//   const mod = modules[key].default || {};
//   const modList = Array.isArray(mod) ? [...mod] : [mod];
//   routeModuleList.push(...modList);
// });

// export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];
export const RootRoute: AppRouteRecordRaw = {
  path: '/',
  name: 'Root',
  component: () => import('/@/views/welcome/index.vue'),
  // redirect: PageEnum.BASE_HOME,
  meta: {
    title: 'Root',
  },
  // children: [
  //   {
  //     path: 'index',
  //     name: 'Index',
  //     component: () => import('/@/views/sys/index/Index.vue'),
  //     meta: {
  //       title: '首页',
  //     },
  //   },
  // ],
};

// export const LoginRoute: AppRouteRecordRaw = {
//   path: '/login',
//   name: 'Login',
//   component: () => import('/@/views/sys/login/Login.vue'),
//   meta: {
//     // ignoreKeepAlive: true,
//     title: t('routes.basic.login'),
//   },
// };

// web 公示路由
// export const WebPublicityRoute: AppRouteRecordRaw = {
//   path: '/web-publicity',
//   name: 'WebPublicity',
//   component: () => import('/@/views/web-publicity/index.vue'),
//   meta: {
//     title: '公示页',
//     ignoreAuth: true,
//   },
// };

// Basic routing without permission
export const basicRoutes = [
  // LoginRoute,
  // IndexRoute,
  RootRoute,
  ...mainOutRoutes,
  // REDIRECT_ROUTE,
  // PAGE_NOT_FOUND_ROUTE,
  // WebPublicityRoute,
];
