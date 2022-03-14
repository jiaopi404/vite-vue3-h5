import { MenuListGetResultModel } from '../demo/model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetProjectPage = '/project/getProjectPageByQueryDto',
  withdrawnDeclarationUrl = '/project/withdrawnDeclaration',
  saveFileUrl = '/file/saveFile',
  GetFileList = '/file/getProFileMapGroupByFileTypeNameFromProjectId',
  getOneByproIdUrl = '/bidSection/getOneByproId',
  saveBidSectionUrl = '/bidSection/saveBidSection',
  setAsPendingTransactionUrl = '/bidSection/setAsPendingTransaction',
  deleteFileByIdUrl = '/file/deleteFileById',
  //查看审核流
  GetActRuTaskByProcessId = '/ruWaitTask/getActRuTaskByProcessId',
  updateBidSectionAndProjectStatus = '/bidSection/updateBidSectionAndProjectStatus',
  PurchasingDoReview = '/bidSection/purchasingDoReview',
}

// 立项管理所有页面的初始页面展示接口
export const getProjectPage = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectPage, params });
// 已申报-撤回
export const withdrawnDeclaration = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.withdrawnDeclarationUrl, params });

// 待采购-保存
export const saveFile = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.saveFileUrl, params });
// 上传附件回显
export const getFileList = (params: any) => defHttp.post({ url: Api.GetFileList, params });
// 标段接口
export const saveBidSection = (params: any) => defHttp.post({ url: Api.saveBidSectionUrl, params });
// 获取标段数据
export const getOneByproId = (params: any) => defHttp.post({ url: Api.getOneByproIdUrl, params });
// 判断是否已上传零星采购备案表！
export const setAsPendingTransaction = (bidSectionId, ifBidSection: 1 | 0) =>
  defHttp.post(
    { url: Api.setAsPendingTransactionUrl, data: { bidSectionId, ifBidSection } },
    { isTransformResponse: false },
  );
// 删除附件
export const deleteFileById = (params: any) => defHttp.post({ url: Api.deleteFileByIdUrl, params });
//  查看审核流
export const getActRuTaskByProcessId = (params: any) =>
  defHttp.post<any>({ url: Api.GetActRuTaskByProcessId, data: params });
//  查看审核流
export const updateBidSectionAndProjectStatus = (params: any) =>
  defHttp.post<any>({ url: Api.updateBidSectionAndProjectStatus, data: params });

// 电子竞价 询价 发起评审
export const purchasingDoReview = ({
  bidSectionId,
  ifPostpone,
  postponeTime,
  postponeReason,
  proReviewNodeId,
}) =>
  defHttp.post<any>({
    url: Api.PurchasingDoReview,
    data: { bidSectionId, ifPostpone, postponeReason, postponeTime, proReviewNodeId },
  });
