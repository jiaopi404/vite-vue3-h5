import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetBidSectionPageByQueryDto = '/bidSection/getBidSectionPageByQueryDto',
  GetProjectById = '/project/getProjectById',
}
// ==============================【待接收】
// 获取列表
export const getBidSectionPageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetBidSectionPageByQueryDto, params });

// 查看项目基本信息
export const getProjectById = (params: any) =>
  defHttp.post({ url: Api.GetProjectById, data: params });
