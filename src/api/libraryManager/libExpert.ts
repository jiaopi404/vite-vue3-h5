import { HqlQueryDtoI } from '/#/business';
import { LibExpertI } from './model/libExpertModel';
import { defHttp } from '/@/utils/http/axios';
import { useGlobSetting } from '/@/hooks/setting';
import { UploadFileParams } from '/#/axios';
import { ContentTypeEnum } from '/@/enums/httpEnum';

enum Api {
  getUserExtendPageList = '/userextend/getUserExtendPageList',
  exportUserExtend = '/userextend/exportUserExtend',
  checkUserExtend = '/userextend/checkUserExtend',
  updateUserUseMark = '/user/updateUserUseMark',
  updatePassword = '/user/updatePassword',
  updateMobile = '/user/updateMobile',
  deleteUser = '/user/deleteUser',
  getUserById = '/user/getUserById', // 回显 编辑
  getUserExtendById = '/userextend/getUserExtendById', // 回显 编辑
  getUserExtendByUserId = '/userextend/getUserExtendByUserId', // 通过userid获取扩展表数据
  saveUser = '/user/saveUser',
  saveUserPicById = '/user/saveUserPicById',
  uploadBase = '/uploadBase',
  importUserExtend = '/userextend/importUserExtend',
  saveExpertResearchArea = '/expertResearchArea/saveExpertResearchArea',
  deleteExpertResearchAreaById = '/expertResearchArea/deleteExpertResearchAreaById',
  getExpertResearchAreaPageByQueryDto = '/expertResearchArea/getExpertResearchAreaPageByQueryDto',
}

// 分页
export const getUserExtendPageList = (query: HqlQueryDtoI) => {
  return defHttp.post<LibExpertI>({ url: Api.getUserExtendPageList, data: query });
};
export const getExpertResearchAreaPageByQueryDto = (query: HqlQueryDtoI) => {
  return defHttp.post<LibExpertI>({ url: Api.getExpertResearchAreaPageByQueryDto, data: query });
};
export const exportUserExtend = (query: HqlQueryDtoI) => {
  return defHttp.post<LibExpertI>(
    { url: Api.exportUserExtend, data: query },
    {
      isTransformResponse: false,
    },
  );
};
// 审核
export const checkUserExtend = (roleInfo: LibExpertI) =>
  defHttp.post<any>({ url: Api.checkUserExtend, data: roleInfo });
// 设置专家状态
export const updateUserUseMark = (params?: any) =>
  defHttp.post<any>({ url: Api.updateUserUseMark, data: params });
// 重置密码
export const updatePassword = (params?: any) =>
  defHttp.post<any>({ url: Api.updatePassword, data: params });
// 重置手机号
export const updateMobile = (params?: any) =>
  defHttp.post<any>({ url: Api.updateMobile, data: params });
// 删除单个对象
export const deleteUser = (params: any) => defHttp.post<any>({ url: Api.deleteUser, data: params });
export const deleteExpertResearchAreaById = (userId: number) =>
  defHttp.post<any>({ url: Api.deleteExpertResearchAreaById, data: userId });
export const getUserById = (userId: number) =>
  defHttp.post<any>({ url: Api.getUserById, data: userId });
export const getUserExtendById = (UserExtendId: number) =>
  defHttp.post<any>({ url: Api.getUserExtendById, data: UserExtendId });
export const getUserExtendByUserId = (UserExtendId: number) =>
  defHttp.post<any>({ url: Api.getUserExtendByUserId, data: UserExtendId });
export const saveUser = (params?: any) => defHttp.post<any>({ url: Api.saveUser, data: params });
export const saveUserPicById = (params?: any) =>
  defHttp.post<any>({ url: Api.saveUserPicById, data: params });
export const saveExpertResearchArea = (params?: any) =>
  defHttp.post<any>({ url: Api.saveExpertResearchArea, data: params });
// 获取导入文件信息
export const importUserExtend = (params: any) =>
  defHttp.post<any>({ url: Api.importUserExtend, params });
const globSetting = useGlobSetting();
export const uploadBase = globSetting.apiUrl + Api.uploadBase;
