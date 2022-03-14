/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  account?: string;
  password?: string;
}

export interface RoleInfo {
  roleName: string;
  value: string;
}

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  userId: string | number;
  token: string;
  role: RoleInfo;
}

/**
 * @description: Get user information return value
 */
export interface UserInfo {
  account: string; // account
  perName: Nullable<string>; // perName
  name: Nullable<string>;
  id: number;
  sessionId: string;
  [key: string]: any;
}
