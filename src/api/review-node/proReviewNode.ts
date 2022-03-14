import { defHttp } from '/@/utils/http/axios';
import { ReviewNodeI } from '/@/views/library-management/review-node/typing';

enum Api {
  GetReviewNodeByProjectNode = '/proReviewNode/getReviewNodeByProjectNode', // 根据 objectId, objectName, node 查询评审节点
  SaveReviewNode = '/proReviewNode/save', // 保存 proReviewNode
  GetProReviewNodeById = '/proReviewNode/getProReviewNodeById', // 根据 id 获取 getProReviewNodeById
  DelProReviewNodeById = '/proReviewNode/delProReviewNodeById', // 根据 id 删除，用于作废；改动，不用它了
  InvalidateById = '/proReviewNode/invalidateById', // 根据 id 删除，用于作废
}

// Get personal center-basic settings

export const getReviewNodeByProjectNode = ({
  objectId,
  objectName,
  node,
}: {
  objectId?: number | string;
  objectName?: string;
  node?: number; // 评审结点
}) =>
  defHttp.post<any>({
    url: Api.GetReviewNodeByProjectNode,
    data: {
      objectId,
      objectName,
      node,
    },
  });

export const saveReviewNode = (reviewNode: ReviewNodeI) =>
  defHttp.post<any>({
    url: Api.SaveReviewNode,
    data: reviewNode,
  });

export const getProReviewNodeById = (reviewNodeId) =>
  defHttp.post<any>({
    url: Api.GetProReviewNodeById,
    data: reviewNodeId,
  });

export const delProReviewNodeById = (reviewNodeId) =>
  defHttp.post<any>({
    url: Api.DelProReviewNodeById,
    data: reviewNodeId,
  });

export const invalidateById = (reviewNodeId) =>
  defHttp.post<any>({
    url: Api.InvalidateById,
    data: reviewNodeId,
  });
