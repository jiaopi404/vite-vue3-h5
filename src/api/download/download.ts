import { defHttp } from '/@/utils/http/axios';

export interface SysRoleI {
  id?: Nullable<number>;
  [key: string]: any;
}

enum Api {
  updateCommonFileUseMark = '/commonFile/updateCommonFileUseMark', // 启用禁用
  deleteCommonFileById = '/commonFile/deleteCommonFileById', // 删除
  getCommonFileById = '/commonFile/getCommonFileById', // 下载
  getCommonFilePageByQueryDto = '/commonFile/getCommonFilePageByQueryDto', // 分页
  UpDateAmount = '/commonFile/UpDateAmount', // 下载次数
  saveCommonFile = '/commonFile/saveCommonFile', // 保存
}

// 启用禁用
export const updateCommonFileUseMark = (params: any) =>
  defHttp.post<any>({ url: Api.updateCommonFileUseMark, params });

// 删除
export const deleteCommonFileById = (params: any) =>
  defHttp.post<any>({ url: Api.deleteCommonFileById, params });

// 下载
export const getCommonFileById = (params: any) =>
  defHttp.post<any>({ url: Api.getCommonFileById, params });

// 分页
export const getCommonFilePageByQueryDto = (params: any) =>
  defHttp.post<any>({ url: Api.getCommonFilePageByQueryDto, params });

// 下载次数
export const UpDateAmount = (params: any) => defHttp.post<any>({ url: Api.UpDateAmount, params });

// 保存
export const saveCommonFile = (params: any) =>
  defHttp.post<any>({ url: Api.saveCommonFile, params });
