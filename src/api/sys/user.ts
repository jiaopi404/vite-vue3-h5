import { defHttp } from '/@/utils/http/axios';
import { LoginParams, UserInfo } from './model/userModel';

import { ErrorMessageMode } from '/#/axios';

enum Api {
  Login = '/login',
  Logout = '/logout',
  // GetUserInfo = '/getUserInfo',
  CheckSession = '/checkSession', // 检查 session 是否有效，返回用户信息
  GetPermCode = '/getPermCode',
  GetUserCountByMobile = '/user/getUserCountByMobile', // 判断手机号是否存在
  LoginByMobileCode = '/loginByMobileCode', // 手机号+验证码登陆
  // 版本号
  getVersionLimit = '/version/getVersionLimit'
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<UserInfo>(
    {
      url: Api.Login,
      params: {
        account: params.account,
        password: params.password,
        systemType: '1', // 业务端账号，不确定是否可以固定
      },
    },
    {
      errorMessageMode: mode,
      isReturnNativeResponse: true,
    },
  );
}
// 手机号+验证码 登陆
export function mobileLoginApi(params, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<UserInfo>(
    { url: Api.LoginByMobileCode, params },
    { errorMessageMode: mode, isReturnNativeResponse: true },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.post<UserInfo>(
    { url: Api.CheckSession },
    { errorMessageMode: 'none', joinTime: false },
  );
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode });
}

export function getUserCountByMobile(data) {
  return defHttp.post({ url: Api.GetUserCountByMobile, data });
}

export function doLogout() {
  return defHttp.get({ url: Api.Logout });
}
export function getVersionLimit() {
  return defHttp.post({ url: Api.getVersionLimit});
}
