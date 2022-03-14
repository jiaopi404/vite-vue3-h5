import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetProBudgetPageByQueryDto = '/proBudget/getProBudgetPageByQueryDto',
  SaveProBudget = '/proBudget/saveProBudget',
  CheckProBudgetRepeat = '/proBudget/checkProBudgetRepeat',
  GetProBudgetById = '/proBudget/getProBudgetById',
  DeleteProBudgetById = '/proBudget/deleteProBudgetById',
  GetProjectBudgetYear = '/proBudget/getProjectBudgetYear',
}
// ==============================【项目库管理】==============================

// 获取项目库列表
export const getProBudgetPageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetProBudgetPageByQueryDto, params });

// 保存项目库
export const saveProBudget = (params: any) => defHttp.post({ url: Api.SaveProBudget, params });

// 项目库项目名称判重
export const checkProBudgetRepeat = (params: any) =>
  defHttp.post({ url: Api.CheckProBudgetRepeat, params });

// 项目库回显
export const getProBudgetById = (params: any) =>
  defHttp.post({ url: Api.GetProBudgetById, params });

// 删除 项目库项目
export const deleteProBudgetById = (params: any) =>
  defHttp.post({ url: Api.DeleteProBudgetById, params });

// 项目汇总 年份select
export const getProjectBudgetYear = () => defHttp.get({ url: Api.GetProjectBudgetYear });
