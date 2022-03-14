import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetBidSectionPageByQueryDtoNew = '/bidSection/getBidSectionPageByQueryDtoNew',
  GetBidSectionStatistics = '/bidSection/getBidSectionStatistics',

  GetNoticePageByQueryDto = '/notice/getNoticePageByQueryDto',
  GetCommonFilePageByQueryDto = '/commonFile/getCommonFilePageByQueryDto',
}
// ==============================【采购公告与结果公告展示页】==============================

// 统计接口 4个统计数据 参数空{}
export const getBidSectionStatistics = (params: any) =>
  defHttp.post({ url: Api.GetBidSectionStatistics, params });

// 通知公告接口
export const getNoticePageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetNoticePageByQueryDto, params });

// 常用下载接口
export const getCommonFilePageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetCommonFilePageByQueryDto, params });

// 采购公告 & 结果公告
export const getBidSectionPageByQueryDtoNew = (params: any) =>
  defHttp.post({ url: Api.GetBidSectionPageByQueryDtoNew, params });
