import { cloneDeep } from 'lodash-es';
import { DictionaryI } from './../../../types/business.d';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { BUSINESS_STATE_KEY } from '/@/enums/cacheEnum';
import { RouteLocationNormalized } from 'vue-router';
import { getRawRoute } from '/@/utils';
import { HiddenMenuPrefixEnum } from '/@/enums/menuFullPathEnum';
export interface BusinessState {
  tagModuleInfo: Nullable<DictionaryI>;
  year: number;
  tagModuleList: DictionaryI[]; // 模块字典列表
  currentActiveMenu: string; // 用于维持左侧菜单展开状态的缓存
  [key: string]: any;
}
const DEFAULT_STATE: BusinessState = {
  tagModuleInfo: null,
  year: new Date().getFullYear(),
  tagModuleList: [],
  currentActiveMenu: '',
};
export const useBusinessStore = defineStore({
  id: 'lx-business-store',
  state: (): BusinessState => cloneDeep(DEFAULT_STATE),
  getters: {
    GET_TAG_MODULE_INFO(): Nullable<DictionaryI> {
      return this.tagModuleInfo
        ? this.tagModuleInfo
        : getAuthCache<BusinessState>(BUSINESS_STATE_KEY)?.tagModuleInfo || null;
    },
    GET_YEAR(): number {
      return getAuthCache<BusinessState>(BUSINESS_STATE_KEY)?.year || this.year;
    },
    GET_TAG_MODULE_LIST(): DictionaryI[] {
      return this.tagModuleList.length
        ? this.tagModuleList
        : getAuthCache<BusinessState>(BUSINESS_STATE_KEY)?.tagModuleList || [];
    },
    GET_CURRENT_ACTIVE_MENU(): string {
      return this.currentActiveMenu
        ? this.currentActiveMenu
        : getAuthCache<BusinessState>(BUSINESS_STATE_KEY)?.currentActiveMenu || '';
    },
  },
  actions: {
    // 设置模块信息
    SET_TAG_MODULE_INFO(tagModuleInfo: DictionaryI): void {
      this.tagModuleInfo = tagModuleInfo;
      const curState = getAuthCache<BusinessState>(BUSINESS_STATE_KEY);
      setAuthCache(BUSINESS_STATE_KEY, { ...curState, tagModuleInfo });
    },
    // 清空模块信息
    RESET_TAG_MODULE_INFO(): void {
      this.tagModuleInfo = null;
      const curState = getAuthCache<BusinessState>(BUSINESS_STATE_KEY);
      setAuthCache(BUSINESS_STATE_KEY, { ...curState, tagModuleInfo: null });
    },
    SET_YEAR(year: number): void {
      this.year = year;
      const curState = getAuthCache<BusinessState>(BUSINESS_STATE_KEY);
      setAuthCache(BUSINESS_STATE_KEY, { ...curState, year });
    },
    // 设置模块列表
    SET_TAG_MODULE_LIST(tagModuleList: DictionaryI[]): void {
      this.tagModuleList = tagModuleList;
      const curState = getAuthCache<BusinessState>(BUSINESS_STATE_KEY);
      setAuthCache(BUSINESS_STATE_KEY, { ...curState, tagModuleList });
    },
    SET_CURRENT_ACTIVE_MENU(payload: {
      to: RouteLocationNormalized;
      from: RouteLocationNormalized;
    }): void {
      let { to, from } = payload;
      to = getRawRoute(to);
      from = getRawRoute(from);

      if (to.meta.hidden === true) {
        this.currentActiveMenu = from.path;
      } else {
        this.currentActiveMenu = '';
      }
      // if (!isHiddenMenu(from) && isHiddenMenu(to)) {
      //   this.currentActiveMenu = from.path;
      // } else if (isHiddenMenu(from) && isHiddenMenu(to)) {
      //   // 啥都不处理
      // } else {
      //   this.currentActiveMenu = '';
      // }
    },
  },
});

// Need to be used outside the setup
export function useBusinessStoreWithOut() {
  return useBusinessStore(store);
}

const prefixPathList = [];
for (const e in HiddenMenuPrefixEnum) {
  // @ts-ignore
  prefixPathList.push(HiddenMenuPrefixEnum[e]);
}
/**
 * 判断一个路由是不是隐藏菜单，主要判断是不是报表等一类
 * @param r
 * @returns
 */
function isHiddenMenu(r: RouteLocationNormalized): boolean {
  const { path } = r;
  let isHidden = false;
  for (const prefix of prefixPathList) {
    if (path.includes(prefix)) {
      isHidden = true;
      break;
    }
  }
  return isHidden;
}
