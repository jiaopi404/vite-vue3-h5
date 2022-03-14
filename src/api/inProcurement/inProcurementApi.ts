import { MenuListGetResultModel } from '../demo/model/systemModel';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  getRegisteredSupplierPageByQueryDtoUrl = '/registeredSupplier/getRegisteredSupplierPageByQueryDto',
  saveRegisteredSupplierUrl = '/registeredSupplier/saveRegisteredSupplier',
  queryAllSelectUrl = '/biddingCompany/queryAllSelect',
  getRegisteredSupplierByIdUrl = '/registeredSupplier/getRegisteredSupplierById',
  deleteRegisteredSupplierByIdUrl = '/registeredSupplier/deleteRegisteredSupplierById',
}

// 录入报名供应商列表展示接口
export const getRegisteredSupplierPageByQueryDto = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.getRegisteredSupplierPageByQueryDtoUrl, params });
// 保存接口
export const saveRegisteredSupplier = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.saveRegisteredSupplierUrl, params });

export const queryAllSelect = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.queryAllSelectUrl, params });
// 删除
export const deleteRegisteredSupplierById = (params: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.deleteRegisteredSupplierByIdUrl, params });
