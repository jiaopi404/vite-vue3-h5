import type { AppRouteRecordRaw, Menu } from '/@/router/types';

import { defineStore } from 'pinia';
import { store } from '/@/store';
import { useI18n } from '/@/hooks/web/useI18n';
import { useUserStore } from './user';
import { useBusinessStoreWithOut } from './business';
import { useAppStoreWithOut } from './app';
import { toRaw } from 'vue';
import {
  transformObjToRoute,
  flatMultiLevelRoutes,
  transformRouteObjAfterBuildingMenus,
} from '/@/router/helper/routeHelper';
import { transformRouteToMenu } from '/@/router/helper/menuHelper';

import projectSetting from '/@/settings/projectSetting';

import { PermissionModeEnum } from '/@/enums/appEnum';

import { asyncRoutes } from '/@/router/routes';
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';

import { filter, forEach } from '/@/utils/helper/treeHelper';

import { getMenuList, getMenuNum } from '/@/api/sys/menu';
import { getPermCode } from '/@/api/sys/user';

import { useMessage } from '/@/hooks/web/useMessage';
import { PageEnum } from '/@/enums/pageEnum';
import { treeFlat, treeForEach } from '/@/utils/commonServe';

interface PermissionState {
  // Permission code list
  permCodeList: string[] | number[];
  // Whether the route has been dynamically added
  isDynamicAddedRoute: boolean;
  // To trigger a menu update
  lastBuildMenuTime: number;
  // Backstage menu list
  backMenuList: Menu[];
  frontMenuList: Menu[];
  menuIds: number[];
}
export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    permCodeList: [],
    // Whether the route has been dynamically added
    isDynamicAddedRoute: false,
    // To trigger a menu update
    lastBuildMenuTime: 0,
    // Backstage menu list
    backMenuList: [],
    // menu List
    frontMenuList: [],
    menuIds: [],
  }),
  getters: {
    getPermCodeList(): string[] | number[] {
      return this.permCodeList;
    },
    getBackMenuList(): Menu[] {
      return this.backMenuList;
    },
    getFrontMenuList(): Menu[] {
      return this.frontMenuList;
    },
    getLastBuildMenuTime(): number {
      return this.lastBuildMenuTime;
    },
    getIsDynamicAddedRoute(): boolean {
      return this.isDynamicAddedRoute;
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList;
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list;
      console.log('后端路由: ', list);
      list?.length > 0 && this.setLastBuildMenuTime();
    },

    setBackMenuListNumber(list: any[], menuNum) {
      this.backMenuList = list;
      forEach(this.backMenuList, (node) => {
        menuNum.forEach((item) => {
          if ('/' + item.routingAddress === node.path) {
            node.count = item.count;
          }
        });
      });
      this.backMenuList.forEach((item) => {
        if (item.children?.length > 0) {
          let count = 0;
          item.children?.forEach((citem) => {
            if (citem.count) {
              count = count + citem.count;
            }
          });
          item.count = count;
        }
      });
      console.log('数字', this.backMenuList);
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list;
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime();
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added;
    },
    resetState(): void {
      this.isDynamicAddedRoute = false;
      this.permCodeList = [];
      this.backMenuList = [];
      this.lastBuildMenuTime = 0;
    },
    async changePermissionCode() {
      const codeList = await getPermCode();
      this.setPermCodeList(codeList);
    },
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n();
      const userStore = useUserStore();
      const appStore = useAppStoreWithOut();
      const businessStore = useBusinessStoreWithOut();

      let routes: AppRouteRecordRaw[] = [];
      const roleList = toRaw(userStore.getRoleList) || [];
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig;

      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        const { roles } = meta || {};
        if (!roles) return true;
        return roleList.some((role) => roles.includes(role));
      };

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route;
        const { ignoreRoute } = meta || {};
        return !ignoreRoute;
      };

      /**
       * @description 根据设置的首页path，修正routes中的affix标记（固定首页）
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return;
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME;
        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/';
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route;
            const currentPath = path.startsWith('/') ? path : parentPath + path;
            route.meta = Object.assign({}, route.meta, { hidden: route.hidden });
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string;
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true });
                throw new Error('end');
              }
            }
            children && children.length > 0 && patcher(children, currentPath);
          });
        }
        try {
          patcher(routes);
        } catch (e) {
          // 已处理完毕跳出循环
        }
        return;
      };

      switch (permissionMode) {
        case PermissionModeEnum.ROLE:
          routes = filter(asyncRoutes, routeFilter);
          routes = routes.filter(routeFilter);
          // Convert multi-level routing to level 2 routing
          routes = flatMultiLevelRoutes(routes);
          break;

        case PermissionModeEnum.ROUTE_MAPPING:
          routes = filter(asyncRoutes, routeFilter);
          routes = routes.filter(routeFilter);
          const menuList = transformRouteToMenu(routes, true);
          routes = filter(routes, routeRemoveIgnoreFilter);
          routes = routes.filter(routeRemoveIgnoreFilter);
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0);
          });

          this.setFrontMenuList(menuList);
          // Convert multi-level routing to level 2 routing
          routes = flatMultiLevelRoutes(routes);
          break;

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage();

          createMessage.loading({
            content: t('sys.app.menuLoading'),
            duration: 1,
          });

          // !Simulate to obtain permission codes from the background,
          // this function may only need to be executed once, and the actual project can be put at the right time by itself
          let routeList: AppRouteRecordRaw[] = [];
          try {
            // this.changePermissionCode();
            routeList = await getMenuList({
              menuType: 1, // 业务端
              tagModules: businessStore.GET_TAG_MODULE_INFO?.id ?? -1, // 传入模块id
              year: businessStore.GET_YEAR, // 传入 year 参数
            });
          } catch (error) {
            console.error(error);
          }
          // Dynamically introduce components
          routeList = transformObjToRoute(routeList);

          //  Background routing to menu structure
          let routesF = filter(asyncRoutes, routeFilter);
          routesF = routesF.filter(routeFilter);
          const backMenuList = transformRouteToMenu([...routesF, ...routeList]);
          // routesF = filter(routesF, routeRemoveIgnoreFilter);
          // routesF = routesF.filter(routeRemoveIgnoreFilter);
          this.setBackMenuList(backMenuList);
          // TODO: 设置数字提醒
          const tagModulesId = businessStore.GET_TAG_MODULE_INFO?.id ?? -1;
          const menuFlatList = treeFlat(routeList, (item) => item);
          const menuIds = [];
          menuFlatList.forEach((item: any) => {
            if (item.id) {
              menuIds.push(item.id);
            }
          });
          // TODO: 存到 菜单的 store 里面
          this.menuIds = menuIds;
          const userInfo = useUserStore().getUserInfo;
          const params = {
            tagModule: tagModulesId,
            menuIds: menuIds.join(','),
            userId: userInfo.id,
            year: businessStore.GET_YEAR,
          };
          const menuNum = await getMenuNum(params);
          this.backMenuList = backMenuList;
          this.setBackMenuListNumber(backMenuList, menuNum);
          routeList = filter(routeList, routeRemoveIgnoreFilter);
          routeList = routeList.filter(routeRemoveIgnoreFilter);
          // remove meta.ignoreRoute item
          // TODO：多级路由
          routeList = flatMultiLevelRoutes(routeList);
          transformRouteObjAfterBuildingMenus(routeList);
          routes = [PAGE_NOT_FOUND_ROUTE, ...routesF, ...routeList];
          console.log('最新路由', routes);
          break;
      }

      routes.push(ERROR_LOG_ROUTE);
      patchHomeAffix(routes);
      return routes;
    },
  },
});

// Need to be used outside the setup
export function usePermissionStoreWithOut() {
  return usePermissionStore(store);
}
export function recursionArray(arr: any[], menuList: any[]) {
  arr.forEach((item) => {
    menuList.push(item.id);
    if (item.children.length > 0) {
      recursionArray(item, menuList);
    }
  });
}
