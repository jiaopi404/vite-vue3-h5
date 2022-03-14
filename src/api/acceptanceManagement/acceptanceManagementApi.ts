import { MenuListGetResultModel } from '../demo/model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  getBidSectionPage = '/bidSection/getBidSectionPageByQueryDto',
  saveProAcceptanceUrl = '/proAcceptance/saveProAcceptance',
  getUserByOrgIDUrl = '/user/getUserByOrgID',
  getProAcceptanceByIdUrl = '/proAcceptance/getProAcceptanceById ',
  getBidSectionAndProAcceptanceByQueryDtoUrl = '/bidSection/getBidSectionAndProAcceptanceByQueryDto',
  getUserByDepIdUrl = '/user/getUserByDepId',
  //   saveBidWinner = '/bidWinner/saveBidWinner',
  //   saveConContract = '/conContract/saveConContract',
}

// 待验收
export const getBidSectionPage = (params: any) =>
  defHttp.post<any>({ url: Api.getBidSectionPage, params });
// 保存
export const saveProAcceptance = (params: any) =>
  defHttp.post<any>({ url: Api.saveProAcceptanceUrl, data: params });
// 当前单位下审核通过，未删除，未禁用的校内用户+专家  下拉
export const getUserByOrgID = (params: any) =>
  defHttp.post<any>({ url: Api.getUserByOrgIDUrl, data: params });
// 获取验收数据
export const getProAcceptanceById = (params: any) =>
  defHttp.post<any>({ url: Api.getProAcceptanceByIdUrl, data: params });
// 验收中 待处理  已验收的列表展示数据
export const getBidSectionAndProAcceptanceByQueryDto = (params: any) =>
  defHttp.post<any>({ url: Api.getBidSectionAndProAcceptanceByQueryDtoUrl, params });
// 当前登录人所在部门的审核通过，未删除，未禁用的人+分管该部门的分管主管”  下拉
export const getUserByDepId = (params: any) =>
  defHttp.post<any>({ url: Api.getUserByDepIdUrl, data: params });
// // 生成合同
// export const saveConContract = (params: any) =>
//   defHttp.post<any>({ url: Api.saveConContract, data: params });
// // 评审信息删除
// export const deletesupplierQuotationById = (params: any) =>
//   defHttp.post<any>(
//     { url: Api.deletesupplierQuotationById, data: params },
//     { isTransformResponse: false },
//   );
// // 评审信息删除
// export const setAsPendingTransactionAboutSupplierQuotation = (params: any) =>
//   defHttp.post<any>(
//     { url: Api.setAsPendingTransactionAboutSupplierQuotation, data: params },
//     { isTransformResponse: false },
//   );
