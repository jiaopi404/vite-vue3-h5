import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetConContractListPageByQueryDto = '/conContractList/getConContractListPageByQueryDto',
  UpdateClassificationByIds = '/conContractList/updateClassificationByIds',
  SaveOutboundRecord = '/outboundRecord/saveOutboundRecord',
  GetOutboundRecordByContractListId = '/outboundRecord/getOutboundRecordByContractListId',
}
// ==============================【资产管理模块】==============================

// 获取Table信息 资产清单列表 固定资产列表 耗材库
export const getConContractListPageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetConContractListPageByQueryDto, params });

// 设为固定资产库 & 设为耗材库（单个与批量）
export const updateClassificationByIds = (params: any) =>
  defHttp.post({ url: Api.UpdateClassificationByIds, params });

// 申请报废

// 出库
export const saveOutboundRecord = (params: any) =>
  defHttp.post({ url: Api.SaveOutboundRecord, params });

// 查看出库记录
export const getOutboundRecordByContractListId = (params: any) =>
  defHttp.post({ url: Api.GetOutboundRecordByContractListId, params });
