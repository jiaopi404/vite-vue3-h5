// import type { UserI } from '/#/store';
import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import { ROLES_KEY, TOKEN_KEY, USER_INFO_KEY } from '/@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { LoginParams } from '/@/api/sys/model/userModel';
import { doLogout, getUserInfo, loginApi, mobileLoginApi } from '/@/api/sys/user';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
import { router } from '/@/router';
import { usePermissionStore } from '/@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { isArray } from '/@/utils/is';
import { h } from 'vue';
import { LxWebSocketActionEnum, useLxWebSocketStore } from './lxWebSocket';
import { UserI } from '/#/business';
import { getTagModuleByTagModuleName } from '/@/utils/commonServe/businessUtil';
import { useBusinessStore } from './business';
import { useLoginState } from '/@/views/sys/login/useLogin';

interface UserState {
  userInfo: Nullable<UserI>;
  token?: string;
  roleList: RoleEnum[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    // user info
    userInfo: null,
    // token
    token: undefined,
    // roleList
    roleList: [],
    // Whether the login expired
    sessionTimeout: false,
    // Last fetch time
    lastUpdateTime: 0,
  }),
  getters: {
    getUserInfo(): UserI {
      return this.userInfo || getAuthCache<UserI>(USER_INFO_KEY) || {};
    },
    getToken(): string {
      return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(): RoleEnum[] {
      return this.roleList.length > 0 ? this.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: UserI | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
    },
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
    },
    /**
     * @description: login
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
        LodingType: 'account' | 'mobile';
        mobile?: string;
        code?: string;
      },
    ): Promise<UserI | null> {
      try {
        const { goHome = true, mode, LodingType, mobile, code, ...loginParams } = params;
        // const {
        //   data: { data, msg },
        // } = await loginApi(loginParams, mode);
        // // data 为 null 时，说明用户名或密码失败

        let res;
        if (LodingType === 'account') {
          res = await loginApi(loginParams, mode);
          // data 为 null 时，说明用户名或密码失败
        } else if (LodingType === 'mobile') {
          res = await mobileLoginApi({ mobile, code }, mode);
        }
        const {
          data: { data, msg },
        } = res;

        if (!data) {
          const { createMessage } = useMessage();
          createMessage.error(msg);
          return null;
        }
        const { sessionId } = data; // sessionId
        // save token
        this.setToken(sessionId);
        // save userInfo
        this.setUserInfo(data);
        // TODO: 修正 role
        this.setRoleList([RoleEnum.SUPER]);
        return this.afterLoginAction(goHome);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async afterLoginAction(goHome?: boolean): Promise<UserI | null> {
      if (!this.getToken) return null;
      // get user info
      // const userInfo = await this.getUserInfoAction();

      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        // 如果有重定向 且 有 tagModuleName
        const route = router.currentRoute;
        const curQuery = route.value.query || {};
        const { redirect, tagModuleName } = curQuery;
        if (redirect && tagModuleName) {
          console.log('redirect && tagModuleName', redirect, tagModuleName);
          // @ts-ignore
          const tagModule = getTagModuleByTagModuleName(tagModuleName);
          const businessStore = useBusinessStore();
          businessStore.SET_TAG_MODULE_INFO(tagModule);
          router.push({
            // @ts-ignore
            path: redirect,
            query: {
              ...curQuery,
            },
          });
          return null;
        }
        // const permissionStore = usePermissionStore();
        // if (!permissionStore.isDynamicAddedRoute) {
        //   const routes = await permissionStore.buildRoutesAction();
        //   routes.forEach((route) => {
        //     router.addRoute(route as unknown as RouteRecordRaw);
        //   });
        //   router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
        //   permissionStore.setDynamicAddedRoute(true);
        // }
        // goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
        goHome && (await router.replace(PageEnum.BASE_HOME));
      }
      return null;
    },
    async getUserInfoAction(): Promise<UserI | null> {
      if (!this.getToken) return null;
      const userInfo = await getUserInfo();
      const { roles = [] } = userInfo;
      if (isArray(roles)) {
        const roleList = roles.map((item) => item.value) as RoleEnum[];
        this.setRoleList(roleList);
      } else {
        userInfo.roles = [];
        this.setRoleList([]);
      }
      this.setUserInfo(userInfo);
      return userInfo;
    },
    /**
     * @description: logout
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          await doLogout();
        } catch {
          console.log('注销Token失败');
        }
      }
      const { handleBackLogin } = useLoginState();
      handleBackLogin();
      this.setToken(undefined);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      // TODO: 登出，登出时使用上面逻辑
      const lxWebSocketStore = useLxWebSocketStore();
      lxWebSocketStore[LxWebSocketActionEnum.LOG_OUT]();
      goLogin && router.push(PageEnum.BASE_LOGIN);
    },

    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', t('sys.app.logoutTip')),
        content: () => h('span', t('sys.app.logoutMessage')),
        onOk: async () => {
          await this.logout(true);
        },
      });
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}
