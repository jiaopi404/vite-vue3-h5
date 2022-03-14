import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const backIndex: AppRouteModule = {
  path: '/sys',
  name: '返回平台',
  component: LAYOUT,
  redirect: '/index',
  meta: {
    hideChildrenInMenu: true,
    orderNo: 10,
    // icon: 'ion:grid-outline',
    // title: '模块首页',
  },
  children: [
    // 招标采购得 dashboard
    {
      path: 'index',
      name: 'index',
      component: () => import('/@/views/sys/index/index.vue'),
      meta: {
        // affix: true,
        // title: '返回平台',
      },
    },
  ],
};

export default backIndex;
