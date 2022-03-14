import { MenuListGetResultModel } from '../demo/model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetProjectPage = '/project/getProjectPageByQueryDto',
  //查看审核流
  GetActRuTaskByProcessId = '/ruWaitTask/getActRuTaskByProcessId',
}

// 立项管理所有页面的初始页面展示接口
export const getProjectPage = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.GetProjectPage, params });
//  查看审核流
export const getActRuTaskByProcessId = (params: any) =>
  defHttp.post<any>({ url: Api.GetActRuTaskByProcessId, data: params });
