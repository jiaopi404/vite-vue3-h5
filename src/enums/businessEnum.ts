import { ExportColumnTypeI } from '/#/business';

/**
 * 流程中的 对象类型
 */
export enum ProcessApplyObjectTypeEnum {
  PROJECT = 'pro_project',
  PROJECT_BID_SECTION = 'pro_bidSection',
  CONTRACT = 'con_contract',
  PRO_ACCEPTANCE = 'pro_acceptance',
  BIDWINNINGLIST = 'pro_bidWinningList',
  ACCEPTANCE = 'pro_acceptance',
}

export enum ProcessApplyObjectTypeNameEnum {
  PROJECT = '项目',
  PROJECT_BID_SECTION = '项目标段',
  CONTRACT = '合同',
  PRO_ACCEPTANCE = '项目验收',
  BIDWINNINGLIST = '中标',
  ACCEPTANCE = '验收',
}

const ProcessApplyObjectTypeMap = new Map<
  ProcessApplyObjectTypeEnum,
  ProcessApplyObjectTypeNameEnum
>();

ProcessApplyObjectTypeMap.set(
  ProcessApplyObjectTypeEnum.PROJECT,
  ProcessApplyObjectTypeNameEnum.PROJECT,
);
ProcessApplyObjectTypeMap.set(
  ProcessApplyObjectTypeEnum.PROJECT_BID_SECTION,
  ProcessApplyObjectTypeNameEnum.PROJECT_BID_SECTION,
);
ProcessApplyObjectTypeMap.set(
  ProcessApplyObjectTypeEnum.CONTRACT,
  ProcessApplyObjectTypeNameEnum.CONTRACT,
);
ProcessApplyObjectTypeMap.set(
  ProcessApplyObjectTypeEnum.BIDWINNINGLIST,
  ProcessApplyObjectTypeNameEnum.BIDWINNINGLIST,
);
ProcessApplyObjectTypeMap.set(
  ProcessApplyObjectTypeEnum.ACCEPTANCE,
  ProcessApplyObjectTypeNameEnum.ACCEPTANCE,
);

export { ProcessApplyObjectTypeMap };

/**
 * 导出类型
 */
export enum ExportTypeEnum {
  PROJECT,
  CONTRACT,
  BIDDINGCOMPANY,
  BIDSECTION,
  EXPERT,
  BIDWINNINGLIST,
  PURCHASE,
  CONCONTRACT,
  PROBUDGET, // 项目库项目
}
