import { MenuListGetResultModel } from './model/systemModel';
import { HqlQueryDtoI, MenuObj } from '/#/business';
import { defHttp } from '/@/utils/http/axios';

enum Api {
  MenuList = '/menu/getMenuPageList',
  SaveMenu = '/menu/saveMenu',
  RemoveMenu = '/menu/deleteMenu',
  SaveDictionary = '/dic/saveDictionary',
  RemoveDictionary = '/dic/deleteDictionary',
  CharmNameRepeat = '/dic/checkDictionaryByName',
  MenuNameRepeat = '/menu/checkMenuByTitle',
}

// 获取菜单
export const getMenuList = (params?: HqlQueryDtoI) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.MenuList, params });
// 添加菜单
export const saveMenu = (params?: MenuObj) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SaveMenu, params });
// 删除菜单
export const removeMenu = (params?: number) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.RemoveMenu, params });
// 添加菜单
export const saveDictionary = (params?: MenuObj) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.SaveDictionary, params });
// 删除菜单
export const removeDictionary = (params?: number) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.RemoveDictionary, params });
// 字典名称判重
export const charmNameRepeat = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.CharmNameRepeat, params });
// 菜单名称判重
export const menuNameRepeat = (params?: any) =>
  defHttp.post<MenuListGetResultModel>({ url: Api.MenuNameRepeat, params });
