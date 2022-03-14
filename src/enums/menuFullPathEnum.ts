/**
 * 菜单全路径 enum
 */
export enum MenuFullPathEnum {
  // 招标采购 - 项目管理
  PRO_MNG_WAIT_PURCHASE = '/proMng/proMngWaitPurchase',
  // 招标采购 - 项目评审
  // 采购计划 - 采购日历
  PURCHASE_PLAN_PURCHASE_CALENDER = '/purchasePlan_4_2/purchaseCalendar',
  // 审核管理菜单路由
  // 采购计划 审核管理
  PURCHASE_PLAN_AUDIT_MANAGEMENT_WAIT_AUDIT = '/purchasePlanAuditManagement/waitAudit',
  PURCHASE_PLAN_AUDIT_MANAGEMENT_ALREADY_AUDIT = '/purchasePlanAuditManagement/alreadyAudit',
  // 立项管理 审核管理
  PROJECT_INITIALIZATION_AUDIT_MANAGEMENT_WAIT_AUDIT = '/projectInitializationAuditManagement/waitAudit',
  PROJECT_INITIALIZATION_AUDIT_MANAGEMENT_ALREADY_AUDIT = '/projectInitializationAuditManagement/alreadyAudit',
  // 意向公开 审核管理
  DISCLOSURE_AUDIT_MANAGEMENT_WAIT_AUDIT = '/disclosureAuditManagement/waitAudit',
  DISCLOSURE_AUDIT_MANAGEMENT_ALREADY_AUDIT = '/disclosureAuditManagement/alreadyAudit',
  // 采购申报 审核管理
  PURCHASE_DECLARE_AUDIT_MANAGEMENT_WAIT_AUDIT = '/purchaseDeclareAuditManagement/waitAudit',
  PURCHASE_DECLARE_AUDIT_MANAGEMENT_ALREADY_AUDIT = '/purchaseDeclareAuditManagement/alreadyAudit',
  // 招标采购 审核管理
  TENDER_PURCHASE_AUDIT_MANAGEMENT_WAIT_AUDIT = '/tenderPurchaseAuditManagement/waitAudit',
  TENDER_PURCHASE_AUDIT_MANAGEMENT_ALREADY_AUDIT = '/tenderPurchaseAuditManagement/alreadyAudit',
}

/**
 * 模块名称的 enum
 */
export enum TagModuleNameEnum {
  PURCHASE_PLAN = 'purchasePlan', // 采购计划
  OPEN_TENDER = 'openTender', // 招标采购
}

// TODO: 可能会修改这个，用于判断是否需要改变 currentActiveMenu;
export enum HiddenMenuPrefixEnum {
  REPORT = 'reportForm',
}
