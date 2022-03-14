import { defHttp } from '/@/utils/http/axios';
enum Api {
  queryTreeLevelByBidSectionIdUrl = '/purchaseTemplate/queryTreeLevelByBidSectionId',
  queryTreeLevelByContractIdUrl = '/conContractTemplate/queryTreeLevelByContractId',
}

/**
 * @description: Get sample options value
 */
export const queryTreeLevelByBidSectionId = (params: any) =>
  defHttp.post<any>({ url: Api.queryTreeLevelByBidSectionIdUrl, params });
export const queryTreeLevelByContractId = (params: any) =>
  defHttp.post<any>({ url: Api.queryTreeLevelByContractIdUrl, params });
