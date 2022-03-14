import { HqlQueryDtoI } from '/#/business';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetProExtractionListByPageAndSortSumDto = '/proExtraction/getProExtractionListByPageAndSortSumDto', // 查询抽取详情列表
  // 查询抽取详情 + 招标公司列表
  GetProExtractionAndBiddingCompanyListByPageAndSortSumDto = '/proExtraction/getProExtractionAndBiddingCompanyListByPageAndSortSumDto',
  ExtractionExpertsById = '/proExtraction/extractionExpertsById', // 根据 objectId, objectName, node 查询评审节点
  DeleteProExtractionById = '/proExtraction/deleteProExtractionById', // 删除单个评审详情
  UpdateReplyStatus = '/proExtraction/updateReplyStatus', // 设置参与状态
  DoProExtractionById = '/proExtraction/doProExtractionById', // 进行随机抽取
  DoProExtractionMessageById = '/proExtraction/doProExtractionMessageById', // 进行随机抽取
}

export const getProExtractionListByPageAndSortSumDto = (queryDto: HqlQueryDtoI) =>
  defHttp.post<any>({
    url: Api.GetProExtractionListByPageAndSortSumDto,
    data: queryDto,
  });

export const extractionExpertsById = (expertId, reviewNodeId) =>
  defHttp.post<any>({
    url: Api.ExtractionExpertsById,
    data: { id: expertId, reviewId: reviewNodeId },
  });
export const deleteProExtractionById = (proExtId) =>
  defHttp.post<any>({
    url: Api.DeleteProExtractionById,
    data: proExtId,
  });

/**
 * 设置 参与状态
 * @param proExtId
 * @param status 未回复1参与2不参与3
 * @returns
 */
export const updateReplyStatus = (proExtId, status: 1 | 2 | 3) =>
  defHttp.post<any>({
    url: Api.UpdateReplyStatus,
    data: { id: proExtId, status },
  });

export const doProExtractionById = (reviewNodeId) =>
  defHttp.post<any>({
    url: Api.DoProExtractionById,
    data: reviewNodeId,
  });

export const doProExtractionMessageById = (reviewNodeId) =>
  defHttp.post<any>({
    url: Api.DoProExtractionMessageById,
    data: reviewNodeId,
  });

export const getProExtractionAndBiddingCompanyListByPageAndSortSumDto = (queryDto: HqlQueryDtoI) =>
  defHttp.post<any>({
    url: Api.GetProExtractionAndBiddingCompanyListByPageAndSortSumDto,
    data: queryDto,
  });
