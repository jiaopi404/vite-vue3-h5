import { ProjectI, BidSectionI } from '/#/business';
import { router } from '/@/router';
import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';

// 跳转的报表路由枚举类
export enum ReportUrlEnum {
  PROJECT_REPORT_URL = '/reportForm/reportBasicProjectInformation', // 项目详情
  BIDSECTION_REPORT_URL = '/reportForm/reportProjectBidsection', // 标段详情
  PROCUREMENT_REPORT_URL = '/reportForm/reportProcurementAffiche', // 采购公告
  WIN_AFFICHE_REPORT_URL = '/reportForm/reportWinAffiche', // 中标公告/结果公告
  WIN_NOTIFICATION_REPORT_URL = '/reportForm/reportWinNotification', // 中标通知书
  SUPPLIER_REPORT_URL = '/reportForm/reportSupplier', // 供应商详情
  CONTRACT_URL = '/reportForm/reportContract',
  ACCEPTANCE_URL = '/reportForm/reportAcceptanceRecord', // 验收记录
  PROJECT_BUDGET_URL = '/reportForm/reportProjectBudget', // 项目征集库
}

/**
 * 路由 与 组件路径的 枚举, 用于首页 index 报表弹窗
 */
export const ReportUrlAndComponentMap = new Map<ReportUrlEnum, any>([
  [
    ReportUrlEnum.PROJECT_REPORT_URL, // 项目报表
    createAsyncComponent(() => import('/@/views/reportForm/reportBasicProjectInformation.vue')), // 动态组件
  ],
  [
    ReportUrlEnum.BIDSECTION_REPORT_URL, // 标段报表
    createAsyncComponent(() => import('/@/views/reportForm/reportProjectBidsection.vue')), // 动态组件
  ],
  [
    ReportUrlEnum.CONTRACT_URL, // 标段报表
    createAsyncComponent(() => import('/@/views/reportForm/reportContract.vue')), // 动态组件
  ],
  [
    ReportUrlEnum.PROCUREMENT_REPORT_URL, // 采购公告
    createAsyncComponent(() => import('/@/views/reportForm/reportProcurementAffiche.vue')), // 动态组件
  ],
  [
    ReportUrlEnum.WIN_AFFICHE_REPORT_URL, // 中标公告
    createAsyncComponent(() => import('/@/views/reportForm/reportWinAffiche.vue')), // 动态组件
  ],
  [
    ReportUrlEnum.ACCEPTANCE_URL, // 验收
    createAsyncComponent(() => import('/@/views/reportForm/reportAcceptanceRecord.vue')), // 动态组件
  ],
  [
    ReportUrlEnum.PROJECT_BUDGET_URL, // 项目征集库
    createAsyncComponent(() => import('/@/views/reportForm/reportProjectBudget.vue')), // 动态组件
  ],
]);

/**
 * 统一的跳转方法
 * @returns
 */
