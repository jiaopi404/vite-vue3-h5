/*
 * @Author: jiaopi404
 * @Date: 2021-12-08 15:53:47
 * @LastEditTime: 2021-12-13 12:00:54
 * @LastEditors: jiaopi404
 * @Description: proExtractionConditions controller
 * @FilePath: /pmis2_pmis/src/api/review-node/proExtractionConditions.ts
 */
import { HqlQueryDtoI } from '/#/business';
import { defHttp } from '/@/utils/http/axios';
import { ProExtConditionI } from '/@/views/library-management/review-node/typing';

enum Api {
  // 查询 抽取条件列表 通用接口
  GetProExtractionConditionsListByPageAndSortSumDto = '/proExtractionConditions/getProExtractionConditionsListByPageAndSortSumDto',
  // 根据专家类型，计算当前可用的专家数
  GetUserCountByExpertType = '/user/getUserCountByExpertType',
  // 保存抽取条件接口
  SaveProExtractionConditionsAndProExtraction = '/proExtractionConditions/saveProExtractionConditionsAndProExtraction',
  // 删除抽取条件，修改抽取节点状态
  DeleteProExtractionConditionsByIdAndReviewId = '/proExtractionConditions/deleteProExtractionConditionsByIdAndReviewId',
  // 检查抽取节点是否可以发起评审
  CheckInitiateReview = '/proExtractionConditions/checkInitiateReview',
  // 发起评审
  InitiateReview = '/proExtractionConditions/initiateReview',
}

/**
 * 查询抽取条件 通用 分页列表
 * @param queryDto
 * @returns
 */
export const getProExtractionConditionsListByPageAndSortSumDto = (queryDto: HqlQueryDtoI) =>
  defHttp.post<ProExtConditionI>({
    url: Api.GetProExtractionConditionsListByPageAndSortSumDto,
    data: queryDto,
  });

export const getUserCountByExpertType = (
  expertCategoryId?,
  expertType?,
  reviewId?,
  proExtractionConditionsId?,
  keyWord?, // 关键词
) =>
  defHttp.post<Nullable<number>>({
    url: Api.GetUserCountByExpertType,
    data: { expertCategoryId, expertType, reviewId, proExtractionConditionsId, keyWord },
  });

export const saveProExtractionConditionsAndProExtraction = (proExtCond: ProExtConditionI) =>
  defHttp.post<any>({ url: Api.SaveProExtractionConditionsAndProExtraction, data: proExtCond });

export const deleteProExtractionConditionsByIdAndReviewId = (id, reviewId) =>
  defHttp.post<any>({
    url: Api.DeleteProExtractionConditionsByIdAndReviewId,
    data: { id, reviewId },
  });

export const checkInitiateReview = (reviewId) =>
  defHttp.post<any>({
    url: Api.CheckInitiateReview,
    data: reviewId,
  });

export const initiateReview = (reviewId) =>
  defHttp.post<any>(
    {
      url: Api.InitiateReview,
      data: reviewId,
    },
    { isTransformResponse: false },
  );
