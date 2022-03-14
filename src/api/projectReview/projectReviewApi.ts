import { MenuListGetResultModel } from '../demo/model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  getBidSectionReviewPageByQueryDtoUrl = '/bidSection/getBidSectionReviewPageByQueryDto',
  //查看审核流
  getProEvaluationRecordByIdUrl = '/proEvaluationRecord/getProEvaluationRecordById',
  // 查看审核流（项目管理待评审）
  getExtractUserAndEvaluationRecord = '/proEvaluationRecord/getExtractUserAndEvaluationRecord',
  //评审报价供应商列表
  getsupplierQuotationPageByQueryDtoUrl = '/supplierQuotation/getsupplierQuotationPageByQueryDto',
  //评审记录表保存接口
  saveProEvaluationRecordUrl = '/proEvaluationRecord/saveProEvaluationRecord',
  //查看评审记录接口
  getOneByBidSectionIdAndExtractIdUrl = '/proEvaluationRecord/getOneByBidSectionIdAndExtractId',
}

// 项目评审列表展示
export const getBidSectionReviewPageByQueryDto = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getBidSectionReviewPageByQueryDtoUrl, params });

//  查看审核流
export const getsupplierQuotationPageByQueryDto = (params: any) =>
  defHttp.post<any>({ url: Api.getsupplierQuotationPageByQueryDtoUrl, data: params });
//  查看审核流列表展示
export const getProEvaluationRecordById = (params: any) =>
  defHttp.post<any>(
    { url: Api.getProEvaluationRecordByIdUrl, data: params },
    { isTransformResponse: false },
  );
//  查看审核流列表展示
export const getExtractUserAndEvaluationRecord = (params: any) =>
  defHttp.post<any>({ url: Api.getExtractUserAndEvaluationRecord, data: params });
//  评审记录表保存接口
export const saveProEvaluationRecord = (params: any) =>
  defHttp.post<any>({ url: Api.saveProEvaluationRecordUrl, data: params });
//  查看评审记录回显接口
export const getOneByBidSectionIdAndExtractId = (params: any) =>
  defHttp.post<any>(
    { url: Api.getOneByBidSectionIdAndExtractIdUrl, data: params },
    { isTransformResponse: false },
  );
