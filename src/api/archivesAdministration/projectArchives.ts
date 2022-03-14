import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetProjectPageByQueryDto = '/project/getProjectPageByQueryDto', // 待采购分页接口
  getDepartmentStringByIdUrl = '/dep/getDepartmentStringById',
  getBidSectionPageByQueryDto = '/bidSection/getBidSectionPageByQueryDto', // 采购中、待验收、已完成分页接口
}

// 待采购分页接口
export const getProjectPageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetProjectPageByQueryDto, params });

export const getDepartmentStringById = (id: number) =>
  defHttp.post<any>(
    { url: Api.getDepartmentStringByIdUrl, params: id },
    { isTransformResponse: false },
  );

// 采购中、待验收、已完成分页接口
export const getBidSectionPageByQueryDto = (params: any) =>
  defHttp.post<any>(
    { url: Api.getBidSectionPageByQueryDto, params },
    { isTransformResponse: false },
  );
