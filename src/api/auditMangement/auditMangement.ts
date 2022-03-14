import { ContentTypeEnum } from './../../enums/httpEnum';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  ProjectDeclare = '/project/projectDeclare', // 项目发起流程
  GetFlowWaitTaskByPageByQueryDto = '/ruWaitTask/getFlowWaitTaskByPageByQueryDto', //待审核列表
  GetFlowAlreadyDoneByPageByQueryDto = '/hitask/getFlowAlreadyDoneByPageByQueryDto', //已审核列表
  GetFlowAlreadyDoneByPageByQueryDto2 = '/hitask/getFlowAlreadyDoneByPageByQueryDto2', //首页已办列表
  GetProAcceptanceFlowAlreadyDoneListBySqlPageAndSortSumDto = '/hitask/getProAcceptanceFlowAlreadyDoneListBySqlPageAndSortSumDto', //已审核列表
  GetHandleData = '/rutask/getHandleData', //查看待办流程信息
  View = '/hiprocdef/view', //查看已办流程信息
  CheckIfHandle = '/ruWaitTask/checkIfHandle', //判断该审核记录是否已审核过
  GetTasks = '/ruWaitTask/getTasks', //判断任务是否已被处理
  Handle = '/rutask/handle', //审核
  GetActRuTaskByProcessId = '/ruWaitTask/getActRuTaskByProcessId', //查看审核流
  // 标段 发起流程
  BidSectionDeclare = '/bidSection/bidSectionDeclare',
  // 暂缓
  UpdateActRuTaskIfPostponementByProcInstId = '/ruWaitTask/updateActRuTaskIfPostponementByProcInstId',
  ConContractDeclare = '/conContract/conContractDeclare', // 合同发起流程
  AcceptanceDeclare = '/proAcceptance/acceptanceDeclare', // 验收管理模块发起流程
}
// 项目 发起流程
export const projectDeclare = (data: any) => defHttp.post<any>({ url: Api.ProjectDeclare, data });
// 标段 发起流程
export const bidSectionDeclare = (data: any) =>
  defHttp.post<any>({ url: Api.BidSectionDeclare, data: data });
// 合同 发起流程
export const conContractDeclare = (data: any) =>
  defHttp.post<any>({ url: Api.ConContractDeclare, data: data });
// 验收管理模块 发起流程
export const acceptanceDeclare = (data: any) =>
  defHttp.post<any>({ url: Api.AcceptanceDeclare, data: data });
// 待审核列表查询
export const getFlowWaitTaskByPageByQueryDto = (params: any) =>
  defHttp.post<any>({ url: Api.GetFlowWaitTaskByPageByQueryDto, params });
// 已审核列表查询
export const getFlowAlreadyDoneByPageByQueryDto = (params: any) =>
  defHttp.post<any>({ url: Api.GetFlowAlreadyDoneByPageByQueryDto, params });
// 首页已办列表查询
export const getFlowAlreadyDoneByPageByQueryDto2 = (params: any) =>
defHttp.post<any>({ url: Api.GetFlowAlreadyDoneByPageByQueryDto2, params });
// 验收管理模块已审核列表查询
export const getProAcceptanceFlowAlreadyDoneListBySqlPageAndSortSumDto = (params: any) =>
  defHttp.post<any>({ url: Api.GetProAcceptanceFlowAlreadyDoneListBySqlPageAndSortSumDto, params });
//查看待办流程信息
export function getHandleData(params) {
  return defHttp.post(
    {
      url: Api.GetHandleData,
      data: params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
    },
    { isTransformResponse: false },
  );
}
//查看已办流程信息
export function view(params) {
  return defHttp.post(
    {
      url: Api.View,
      data: params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
    },
    { isTransformResponse: false },
  );
}
// 判断该审核记录是否已审核过
export const checkIfHandle = (params: any) =>
  defHttp.post<any>({ url: Api.CheckIfHandle, data: params });
// 审核前校验
export const getTasks = (params: any) => defHttp.post<any>({ url: Api.GetTasks, data: params });
// 审核
export function handle(params) {
  return defHttp.post(
    {
      url: Api.Handle,
      data: params,
      headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
    },
    { isTransformResponse: false },
  );
}
// 查看审核流,params: 流程id
export const getActRuTaskByProcessId = (params: any) =>
  defHttp.post<any>({ url: Api.GetActRuTaskByProcessId, data: params });

// 暂缓接口
export const updateActRuTaskIfPostponementByProcInstId = (procInstId) =>
  defHttp.post<any>(
    { url: Api.UpdateActRuTaskIfPostponementByProcInstId, data: procInstId },
    { isTransformResponse: false },
  );
