import { MenuListGetResultModel } from '../demo/model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  getBidSectionPage = '/bidSection/getBidSectionPageByQueryDto',
  getAllSelectByBidSectionId = '/registeredSupplier/getAllSelectByBidSectionId',
  savesupplierQuotation = '/supplierQuotation/savesupplierQuotation',
  getsupplierQuotationPageByQueryDto = '/supplierQuotation/getsupplierQuotationPageByQueryDto',
  deletesupplierQuotationById = '/supplierQuotation/deletesupplierQuotationById',
  setAsPendingTransactionAboutSupplierQuotation = '/bidSection/setAsPendingTransactionAboutSupplierQuotation',
  saveBidWinner = '/bidWinner/saveBidWinner',
  saveConContract = '/conContract/saveConContract',
  queryByBidSectionId = '/conContract/queryByBidSectionId',
}

// 待评审分页
export const getBidSectionPage = (params: any) =>
  defHttp.post<any>({ url: Api.getBidSectionPage, params });
// 供应商名称下拉
export const getAllSelectByBidSectionId = (params: any) =>
  defHttp.post<any>({ url: Api.getAllSelectByBidSectionId, data: params });
// 评审信息保存
export const savesupplierQuotation = (params: any) =>
  defHttp.post<any>({ url: Api.savesupplierQuotation, data: params });
// 评审信息分页
export const getsupplierQuotationPageByQueryDto = (params: any) =>
  defHttp.post<any>({ url: Api.getsupplierQuotationPageByQueryDto, data: params });
// 评审信息删除
export const deletesupplierQuotationById = (params: any) =>
  defHttp.post<any>(
    { url: Api.deletesupplierQuotationById, data: params },
    { isTransformResponse: false },
  );
// 评审信息删除
export const setAsPendingTransactionAboutSupplierQuotation = (params: any) =>
  defHttp.post<any>(
    { url: Api.setAsPendingTransactionAboutSupplierQuotation, data: params },
    { isTransformResponse: false },
  );
// 确认供应商
export const saveBidWinner = (params: any) =>
  defHttp.post<any>({ url: Api.saveBidWinner, data: params });
// 生成合同
export const saveConContract = (params: any) =>
  defHttp.post<any>({ url: Api.saveConContract, data: params });
// 合同回显
export const queryByBidSectionId = (params: any) =>
  defHttp.post<any>({ url: Api.queryByBidSectionId, data: params });
