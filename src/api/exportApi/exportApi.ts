import { HqlQueryDtoI } from '/#/business';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  ExportProject = '/project/exportProject', // 导出项目
  exportConContract = '/conContract/exportConContract', // 导出合同
  exportBiddingCompany = '/biddingCompany/exportBiddingCompany', // 导出招标公司
  exportBidsection = '/bidSection/exportBidsection', // 导出标段
  exportUserExtendAll = '/userextend/exportUserExtendAll', // 导出专家
  exportBidWinningList = '/userextend/exportUserExtendAll', // 导出中标清单
  exportPurchase = '/purchaseList/exportPurchaseList', // 导出采购清单
  exportContractList = '/conContractList/exportConContractList', // 导出合同清单 & 资产清单
  exportBidWinningListAll = '/bidWinningList/exportBidWinningList', // 导出完善中标清单
  exportProBudget = '/proBudget/exportProBudget', // 导出项目库项目
}

// 导出项目
export const exportProject = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>({ url: Api.ExportProject, data: hqlQueryDto }, { isTransformResponse: false });
// 导出合同
export const exportConContract = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportConContract, data: hqlQueryDto },
    { isTransformResponse: false },
  );
// 导出招标公司
export const exportBiddingCompany = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportBiddingCompany, data: hqlQueryDto },
    { isTransformResponse: false },
  );
// 导出标段
export const exportBidsection = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportBidsection, data: hqlQueryDto },
    { isTransformResponse: false },
  );
// 导出专家
export const exportUserExtendAll = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportUserExtendAll, data: hqlQueryDto },
    { isTransformResponse: false },
  );
// 导出中标清单
export const exportBidWinningList = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportBidWinningList, data: hqlQueryDto },
    { isTransformResponse: false },
  );

// 导出采购清单
export const exportPurchase = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>({ url: Api.exportPurchase, data: hqlQueryDto }, { isTransformResponse: false });

// 导出完善中标清单
export const exportBidWinningListAll = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportBidWinningListAll, data: hqlQueryDto },
    { isTransformResponse: false },
  );
// 导出合同清单 & 资产清单
export const exportContractList = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportContractList, data: hqlQueryDto },
    { isTransformResponse: false },
  );
// 导出项目库项目
export const exportProBudget = (hqlQueryDto: HqlQueryDtoI) =>
  defHttp.post<any>(
    { url: Api.exportProBudget, data: hqlQueryDto },
    { isTransformResponse: false },
  );