export const useToReport = () => {
  // 跳转 项目详情
  const toReportProjectReport = (project: ProjectI, ifShow = false) => {
    router.push({
      path: ReportUrlEnum.PROJECT_REPORT_URL,
      query: {
        // bidSectionId: record.id,
        projectId: project.id,
        ifShow: ifShow,
      },
    });
  };

  // 跳转 标段详情
  const toReportBidsection = (bidSection: BidSectionI, ifShow = false, acceptanceId) => {
    router.push({
      path: ReportUrlEnum.BIDSECTION_REPORT_URL,
      query: {
        bidSectionId: bidSection.id,
        ifShow: ifShow,
        acceptanceId,
      },
    });
  };

  // 跳转 采购公告
  const toReportProcurementAffiche = (bidSectionId) => {
    router.push({
      path: ReportUrlEnum.PROCUREMENT_REPORT_URL,
      query: {
        bidSectionId,
      },
    });
  };

  // 跳转 中标公告/结果公告
  const toReportWinAffiche = (bidSection: BidSectionI) => {
    router.push({
      path: ReportUrlEnum.WIN_AFFICHE_REPORT_URL,
      query: {
        bidSectionId: bidSection.id,
      },
    });
  };

  // 跳转 中标通知书
  const toReportWinNotification = (bidSectionId) => {
    router.push({
      path: ReportUrlEnum.WIN_NOTIFICATION_REPORT_URL,
      query: {
        bidSectionId,
      },
    });
  };

  // 跳转 供应商详情
  const toReportSupplier = (biddingCompany) => {
    router.push({
      path: ReportUrlEnum.SUPPLIER_REPORT_URL,
      query: {
        supplierId: biddingCompany.id,
      },
    });
  };

  // 跳转 合同
  const toReportContract = (contract, ifShow = false) => {
    router.push({
      path: ReportUrlEnum.CONTRACT_URL,
      query: {
        contractId: contract.id,
        ifShow: ifShow,
      },
    });
  };

  // 跳转 验收记录
  const toReportAcceptanceRecord = (waitDealtWith, ifShow = false, acceptanceId) => {
    router.push({
      path: ReportUrlEnum.ACCEPTANCE_URL,
      query: {
        bidSectionId: waitDealtWith.bidSectionId,
        ifShow: ifShow,
        acceptanceId,
      },
    });
  };

  // 跳转 项目征集库
  const toReportProjectBudget = (proBudget) => {
    router.push({
      path: ReportUrlEnum.PROJECT_BUDGET_URL,
      query: {
        proBudgetId: proBudget.id,
      },
    });
  };

  return {
    toReportProjectReport,
    toReportBidsection,
    toReportProcurementAffiche,
    toReportWinAffiche,
    toReportWinNotification,
    toReportSupplier,
    toReportContract,
    toReportAcceptanceRecord,
    toReportProjectBudget,
  };
};

/**
 * 首页的 index 跳转方法
 * @returns
 */
export const useIndexDialogToReport = () => {
  // 项目基本信息
  const indexDialogToReportProjectReport = (project: ProjectI, ifShow = false) => {
    return {
      asyncComponent: ReportUrlAndComponentMap.get(ReportUrlEnum.PROJECT_REPORT_URL),
      props: {
        projectId: project.id,
        ifShow: ifShow,
      },
    };
  };

  // 跳转 标段详情
  const indexDialogToReportBidsection = (bidSection: BidSectionI, ifShow = false) => {
    return {
      asyncComponent: ReportUrlAndComponentMap.get(ReportUrlEnum.BIDSECTION_REPORT_URL),
      props: {
        bidSectionId: bidSection.bidSectionId,
        ifShow: ifShow,
        acceptanceId: bidSection.id,
      },
    };
  };

  // 跳转 合同
  const indexDialogToReportContract = (contract, ifShow = false) => {
    return {
      asyncComponent: ReportUrlAndComponentMap.get(ReportUrlEnum.CONTRACT_URL),
      props: {
        contractId: contract.id,
        ifShow: ifShow,
      },
    };
  };

  // 跳转 采购公告
  const indexDialogToReportProcurementAffiche = (bidSectionId) => {
    return {
      asyncComponent: ReportUrlAndComponentMap.get(ReportUrlEnum.PROCUREMENT_REPORT_URL),
      props: {
        bidSectionId,
      },
    };
  };

  // 跳转 中标公告
  const indexDialogToReportWinAffiche = (bidSectionId) => {
    return {
      asyncComponent: ReportUrlAndComponentMap.get(ReportUrlEnum.WIN_AFFICHE_REPORT_URL),
      props: {
        bidSectionId,
      },
    };
  };

  // 跳转 验收报表
  const indexDialogToReportAcceptance = (
    payload: { bidSectionId: number; acceptanceId: number },
    ifShow = false,
  ) => {
    return {
      asyncComponent: ReportUrlAndComponentMap.get(ReportUrlEnum.ACCEPTANCE_URL),
      props: {
        bidSectionId: payload.bidSectionId,
        ifShow: ifShow,
        acceptanceId: payload.acceptanceId,
      },
    };
  };
  return {
    indexDialogToReportProjectReport,
    indexDialogToReportBidsection,
    indexDialogToReportProcurementAffiche,
    indexDialogToReportWinAffiche,
    indexDialogToReportContract,
    indexDialogToReportAcceptance,
  };
};
