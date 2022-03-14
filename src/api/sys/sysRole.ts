import { HqlQueryDtoI } from '/#/business';

import { SysRoleI } from './model/sysRoleModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetRoleList = '/role/getRolePageList',
  SaveRole = '/role/saveRole',
  GetRoleById = '/role/getRoleById',
  DeleteRoleById = '/role/deleteRoleById', // 删除角色
  CheckRoleByName = '/role/checkRoleByName', // 角色名称验重
  SaveRoleShiro = '/role/saveRoleShiro', // 保存角色权限
  GetRoleRightsById = '/role/getRoleRightsById', // 保存角色权限
}

/**
 * @description: Get user menu based on id
 */

export const getRoleList = (query: HqlQueryDtoI) => {
  return defHttp.post<SysRoleI>({ url: Api.GetRoleList, data: query });
};

export const saveRole = (roleInfo: SysRoleI) =>
  defHttp.post<any>({ url: Api.SaveRole, data: roleInfo });

/**
 * 根据 roleId 获取单个 Role
 * @param roleId roleId
 * @returns SysRoleI
 */
export const getRoleById = (roleId: number) =>
  defHttp.post<SysRoleI>({ url: Api.GetRoleById, data: roleId });

/**
 * 删除 单个 role
 * @param roleId
 * @returns
 */
export const deleteRoleById = (roleId: number) =>
  defHttp.post<any>({ url: Api.DeleteRoleById, data: roleId });

/**
 * 角色名称 验重
 * @param role 角色
 * @returns boolean
 */
export const checkRoleByName = (role: SysRoleI) =>
  defHttp.post<boolean>({ url: Api.CheckRoleByName, data: role });

type ShiroRightFlag = 'show_qx' | 'appletShow_qx';
type SysType = 0 | 1 | 2;
/**
 * 保存权限
 * @param roleId 用户的id
 * @param menusId 选中的菜单，最子集
 * @param shiroFlag ShiroRightFlag
 * @returns
 */
export const saveRoleShiro = (roleId, menuIds: string, shiroFlag: ShiroRightFlag) =>
  defHttp.post<any>({ url: Api.SaveRoleShiro, data: { id: roleId, menuIds, msg: shiroFlag } });

/**
 * 根据 角色 id 获取权限
 * @param roleId
 * @param menuType
 * @param shiroFlag
 * @returns
 */
export const getRoleRightsById = (roleId, menuType: SysType, shiroFlag: ShiroRightFlag) =>
  defHttp.post<any>({ url: Api.GetRoleRightsById, data: { id: roleId, menuType, msg: shiroFlag } });
