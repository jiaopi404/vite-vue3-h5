import { HqlQueryDtoI } from '/#/business';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  // 常用下载页面API
  checkCommonFileRepeat = '/commonFile/checkCommonFileRepeat', // 名称判重
  getCommonFileById = '/commonFile/getCommonFileById', // 根据id获取对象
  updateCommonFileUseMark = '/commonFile/updateCommonFileUseMark', // 启用禁用
  deleteCommonFileById = '/commonFile/deleteCommonFileById', // 删除
  getCommonFilePageByQueryDto = '/commonFile/getCommonFilePageByQueryDto', // 公共获取分页列表数据
  exportCommonFile = '/commonFile/exportCommonFile', // 公共导出
  saveCommonFile = '/commonFile/saveCommonFile', // 公共保存更新
  uploadDownload = '/uploadDownload', // 上传文件接口，没有前缀
  getDownloadType = 'commonFile/getDownloadType', // 下载文档
  // 文件类型页面API
  checkFileTypeRepeat = '/fileType/checkFileTypeRepeat', // 附件类型名称判重
  getFileTypeById = '/fileType/getFileTypeById', // 根据id获取附件类型对象
  updateFileTypeUseMark = '/fileType/updateFileTypeUseMark', // 启用禁用
  deleteFileTypeById = '/fileType/deleteFileTypeById', // 删除
  getFileTypePageByQueryDto = '/fileType/getFileTypePageByQueryDto', // 公共获取分页列表数据
  saveFileType = '/fileType/saveFileType', // 公共保存更新
}

// 常用下载页面API
export const checkCommonFileRepeat = (params?: any) =>
  defHttp.post<any>({ url: Api.checkCommonFileRepeat, data: params });

export const getCommonFileById = (params?: any) =>
  defHttp.post<any>({ url: Api.getCommonFileById, data: params });

export const updateCommonFileUseMark = (params?: any) =>
  defHttp.post<any>({ url: Api.updateCommonFileUseMark, data: params });

export const deleteCommonFileById = (params?: any) =>
  defHttp.post<any>({ url: Api.deleteCommonFileById, data: params });

export const getCommonFilePageByQueryDto = (params?: HqlQueryDtoI) =>
  defHttp.post<any>({ url: Api.getCommonFilePageByQueryDto, data: params });

export const exportCommonFile = (params?: any) =>
  defHttp.post<any>({ url: Api.exportCommonFile, data: params });

export const saveCommonFile = (params?: any) =>
  defHttp.post<any>({ url: Api.saveCommonFile, data: params });

export const uploadDownload = (params?: any) =>
  defHttp.post<any>({ url: Api.uploadDownload, data: params });

export const getDownloadType = (params?: any) =>
  defHttp.post<any>({ url: Api.getDownloadType, data: params });

// 文件类型页面API
export const checkFileTypeRepeat = (params?: any) =>
  defHttp.post<any>({ url: Api.checkFileTypeRepeat, data: params });

export const getFileTypeById = (params?: any) =>
  defHttp.post<any>({ url: Api.getFileTypeById, data: params });

export const updateFileTypeUseMark = (params?: any) =>
  defHttp.post<any>({ url: Api.updateFileTypeUseMark, data: params });

export const deleteFileTypeById = (params?: any) =>
  defHttp.post<any>({ url: Api.deleteFileTypeById, data: params });

export const getFileTypePageByQueryDto = (params?: any) =>
  defHttp.post<any>({ url: Api.getFileTypePageByQueryDto, data: params });

export const saveFileType = (params?: any) =>
  defHttp.post<any>({ url: Api.saveFileType, data: params });
