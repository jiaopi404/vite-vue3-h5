import type { configBaseInfo, configDictionary, configInfo, configModule } from '/#/config';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { CONFIG } from '/@/enums/cacheEnum';
import { toRaw, unref } from 'vue';
export interface ConfigState {
  configId: number;
  configInfo: Nullable<configInfo>;
}
export const useConfigStore = defineStore({
  id: 'config',
  state: (): ConfigState => ({
    configId: 1,
    configInfo: null,
  }),
  getters: {
    GET_CONFIG(): ConfigState {
      return this.configInfo
        ? { configId: this.configId, configInfo: this.configInfo }
        : getAuthCache<ConfigState>(CONFIG) || {};
    },
    GET_CONFIG_DICTIONRY(): configDictionary {
      return (
        this.configInfo?.configDictionary ||
        getAuthCache<configDictionary>(CONFIG).configInfo.configDictionary ||
        {}
      );
    },
    GET_CONFIG_BASEINFO(): configBaseInfo {
      return (
        this.configInfo?.configBaseInfo ||
        getAuthCache<configBaseInfo>(CONFIG).configInfo.configBaseInfo ||
        {}
      );
    },
    GET_CONFIG_MODULE(): configModule {
      return (
        this.configInfo?.configModule ||
        getAuthCache<configModule>(CONFIG).configInfo.configModule ||
        {}
      );
    },
    GET_SYS_TEMPLATE(): configModule {
      return (
        this.configInfo?.smsTemplate ||
        getAuthCache<configModule>(CONFIG).configInfo.smsTemplate ||
        {}
      );
    },
  },
  actions: {
    SET_CONFIG(config: configInfo): void {
      this.configInfo = config;
      setAuthCache(CONFIG, {
        configId: this.configId,
        configInfo: this.configInfo,
      });
    },
  },
});

// Need to be used outside the setup
export function useConfigStoreWithOut() {
  return useConfigStore(store);
}
