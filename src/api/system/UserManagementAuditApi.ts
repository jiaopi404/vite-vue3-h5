import { defHttp } from '/@/utils/http/axios';

import { HqlQueryDtoI } from '/#/business';
import { SysRoleI } from '/@/api/sys/model/sysRoleModel';

enum Api {
  // 获取搜索条件
  getAllOrgListUrl = '/org/getAllOrgList',
  getAllRoleListUrl = '/role/getAllRoleList',
  getDepTreeListUrl = '/dep/getDepTreeList',
  getUserPageListUrl = '/user/getUserPageList',

  // 用户管理 待审核&已审核
  checkUserExtendUrl = '/userextend/checkUserExtend', // 审核
  updatePasswordUrl = '/user/updatePassword', // 重置密码
  updateUserUseMarkUrl = '/user/updateUserUseMark', // 启用禁用
  deleteUserUrl = '/user/deleteUser', // 删除
  check1Url = '/user/check1', // 判重 编辑
  getUserByIdUrl = '/user/getUserById', // 回显 编辑
  saveUserUrl = '/user/saveUser', // 保存 添加&编辑
  getAuthByUserIdUrl = '/auth/getAuthByUserId', // 回显 授权&处理
  saveAuthUrl = '/auth/saveAuth', // 保存 授权&处理

  uploadUserUrl = '/user/uploadUser',
  importUserUrl = '/user/importUser',
  cutImageUrl = '/user/cutImage',

  // 获取待抽取专家列表 (专家手动抽取)
  GetExtractionExpertsListByPageAndSortDto = '/user/getExtractionExpertsListByPageAndSortDto',
}

// ===========================[ 搜索表单接口 ]===========================
// 所在单位Select
const getAllOrgList = () => {
  return defHttp.get<SysRoleI>({ url: Api.getAllOrgListUrl });
};
// 角色Select
const getAllRoleList = () => {
  return defHttp.get<SysRoleI>({ url: Api.getAllRoleListUrl });
};
// 部门树结构TreeSelect 参数：orgId(所在单位Id)
const getDepTreeList = (query: number) => {
  return defHttp.post({ url: Api.getDepTreeListUrl, data: query });
};

// ===========================[ 用户管理 待审核&已审核 ]===========================
// 审核
const checkUserExtend = (query: any) => defHttp.post({ url: Api.checkUserExtendUrl, data: query });

// 获取用户管理(待审核/已审核) 列表数据
const getUserPageList = (query: HqlQueryDtoI) => {
  return defHttp.post<SysRoleI>({ url: Api.getUserPageListUrl, data: query });
};

// 重置密码
const updatePassword = (params: any) =>
  defHttp.post<SysRoleI>({ url: Api.updatePasswordUrl, params });

// 禁用启用
const updateUserUseMark = (query: { id: number; useMark: number }) =>
  defHttp.post<SysRoleI>({ url: Api.updateUserUseMarkUrl, data: query });

// 删除
const deleteUser = (params: number) => defHttp.post({ url: Api.deleteUserUrl, params });

// 回显 编辑(包括现有签章) 传参:主键Id
const getUserById = (params: number) => {
  return defHttp.post<SysRoleI>({ url: Api.getUserByIdUrl, params });
};
// 判重 添加&编辑
const check1 = (query: any) => {
  return defHttp.post({ url: Api.check1Url, data: query });
};
// 保存 添加&编辑
const saveUser = (query: any) => {
  return defHttp.post({ url: Api.saveUserUrl, data: query });
};

// 回显 授权&处理
const getAuthByUserId = (query: any) => {
  return defHttp.post({ url: Api.getAuthByUserIdUrl, data: query });
};

// 保存 授权&处理
// {
//  "userId": 2,
//  "authorizeDepIds": "20,10,2,161,4", 授权Id组  这两个可选择传，不是必传
//  "processAuthorizeDepIds":"1,10,2,161,4" 处理Id组
// }
const saveAuth = (query: any) => {
  return defHttp.post({ url: Api.saveAuthUrl, data: query });
};

// 上传图片 & 文件
const uploadUser = (query: any) => defHttp.post({ url: Api.uploadUserUrl, data: query });

// 图片裁剪
const cutImage = (query: any) => defHttp.post({ url: Api.cutImageUrl, data: query });

// 获取导入文件信息
const importUser = (query: any) => defHttp.post({ url: Api.importUserUrl, data: query });

export const getExtractionExpertsListByPageAndSortDto = (queryDto: HqlQueryDtoI) =>
  defHttp.post({ url: Api.GetExtractionExpertsListByPageAndSortDto, data: queryDto });

export default {
  getAllOrgList,
  getAllRoleList,
  getDepTreeList,
  getUserPageList,

  checkUserExtend,
  updatePassword,
  updateUserUseMark,
  deleteUser,
  getUserById,
  check1,
  saveUser,
  getAuthByUserId,
  saveAuth,

  uploadUser,
  cutImage,
  importUser,
  getExtractionExpertsListByPageAndSortDto,
};
