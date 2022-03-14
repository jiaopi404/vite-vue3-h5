import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetProjectPageByQueryDto = '/project/getProjectPageByQueryDto',
  GetMultiProjectPageByQueryDto = '/project/getMultiProjectPageByQueryDto',
  GetPurOrgList = '/user/getPurOrgList',
  BatchDealWithProject = '/project/batchDealWithProject',
  GetDictionaryByParentIdAndCode = '/dic/getDictionaryByParentIdAndCode',
  GetProjectById = '/project/getProjectById',
  FilterIds = '/project/filterIds',
  GetFileTypeList = '/fileType/getFileTypeList',
  SaveProject = '/project/saveProject',
  GetDemonstrationByProjectId = '/demonstration/getDemonstrationByProjectId',
  ArgumentProject = '/project/argumentProject',
  PendingReview = '/project/pendingReview',
  GetStatusBy = '/proReviewNode/getStatusBy',
  GetUserListByDepId = '/user/getUserListByDepId',
  SaveProTransferRecord = '/proTransferRecord/saveProTransferRecord',
}
// ==============================【待处理项目】

// 【待接收】
// 待处理项目 通用获取列表
export const getProjectPageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetProjectPageByQueryDto, params });

// 待论证 获取列表(特殊)
export const getMultiProjectPageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetMultiProjectPageByQueryDto, params });

// 获取字典为通用接口

// 获取组织接收人select
export const getPurOrgList = (params: any) => defHttp.post({ url: Api.GetPurOrgList, params });

// 待接收 批量处理
export const batchDealWithProject = (params: any) =>
  defHttp.post({ url: Api.BatchDealWithProject, params });

export const getDictionaryByParentIdAndCode = (params: any) =>
  defHttp.post({ url: Api.GetDictionaryByParentIdAndCode, params });

// 单选编辑时 回显
export const getProjectById = (params: number) => defHttp.post({ url: Api.GetProjectById, params });

// 多选编辑时 进行筛选
export const filterIds = (params: any) => defHttp.post({ url: Api.FilterIds, params });

// 获取是否审核
export const getStatusBy = (params: any) => defHttp.post({ url: Api.GetStatusBy, params });

// 【待处理】
//资质要求select
export const getFileTypeList = (params: any) => defHttp.post({ url: Api.GetFileTypeList, params });

// 保存待处理
export const saveProject = (params: any) => defHttp.post({ url: Api.SaveProject, params });

// ==============================【待论证】
// 回显
export const getDemonstrationByProjectId = (params: any) =>
  defHttp.post({ url: Api.GetDemonstrationByProjectId, params });

// 保存项目论证
export const argumentProject = (params: any) => defHttp.post({ url: Api.ArgumentProject, params });

// 保存 待审核接口
export const pendingReview = (params: any) => defHttp.post({ url: Api.PendingReview, params });

// 转交获取部门人
export const getUserListByDepId = (params: any) =>
  defHttp.post({ url: Api.GetUserListByDepId, params });

// 转交保存接口
export const saveProTransferRecord = (params: any) =>
  defHttp.post({ url: Api.SaveProTransferRecord, params });
