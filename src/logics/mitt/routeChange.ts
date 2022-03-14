/**
 * Used to monitor routing changes to change the status of menus and tabs. There is no need to monitor the route, because the route status change is affected by the page rendering time, which will be slow
 */

import mitt from '/@/utils/mitt';
import type { RouteLocationNormalized } from 'vue-router';
import { getRawRoute } from '/@/utils';
import { useBusinessStoreWithOut } from '/@/store/modules/business';

const emitter = mitt();

const key = Symbol();

let lastChangeTab: RouteLocationNormalized;

export function setRouteChange(lastChangeRoute: RouteLocationNormalized) {
  const businessStore = useBusinessStoreWithOut();

  const r = getRawRoute(lastChangeRoute);
  // 附加上 store 里面的 currentActiveRoute
  if (businessStore.GET_CURRENT_ACTIVE_MENU) {
    r.meta.currentActiveMenu = businessStore.GET_CURRENT_ACTIVE_MENU;
  }
  emitter.emit(key, r);
  lastChangeTab = r;
}

export function listenerRouteChange(
  callback: (route: RouteLocationNormalized) => void,
  immediate = true,
) {
  emitter.on(key, callback);
  immediate && lastChangeTab && callback(lastChangeTab);
}

export function removeTabChangeListener() {
  emitter.clear();
}
