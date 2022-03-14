import { defineStore } from 'pinia';
import { useUserStore, useUserStoreWithOut } from './user';
import { store } from '/@/store';
import { useLxWebSocket } from '/@/hooks/web/useLxWebSocket';
import { refreshExtractEventBus } from '/@/views/library-management/review-node/components/extraction.eventBus';
import { useBusinessStoreWithOut } from './business';
import { usePermissionStore } from './permission';
import { getMenuNum } from '/@/api/sys/menu';
import { useMessage } from '/@/hooks/web/useMessage';

/**
 * 状态接口
 */
interface LxWebSocketStateI {
  [key: string]: any;
}

function getActionStr(action: LxWebSocketActionEnum) {
  return `[${action}]`;
}

// 可调用的 action 类型
export enum LxWebSocketActionEnum {
  LOGIN = 'login',
  LOG_OUT = 'logout',
}
// 可处理的 handle 类型
export enum LxWebSocketActionHandlerEnum {
  FORCE_OFF_LINE = 'thegoout',
  TO_DO_EXTRACTION = 'todoExtraction',
  GO_OUT = 'goout', // 被挤下线
  NUMBER_REFRESH = 'menuMessageNotice',
}

export const useLxWebSocketStore = defineStore({
  id: 'lxWebSocketStore',
  state: (): LxWebSocketStateI => ({}),
  getters: {},
  actions: {
    // action
    /**
     * 登录 action
     */
    [LxWebSocketActionEnum.LOGIN](): void {
      const { send } = useLxWebSocket();
      send(getActionStr(LxWebSocketActionEnum.LOGIN) + useUserStoreWithOut().getUserInfo?.account);
    },
    /**
     * 登出 aciton
     */
    [LxWebSocketActionEnum.LOG_OUT](): void {
      const { send, close } = useLxWebSocket();
      send(getActionStr(LxWebSocketActionEnum.LOG_OUT));
      setTimeout(() => {
        close();
      }, 0);
    },
    // actionHandler
    /**
     * @description 监听到：强制下线
     * @author jiaopi404
     * @date 24/11/2021
     */
    [LxWebSocketActionHandlerEnum.FORCE_OFF_LINE](): void {
      const userStore = useUserStoreWithOut();
      userStore.setToken(undefined);
      userStore.logout(true);
      // TODO: 关闭 websocket
    },
    async [LxWebSocketActionHandlerEnum.NUMBER_REFRESH]() {
      // 1. config store
      // 2 userStore
      // 3 permissionStore.menuIds
      // 4. 调接口
      // 5. permissionStore.setBackMenu...
      const userInfo = useUserStore().getUserInfo;
      const businessStore = useBusinessStoreWithOut();
      const permissionStore = usePermissionStore();
      const params = {
        tagModule: businessStore.GET_TAG_MODULE_INFO?.id ?? -1,
        menuIds: permissionStore.menuIds.join(','),
        userId: userInfo.id,
        year: businessStore.GET_YEAR,
      };
      const menuNum = await getMenuNum(params);
      permissionStore.setBackMenuListNumber(permissionStore.backMenuList, menuNum);
    },
    /**
     * @description 坚挺到: 被挤下线
     * @author jiaopi404
     * @date 24/11/2021
     */
    [LxWebSocketActionHandlerEnum.GO_OUT](): void {
      const { createMessage } = useMessage();
      const userStore = useUserStoreWithOut();
      userStore.setToken(undefined);
      userStore.logout(true);
      createMessage.error('您的账号在其他设备上登录，请重新登录！');
      // TODO: 关闭 websocket
    },
    [LxWebSocketActionHandlerEnum.TO_DO_EXTRACTION](): void {
      refreshExtractEventBus.emit();
    },
  },
});

// Need to be used outside the setup
export function useLxWebSocketStoreWithOut() {
  return useLxWebSocketStore(store);
}
