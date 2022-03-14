import { defHttp } from '/@/utils/http/axios';
import { HqlQueryDtoI } from '/#/business';
import { SysRoleI } from '/@/api/sys/model/sysRoleModel';
import { PurchaseTemplateI } from '/@/views/openTender_4_5/projectMng_4_5_3/purchaseTemplate/typing';
enum Api {
  // 分页列表查询
  getDocumentTemplatePageTreeListUrl = '/documentTemplate/getDocumentTemplatePageTreeList',
  // 删除
  deleteDocumentTemplateByIdUrl = '/documentTemplate/deleteDocumentTemplateById ',
  // 启用禁用
  updateDocumentTemplateUseMarkUrl = '/documentTemplate/updateDocumentTemplateUseMark',
  // 是否显示
  updateDocumentTemplateIfShowUrl = '/documentTemplate/updateDocumentTemplateIfShow',
  // 添加/编辑
  saveDocumentTemplateUrl = '/documentTemplate/saveDocumentTemplate',
  // // 判重接口
  checkDocumentTemplateRepeaturl = '/documentTemplate/checkDocumentTemplateRepeat ',
  // 回显接口
  getDocumentTemplateByIdUrl = '/documentTemplate/getDocumentTemplateById',
  // 通用分页接口
  GetDocumentTemplateListByPageAndSortSumDto = '/documentTemplate/getDocumentTemplateListByPageAndSortSumDto',
  ///////////////////////////////////////// 项目模板 /////////////////////////////////////////
  // 根据 id 获取
  QueryTreeLevelByBidSectionId = '/purchaseTemplate/queryTreeLevelByBidSectionId',
  // 检查有无模板
  VerifyWhetherPurchaseDocuments = '/purchaseTemplate/verifyWhetherPurchaseDocuments',
  // 保存模板
  SaveYourselfAndAllChildren = '/purchaseTemplate/saveYourselfAndAllChildren',
  // 保存 单个结点
  SavePurchaseTemplate = '/purchaseTemplate/savePurchaseTemplate',
  // 保存 预览数据
  batchSaveDocumentTemplateUrl = '/documentTemplate/batchSaveDocumentTemplate',
}

/**
 * @description: Get sample list value
 */

// 获取分页数据
export const getDocumentTemplatePageTreeList = (params: HqlQueryDtoI) =>
  defHttp.post<SysRoleI>({ url: Api.getDocumentTemplatePageTreeListUrl, params });
// 删除
export const deleteDocumentTemplateById = (id: number) =>
  defHttp.post({ url: Api.deleteDocumentTemplateByIdUrl, params: id });

// 添加/ 编辑
export const saveDocumentTemplate = (params: any) =>
  defHttp.post({ url: Api.saveDocumentTemplateUrl, params });

// 是否编辑
export const updateDocumentTemplateUseMark = (params: any) =>
  defHttp.post({ url: Api.updateDocumentTemplateUseMarkUrl, params });
// 是否显示
export const updateDocumentTemplateIfShow = (params: any) =>
  defHttp.post({ url: Api.updateDocumentTemplateIfShowUrl, params });

// 判重接口
export const checkDocumentTemplateRepeat = (
  id: any,
  content: string,
  type: number,
  leafLevel: number,
) =>
  defHttp.post({
    url: Api.checkDocumentTemplateRepeaturl,
    params: { id, content, type, leafLevel },
  });

// // 回显
export const getDocumentTemplateById = (id: number) =>
  defHttp.post({ url: Api.getDocumentTemplateByIdUrl, params: id });

export const getDocumentTemplateListByPageAndSortSumDto = (queryDto: HqlQueryDtoI) =>
  defHttp.post({
    url: Api.GetDocumentTemplateListByPageAndSortSumDto,
    data: queryDto,
  });

export const queryTreeLevelByBidSectionId = (bidSectionId) =>
  defHttp.post({
    url: Api.QueryTreeLevelByBidSectionId,
    data: bidSectionId,
  });
export const verifyWhetherPurchaseDocuments = (purchaseTemplateId) =>
  defHttp.post<boolean>({
    url: Api.VerifyWhetherPurchaseDocuments,
    data: purchaseTemplateId,
  });

export const saveYourselfAndAllChildren = (purchaseTemplate: PurchaseTemplateI) =>
  defHttp.post({
    url: Api.SaveYourselfAndAllChildren,
    data: purchaseTemplate,
  });
export const savePurchaseTemplate = (purchaseTemplate: Partial<PurchaseTemplateI>) =>
  defHttp.post({
    url: Api.SavePurchaseTemplate,
    data: purchaseTemplate,
  });
// 保存 预览数据
export const batchSaveDocumentTemplate = (purchaseTemplate: Partial<PurchaseTemplateI>) =>
  defHttp.post({
    url: Api.batchSaveDocumentTemplateUrl,
    data: purchaseTemplate,
  });
