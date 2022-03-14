import { defHttp } from '/@/utils/http/axios';

enum Api {
  GetAuditRecordsPageByQueryDto = '/auditRecords/getAuditRecordsPageByQueryDto',
  QueryApprovalRecord = '/auditRecords/queryApprovalRecord',
}
// ==============================【项目 标段 合同 审核记录接口】==============================

// 多标段项目、验收、合同接口
export const getAuditRecordsPageByQueryDto = (params: any) =>
  defHttp.post({ url: Api.GetAuditRecordsPageByQueryDto, params });

// 单标段项目、标段接口
export const queryApprovalRecord = (params: any) =>
  defHttp.post({ url: Api.QueryApprovalRecord, params });
