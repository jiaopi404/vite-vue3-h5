import { defHttp } from '/@/utils/http/axios';

enum Api {
  getConContractPageByQueryDto = '/conContract/getConContractPageByQueryDto',
  saveConContractList = '/conContractList/saveConContractList',
  getConContractListPageByQueryDto = '/conContractList/getConContractListPageByQueryDto',
  deleteConContractListById = '/conContractList/deleteConContractListById',
  saveConContract = '/conContract/saveConContract',
  importConContractList = '/conContractList/importConContractList',
  perfectCompletion = '/conContract/perfectCompletion',
  saveYourselfAndAllChildren = '/conContractTemplate/saveYourselfAndAllChildren',
  verifyWhetherConContractTemplates = '/conContractTemplate/verifyWhetherConContractTemplates',
  queryTreeLevelByContractId = '/conContractTemplate/queryTreeLevelByContractId',
  saveConPaymentMethod = '/conPaymentMethod/saveConPaymentMethod',
  getConPaymentMethodPageByQueryDto = '/conPaymentMethod/getConPaymentMethodPageByQueryDto',
  getConContractById = '/conContract/getConContractById',
  getTotalByContractId = '/conPaymentMethod/getTotalByContractId',
  saveConContractTemplate = '/conContractTemplate/saveConContractTemplate',
  deleteConPaymentMethodById = '/conPaymentMethod/deleteConPaymentMethodById',
}

// 合同分页
export const getConContractPageByQueryDto = (params: any) =>
  defHttp.post<void>({ url: Api.getConContractPageByQueryDto, data: params });
// 合同清单保存
export const saveConContractList = (params: any) =>
  defHttp.post<void>({ url: Api.saveConContractList, data: params });
// 合同清单分页
export const getConContractListPageByQueryDto = (params: any) =>
  defHttp.post<void>(
    { url: Api.getConContractListPageByQueryDto, data: params },
    { isReturnNativeResponse: true },
  );
// 合同清单删除
export const deleteConContractListById = (params: any) =>
  defHttp.post<void>({ url: Api.deleteConContractListById, data: params });
// 合同保存
export const saveConContract = (params: any) =>
  defHttp.post<void>({ url: Api.saveConContract, data: params });
// 导入合同清单
export const importConContractList = (params: any) =>
  defHttp.post<void>({ url: Api.importConContractList, data: params });
export const perfectCompletion = (params: any) =>
  defHttp.post<void>({ url: Api.perfectCompletion, data: params }, { isTransformResponse: false });
// 合同模板保存
export const saveYourselfAndAllChildren = (params: any) =>
  defHttp.post<void>({ url: Api.saveYourselfAndAllChildren, data: params });
// 是否已存在合同模板
export const verifyWhetherConContractTemplates = (params: any) =>
  defHttp.post<void>({ url: Api.verifyWhetherConContractTemplates, data: params });
// 合同条款回显
export const queryTreeLevelByContractId = (params: any) =>
  defHttp.post<void>({ url: Api.queryTreeLevelByContractId, data: params });
// 付款方式保存
export const saveConPaymentMethod = (params: any) =>
  defHttp.post<void>({ url: Api.saveConPaymentMethod, data: params });
// 付款方式分页
export const getConPaymentMethodPageByQueryDto = (params: any) =>
  defHttp.post<void>({ url: Api.getConPaymentMethodPageByQueryDto, data: params });
// 根据id获取合同信息
export const getConContractById = (params: any) =>
  defHttp.post<void>({ url: Api.getConContractById, data: params });
// 付款方式合计
export const getTotalByContractId = (params: any) =>
  defHttp.post<void>({ url: Api.getTotalByContractId, data: params });
// 付款方式合计
export const saveConContractTemplate = (params: any) =>
  defHttp.post<void>({ url: Api.saveConContractTemplate, data: params });
// 付款方式删除
export const deleteConPaymentMethodById = (params: any) =>
  defHttp.post<void>({ url: Api.deleteConPaymentMethodById, data: params });
