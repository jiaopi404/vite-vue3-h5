import { defHttp } from '/@/utils/http/axios';

export interface SysRoleI {
  id?: Nullable<number>;
  [key: string]: any;
}

enum Api {
  updateNoticeById = '/notice/updateNoticeById', // 设置首页显示
  updateNoticeUseMark = '/notice/updateNoticeUseMark', // 启用禁用
  deleteNoticeById = '/notice/deleteNoticeById', // 删除
  getNoticePageByQueryDto = '/notice/getNoticePageByQueryDto', // 分页
  saveNotice = '/notice/saveNotice', // 保存
  GetDictionaryByParentId = '/dic/getDictionaryByParentId', // 读字典
  getAllRoleList = '/role/getAllRoleList',
  viewTimesPlus1 = '/notice/viewTimesPlus1', // 浏览次数+1
  getNoticeById = '/notice/getNoticeById', // 根据id获取通知公告对象
}

// 设置首页显示
export const updateNoticeById = (params: any) =>
  defHttp.post<any>({ url: Api.updateNoticeById, params });

// 启用禁用
export const updateNoticeUseMark = (params: any) =>
  defHttp.post<any>({ url: Api.updateNoticeUseMark, params });

// 删除
export const deleteNoticeById = (params: any) =>
  defHttp.post<any>({ url: Api.deleteNoticeById, params });

// 分页
export const getNoticePageByQueryDto = (params: any) =>
  defHttp.post<any>({ url: Api.getNoticePageByQueryDto, params });

// 保存
export const saveNotice = (params: any) => defHttp.post<any>({ url: Api.saveNotice, params });

// 根据字典id获取数据
export const getDictionaryByParentId = (params: number) =>
  defHttp.post({ url: Api.GetDictionaryByParentId, params }, { errorMessageMode: 'none' });

// 浏览次数+1
export const viewTimesPlus1 = (params: any) =>
  defHttp.post({ url: Api.viewTimesPlus1, params }, { errorMessageMode: 'none' });

// 根据id获取通知公告对象
export const getNoticeById = (params: any) =>
  defHttp.post({ url: Api.getNoticeById, params }, { errorMessageMode: 'none' });

export const getAllRoleList = () => {
  return defHttp.get<SysRoleI>({ url: Api.getAllRoleList });
};
