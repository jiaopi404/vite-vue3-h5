import { defHttp } from '/@/utils/http/axios';

enum Api {
  getYearProCount = '/project/getYearProCount',
  getYearMonthDayProCount = '/project/getYearMonthDayProCount',
}

// 查看项目基本信息
export const getYearProCount = (params: any) => defHttp.post({ url: Api.getYearProCount, params });
export const getYearMonthDayProCount = (params: any) =>
  defHttp.post({ url: Api.getYearMonthDayProCount, params });
