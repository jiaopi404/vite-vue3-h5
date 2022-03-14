import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetProjectById = '/project/getProjectById',
  GetProjectByProId = '/project/getProjectByProId',
  GetBidSectionPageByQueryDto = '/bidSection/getBidSectionPageByQueryDto',
  GetQuotedBidSectionPageByQueryDto = '/bidSection/getQuotedBidSectionPageByQueryDto',
  CheckSupplier = '/bidSection/checkSupplier',

  GetBidWinningListBy = '/bidSection/getBidWinningListBy',

  // 单行编辑的保存
  // 编辑传的 就是编辑的两个个数据
  SaveBidWinningList1 = '/bidWinningList/saveBidWinningList',
  // 提交报价的保存
  // 提交报价 暂时这样传
  // {
  //   "userId":72,
  //   "bidSectionId":9
  //   }
  SaveBidWinningList = '/bidSection/saveBidWinningList',
  SaveSupplierQuotation = '/supplierQuotation/savesupplierQuotation',
  GetSupplierQuotation = '/supplierQuotation/getsupplierQuotationById',
  GetBidSectionAndBidWinnerPageByQueryDto = '/bidWinner/getBidSectionAndBidWinnerPageByQueryDto',
  GetBidWinningListListByPageAndSortSumDto = '/bidWinningList/getBidWinningListListByPageAndSortSumDto',
  GetIdByUserIdAndBidSectionId = '/supplierQuotation/getIdByUserIdAndBidSectionId',
  SaveBidWinningListbid = '/bidWinningList/saveBidWinningList',
  GetBidWinningListById = '/bidWinningList/getBidWinningListById',
  BatchDelete = '/bidWinningList/batchDelete',
  SubmitBidWinningList = '/bidWinningList/submitBidWinningList',
  CheckBidWinningListRepeat = '/bidWinningList/checkBidWinningListRepeat',
  ImportBidWinningList = '/bidWinningList/importBidWinningList',
  GetBiddingCompanyByUserId = '/biddingCompany/getBiddingCompanyByUserId',
  CopyPurchaseToBidwinningList = '/purchaseList/copyPurchaseToBidwinningList',
}
// ==============================【招标采购(供应商)】

// 查看项目基本信息
export const getProjectById = (params: any) => defHttp.post({ url: Api.GetProjectById, params });
export const getProjectByProId = (params: any) =>
  defHttp.post({ url: Api.GetProjectByProId, params });

// ===【采购公告】
// 获取列表
export const getBidSectionPageByQueryDto = (data: any) =>
  defHttp.post({ url: Api.GetBidSectionPageByQueryDto, data });

export const getQuotedBidSectionPageByQueryDto = (data: any) =>
  defHttp.post({ url: Api.GetQuotedBidSectionPageByQueryDto, data });

// 报表 我要报价，校验接口
// {
//   "userId":72,
//   "bidSectionId":9
//   }
//   userId 当前登陆人Id，bidSectionId 选中当前行Id（标段Id）
export const checkSupplier = (data: any) => defHttp.post({ url: Api.CheckSupplier, data });

// ===【报价清单】
// 详情 显示报价清单
export const getBidWinningListBy = (params: any) =>
  defHttp.post<any>({ url: Api.GetBidWinningListBy, params }, { isTransformResponse: false });

// 编辑回显 传参当前行Id
export const getBidWinningListById = (data: any) =>
  defHttp.post({ url: Api.GetBidWinningListById, data });

// 保存单行
export const saveBidWinningList1 = (data: any) =>
  defHttp.post({ url: Api.SaveBidWinningList1, data });

// 保存报价
export const saveBidWinningList = (data: any) =>
  defHttp.post({ url: Api.SaveBidWinningList, data });

// 保存 供应商报价表
export const saveSupplierQuotation = (data: any) =>
  defHttp.post({ url: Api.SaveSupplierQuotation, data });
// 获取 供应商报价表
export const getSupplierQuotation = (data: any) =>
  defHttp.post({ url: Api.GetSupplierQuotation, data });

// ===【待确认】

// 获取待确认列表
export const getBidSectionAndBidWinnerPageByQueryDto = (data: any) =>
  defHttp.post({ url: Api.GetBidSectionAndBidWinnerPageByQueryDto, data });

// 待确认 搜索条件
export const getBiddingCompanyByUserId = (data: any) =>
  defHttp.post({ url: Api.GetBiddingCompanyByUserId, data });

// 跳转时调用
export const copyPurchaseToBidwinningList = (data: any) =>
  defHttp.post({ url: Api.CopyPurchaseToBidwinningList, data });

// ===【完善中标清单】
// 获取完善中标清单列表
export const getBidWinningListListByPageAndSortSumDto = (data: any) =>
  defHttp.post({ url: Api.GetBidWinningListListByPageAndSortSumDto, data });

// 获取报价供应商Id保存至中标清单表
export const getIdByUserIdAndBidSectionId = (data: any) =>
  defHttp.post({ url: Api.GetIdByUserIdAndBidSectionId, data });

// 添加&编辑 保存中标清单
export const saveBidWinningListbid = (data: any) =>
  defHttp.post({ url: Api.SaveBidWinningListbid, data });

// http://192.168.110.2:8085/purchase/bidWinningList/getBidWinningListById
// 回显当前行中标清单

// 批量删除中标清单
export const batchDelete = (data: any) => defHttp.post({ url: Api.BatchDelete, data });

// 提交按钮 完善中标清单发送短信
export const submitBidWinningList = (data: any) =>
  defHttp.post({ url: Api.SubmitBidWinningList, data });

// 中标清单名称判重
export const checkBidWinningListRepeat = (data: any) =>
  defHttp.post({ url: Api.CheckBidWinningListRepeat, data });

// 获取导入信息
export const importBidWinningList = (data: any) =>
  defHttp.post({ url: Api.ImportBidWinningList, data });

// /supplierQuotation/getIdByUserIdAndBidSectionId
