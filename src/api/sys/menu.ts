import { defHttp } from '/@/utils/http/axios';
import { getMenuListResultModel } from './model/menuModel';
import { PathVariableParser } from '/@/utils/commonServe';

enum Api {
  GetMenuList = '/menu/getMenuList/{menuType}/{tagModules}/{year}',
  GetModuleMenusList = '/menu/getModuleMenusList/{menuType}/{tagModules}', // 获取模块分组的菜单列表
  GetAuthorityTagModule = '/menu/getAuthorityTagModule/{menuType}', // 根据权限获取模块
  getMenuNum = '/menu/getMenuNum',
  refreshMenu = '/menu/refreshMenu', //更新菜单缓存
}

/**
 * @description: Get user menu based on id
 */
export const getMenuList = ({
  menuType,
  tagModules,
  year,
}: {
  menuType: number | string;
  tagModules: number | string;
  year: number | string;
}) => {
  return defHttp.get<any>({
    url:
      new PathVariableParser().parse(Api.GetMenuList, { menuType, tagModules, year }) +
      '?useMark=true',
  });
};

/**
 * @description: 根据权限获取模块
 */
export const getAuthorityTagModule = ({ menuType = 1 }: { menuType: number | string }) => {
  return defHttp.get<any>({
    url: new PathVariableParser().parse(Api.GetAuthorityTagModule, { menuType }),
  });
};

/**
 * 获取菜单，根据模块分组
 * @param menyType -1 全部 0 管理端 1 业务端 2 小程序端
 * @param tagModules 菜单所属模块 -1 全部 其他 模块id
 * @returns
 */
export const getModuleMenusList = ({
  menuType,
  tagModules,
}: {
  menuType: number | string;
  tagModules: number | string;
}) => {
  return defHttp.get<any>({
    url:
      new PathVariableParser().parse(Api.GetModuleMenusList, { menuType, tagModules }) +
      '?useMark=1',
  });
};
export const getMenuNum = (params: any) => defHttp.post<any>({ url: Api.getMenuNum, data: params });
// 更新菜单缓存
export const refreshMenu = () => defHttp.post<any>({ url: Api.refreshMenu });
