import { HqlQueryDtoI } from '/#/business';
import { defHttp } from '/@/utils/http/axios';
import { biddingCompanyI } from './model/biddingCompanyModel';

enum Api {
  GetBiddingCompanyPageByQueryDto = '/biddingCompany/getBiddingCompanyPageByQueryDto', // 查询抽取详情列表
  getBidSectionPageByQueryDtoNew = '/bidSection/getBidSectionPageByQueryDtoNew', // 查询评价列表
  getBiddingCompanyById = '/biddingCompany/getBiddingCompanyById', // 回显 编辑
  getBiddingCompanyByUserId = '/biddingCompany/getBiddingCompanyByUserId', // 回显 编辑
  updateBiddingCompanyUseMark = '/biddingCompany/updateBiddingCompanyUseMark',
  changeBiddingCompanyStatus = '/biddingCompany/changeBiddingCompanyStatus',
  saveProEvaluate = '/proEvaluate/saveProEvaluate',
  checkProEvaluate = '/proEvaluate/checkProEvaluate',
  getProEvaluateByBidSectionId = '/proEvaluate/getProEvaluateByBidSectionId',
  saveBiddingCompanyAndUser = '/biddingCompany/saveBiddingCompanyAndUser',
  deleteBiddingCompanyById = '/biddingCompany/deleteBiddingCompanyById',
  getProFileMapGroupByFileTypeNameFromId = '/file/getProFileMapGroupByFileTypeNameFromId',
}

export const getBiddingCompanyPageByQueryDto = (queryDto: HqlQueryDtoI) =>
  defHttp.post<any>({
    url: Api.GetBiddingCompanyPageByQueryDto,
    data: queryDto,
  });
export const getBidSectionPageByQueryDtoNew = (queryDto: HqlQueryDtoI) =>
  defHttp.post<any>({
    url: Api.getBidSectionPageByQueryDtoNew,
    data: queryDto,
  });
// 审核
export const changeBiddingCompanyStatus = (roleInfo: biddingCompanyI) =>
  defHttp.post<any>({ url: Api.changeBiddingCompanyStatus, data: roleInfo });
// 设置招标公司状态
export const updateBiddingCompanyUseMark = (params?: any) =>
  defHttp.post<any>({ url: Api.updateBiddingCompanyUseMark, data: params });
// 删除单个对象
export const deleteBiddingCompanyById = (params: any) =>
  defHttp.post<any>({ url: Api.deleteBiddingCompanyById, data: params });
// 保存
export const saveBiddingCompanyAndUser = (params?: any) =>
  defHttp.post<any>({ url: Api.saveBiddingCompanyAndUser, data: params });
export const saveProEvaluate = (params?: any) =>
  defHttp.post<any>({ url: Api.saveProEvaluate, data: params });
export const checkProEvaluate = (params?: any) =>
  defHttp.post<any>({ url: Api.checkProEvaluate, data: params });
// id获取对象
export const getBiddingCompanyById = (UserExtendId: number) =>
  defHttp.post<any>({ url: Api.getBiddingCompanyById, data: UserExtendId });
export const getProEvaluateByBidSectionId = (params?: any) =>
  defHttp.post<any>({ url: Api.getProEvaluateByBidSectionId, data: params });
// UserId获取对象
export const getBiddingCompanyByUserId = (UserId: number) =>
  defHttp.post<any>({ url: Api.getBiddingCompanyByUserId, data: UserId });
// 采购相关文件 回显
export const getProFileMapGroupByFileTypeNameFromId = (params: any) =>
  defHttp.post<any>({ url: Api.getProFileMapGroupByFileTypeNameFromId, params });
