/**
 * 业务相关的通用类型, inteface
 */
// ======== 以下 query dto 的 interface ==============
// 排序
export interface MySortI {
  // * 排序字段 对象写法 eq: 'boy.name' 即为 boy对象的name字段, 'name' 即为该对象的name字段
  prop: string;
  // * 排序类型 asc 升序 desc 降序 不区分大小写
  dir: string;
}
// 分页
export interface MyPageI {
  pageNum: number; // 之前是 page
  pageSize: number;
}
// 单个查询条件
export interface MyQueryDtoI {
  param: string;
  type: string;
  value?: (string | number | undefined)[];
}
// 导出 excel 的 dto
export interface ExportExcelDtoI {
  fileName: string;
  sheetName: string;
  ifShowTotal?: boolean;
  listDataColumn: ExportColumnTypeI[];
}
// 查询参数
export interface HqlQueryDtoI {
  hqlPageAndSortSumDto: {
    ifCustomHql?: boolean; // 默认 true
    sorts?: MySort[];
    // 不传分页，获取所有
    page?: Nullable<MyPageI>;
    // 查询条件
    queryList: MyQueryDtoI[];
    // 要合计的字段
    sumList?: string[];
    // 表名
    dataFieldList: string[];
    // 导出 excel
    exportExcelDto?: ExportExcelDtoI;
  };
}

// 查询参数
export interface SqlQueryDtoI {
  sqlPageAndSortSumDto: {
    ifCustomSql?: boolean; // 默认 true
    sorts?: MySort[];
    // 不传分页，获取所有
    page?: Nullable<MyPageI>;
    // 查询条件
    queryList: MyQueryDtoI[];
    // 要合计的字段
    sumList?: string[];
    // 表名，可以空
    dataFieldList?: string[];
  };
}

// ======== 以下 分页接口返回的 interface ==============
// 返回结果的分页结构
export interface MyPageInfo<T> {
  content: T[];
  totalElementAmount?: number;
  [key: string]: any;
}
// 返回 结果 结构
export interface HqlRespI<T> {
  // 合计 map
  mapListSumAmount?: { [key: string]: number };
  page: MyPageInfo<T>;
  [key: string]: any;
}
export interface ParentMenu<T> {
  // 合计 map
  id?: number;
}
// 单个菜单
export interface MenuObj {
  component: string;
  hidden: boolean;
  ifShowDigitalReminder: number;
  menuOrder: number;
  menuType: number;
  parentMenu: ParentMenu<T> | null;
  path: string;
  shiroKey: string;
  tagModule: number | null;
  title: string;
  useMark: number;
}

/**
 * 导出列的 interface
 */
export interface ExportColumnTypeI {
  // { dataName: 'proName', dataType: 'String', dataTitle: '项目名称', width: 3000 },
  dataName: string;
  dataType: 'String' | 'BigDecimal' | 'Date' | 'DateTime';
  dataTitle: string;
  width: number;
}

// 标段
export interface BidSectionI {
  id?: Nullable<number>;
  project?: ProjectI;
  sort?: Nullable<number>;
  proName?: Nullable<string>;
  organizationalForm?: DictionaryI;
  procurementMethod?: DictionaryI;
  quoteEndTime?: Nullable<number | string | Date>;
  proNumber?: Nullable<string>;
  budgetAmount?: Nullable<number>;
  bidWinningAmount?: Nullable<number>;
  biddingCompany?: any;
  ifUploadProcurementDocuments?: Nullable<number>;
  status?: DictionaryI;
  processId?: Nullable<string>;
  participants?: Nullable<string>;
  ifAbandonedBid?: Nullable<number>;
  resultNotice?: Nullable<string>;
  resultNoticeUrl?: Nullable<string>;
  upLoader?: Nullable<number>;
  ifDelete?: Nullable<number>;
  addDateTime?: Nullable<number | string | Date>;
  updateDateTime?: Nullable<number | string | Date>;
  verificateeInformation?: Nullable<string>;
  remainingAmount?: Nullable<number>;
  bidWinner?: any;
  [key: string]: any;
}
// 项目
export interface ProjectI {
  id?: Nullable<number>;
  proName?: Nullable<string>;
  purchaseNumber?: Nullable<string>;
  serviceContent?: Nullable<string>;
  servicePeriod?: Nullable<number>;
  countryOfOrigin?: Nullable<string>;
  budgetAmount?: Nullable<number>;
  fundsCategoryId?: Nullable<number>;
  fundsDepId?: Nullable<number>;
  fundsUserId?: Nullable<number>;
  relevantDepId?: Nullable<number>;
  relevantUserId?: Nullable<number>;
  natureFunds?: any;
  sourceFunds?: any;
  engineeringProperties?: any;
  useDirection?: any;
  planUseTime?: Nullable<number | string | Date>;
  planPurchaseTime?: Nullable<number | string | Date>;
  projectType?: any;
  ifGovProcurement?: Nullable<number>;
  ifLargeEquipment?: Nullable<number>;
  ifImportedEquipment?: Nullable<number>;
  ifSingleSource?: Nullable<number>;
  proposedTransactionUnit?: Nullable<string>;
  proChargeDepId?: Nullable<number>;
  proChargeUserId?: Nullable<number>;
  biddingDepartmentId?: Nullable<number>;
  BiddingUserId?: Nullable<number>;
  assignorUserId?: Nullable<number>;
  projectOverview?: Nullable<string>;
  initiationDate?: Nullable<number | string | Date>;
  initiationMethod?: Nullable<string>;
  otherInitiationMethod?: Nullable<string>;
  projectDesc?: Nullable<string>;
  intentionPublicEndTime?: Nullable<number | string | Date>;
  declareDept?: any;
  addUser?: any;
  currencyType?: any;
  bidWinningAmount?: Nullable<number>;
  projectAdditionPhase?: Nullable<number>;
  mainFunctionalObjectives?: Nullable<string>;
  basicRequirements?: Nullable<string>;
  qualityRequirements?: Nullable<string>;
  serviceRequirements?: Nullable<string>;
  safetyRequirements?: Nullable<string>;
  timeLimitRequirements?: Nullable<string>;
  status?: DictionaryI;
  ifMultiBidSection?: Nullable<number>;
  multiBidSectionAdditionPhase?: Nullable<number>;
  biddingCompanyId?: Nullable<number>;
  planOrganizationalForm?: Nullable<DictionaryI>;
  organizationalForm?: Nullable<DictionaryI>;
  planProcurementMethod?: Nullable<DictionaryI>;
  procurementMethod?: Nullable<DictionaryI>;
  decentralizedPurchaseMethod?: Nullable<number>;
  releaseDate?: Nullable<number | string | Date>;
  quoteStartTime?: Nullable<number | string | Date>;
  quoteEndTime?: Nullable<number | string | Date>;
  quaRequire?: Nullable<string>;
  remark?: Nullable<string>;
  processId?: Nullable<string>;
  ifDelete?: Nullable<number>;
  addDateTime?: Nullable<number | string | Date>;
  updateDateTime?: Nullable<number | string | Date>;
  dateOfDelivery?: Nullable<string>;
  verificateFailedMsg?: Nullable<string>;
  auditRecords?: any;
  proReviewNode?: any;
  ifInitiateMethodAttachment?: Nullable<number>;
  ProjectTypeId?: Nullable<number>;
  fundsUserIdMsg?: Nullable<string>;
  relevantUserIdMsg?: Nullable<string>;
  ifHandle?: Nullable<number>;
  [key: string]: any;
}
// 字典
export interface DictionaryI {
  id?: number;
  parentId?: Nullable<number>;
  name?: Nullable<string>;
  code?: Nullable<string>;
  addDateTime?: Nullable<number | string | Date>;
  updateDateTime?: Nullable<number | string | Date>;
  ifDelete?: Nullable<number>;
  sort?: Nullable<number>;
  node?: Nullable<string>;
  useMark?: Nullable<number>;
  menuNumber?: Nullable<number>;
  [key: string]: any;
}

// 通知
export interface NoticeI {
  id?: number;
  title?: string;
  content?: Nullable<string>;
  systemModule?: Nullable<number>;
  role?: Nullable<number>;
  viewingTimes?: Nullable<number>;
  ifIndexShow?: Nullable<number>;
  pic?: Nullable<string>;
  addUserId?: any;
  addDateTime?: Nullable<number | string | Date>;
  ifDelete?: Nullable<number>;
  useMark?: Nullable<number>;
  updateDateTime?: Nullable<number | string | Date>;
  [key: string]: any;
}

export interface UserI {
  id?: number;
  orgId?: Nullable<number>;
  orgName?: Nullable<string>;
  department?: Nullable<DepartmentI>;
  account?: Nullable<string>;
  password?: Nullable<string>;
  perName?: Nullable<string>;
  sexCode?: Nullable<number>;
  mobile?: Nullable<string>;
  citId?: Nullable<string>;
  ifDepHead?: Nullable<number>;
  ifChargeDirector?: Nullable<number>;
  ifChargeLeader?: Nullable<number>;
  ifFullAccess?: Nullable<number>;
  pic?: Nullable<string>;
  skin?: Nullable<string>;
  signature?: Nullable<string>;
  openId?: Nullable<string>;
  unionId?: Nullable<string>;
  roleIds?: Nullable<string>;
  role?: Nullable<number>;
  ifSchoolExpert?: Nullable<number>;
  approveStatus?: Nullable<number>;
  authorizeDepIds?: Nullable<string>;
  processAuthorizeDepIds?: Nullable<string>;
  lastLogin?: Nullable<number | string | Date>;
  addDateTime?: Nullable<number | string | Date>;
  ifDelete?: Nullable<number>;
  useMark?: Nullable<number>;
  sessionId?: Nullable<string>;
  systemType?: Nullable<number>;
  roleCode?: Nullable<string>;
  depId?: Nullable<number>;
  depName?: Nullable<string>;
  researchAreaNames?: Nullable<string>;
  ifSupplier?: Nullable<number>;
  ifRepairer?: Nullable<number>;
  companyName?: Nullable<string>;
  approveSuggestion?: Nullable<string>;
  [key: string]: any;
}

export interface DepartmentI {
  id?: number;
  name?: Nullable<string>;
  attribute?: Nullable<DictionaryI>;
  code?: Nullable<string>;
  parent?: any;
  organization?: any;
  ifCentralized?: Nullable<number>;
  ifMgt?: Nullable<number>;
  ifAccounting?: Nullable<number>;
  ifDirector?: Nullable<number>;
  ifControl?: Nullable<number>;
  ifPurOrg?: Nullable<number>; // 是否组织部门
  ifConDirector?: Nullable<number>;
  ifDelete?: Nullable<number>;
  useMark?: Nullable<number>;
  addDateTime?: Nullable<number | string | Date>;
  updateDateTime?: Nullable<number | string | Date>;
  parentId?: Nullable<number>;
  [key: string]: any;
}

export interface ProcessWaitDealI {
  ID_?: string;
  REV_?: number;
  EXECUTION_ID_?: string;
  PROC_INST_ID_?: string;
  PROC_DEF_ID_?: string;
  TASK_DEF_ID_?: any;
  SCOPE_ID_?: any;
  SUB_SCOPE_ID_?: any;
  SCOPE_TYPE_?: any;
  SCOPE_DEFINITION_ID_?: any;
  PROPAGATED_STAGE_INST_ID_?: any;
  NAME_?: string;
  PARENT_TASK_ID_?: any;
  DESCRIPTION_?: any;
  TASK_DEF_KEY_?: string;
  OWNER_?: any;
  ASSIGNEE_?: string;
  DELEGATION_?: any;
  PRIORITY_?: number;
  CREATE_TIME_?: string;
  DUE_DATE_?: any;
  CATEGORY_?: any;
  SUSPENSION_STATE_?: number;
  TENANT_ID_?: string;
  FORM_KEY_?: any;
  CLAIM_TIME_?: any;
  IS_COUNT_ENABLED_?: number;
  VAR_COUNT_?: number;
  ID_LINK_COUNT_?: number;
  SUB_TASK_COUNT_?: number;
  IF_POSTPONEMENT?: number;
  PNAME_?: string;
  DEPLOYMENT_ID_?: string;
  DGRM_RESOURCE_NAME_?: string;
  processObjectName?: string;
  processObjectCode?: string;
  applyObjectType?: '' | '' | '';
  organizationalFormName?: any;
  procurementMethodName?: any;
  amount?: string;
  projectCategoryName?: any;
  processObjectId?: string;
  proCode?: any;
  addDepId?: string;
  addDepName?: string;
  INITATOR?: string;
  processDescription?: string;
  currencyTypeName?: string;
  planUseTime?: string;
  addUserPerName?: string;
  addUserMobile?: string;
  addDateTime?: string;
  code?: string;
  perName?: string;
  tagModuleId?: string;
  [key: string]: any;
}

export interface ProcessAlreadyDoneI {
  ID_?: string;
  REV_?: number;
  PROC_DEF_ID_?: string;
  TASK_DEF_ID_?: any;
  TASK_DEF_KEY_?: string;
  PROC_INST_ID_?: string;
  EXECUTION_ID_?: string;
  SCOPE_ID_?: any;
  SUB_SCOPE_ID_?: any;
  SCOPE_TYPE_?: any;
  SCOPE_DEFINITION_ID_?: any;
  PROPAGATED_STAGE_INST_ID_?: any;
  NAME_?: string;
  PARENT_TASK_ID_?: any;
  DESCRIPTION_?: any;
  OWNER_?: any;
  ASSIGNEE_?: string;
  START_TIME_?: string;
  CLAIM_TIME_?: any;
  END_TIME_?: string;
  DURATION_?: number;
  DELETE_REASON_?: any;
  PRIORITY_?: number;
  DUE_DATE_?: any;
  FORM_KEY_?: any;
  CATEGORY_?: any;
  TENANT_ID_?: string;
  LAST_UPDATED_TIME_?: string;
  PNAME_?: string;
  DEPLOYMENT_ID_?: string;
  DGRM_RESOURCE_NAME_?: string;
  processObjectName?: string;
  processObjectCode?: string;
  applyObjectType?: string;
  organizationalFormName?: any;
  procurementMethodName?: any;
  amount?: string;
  projectCategoryName?: any;
  processObjectId?: string;
  proCode?: any;
  addDepId?: string;
  addDepName?: string;
  processDescription?: string;
  currencyTypeName?: string;
  planUseTime?: string;
  addUserPerName?: string;
  addUserMobile?: string;
  addDateTime?: string;
  code?: any;
  INITATOR?: string;
  perName?: string;
  tagModuleId?: string;
  [key: string]: any;
}
/**
 * 下载文件类型
 */
export interface FileI {
  id?: Nullable<number>;
  objectId?: Nullable<number>;
  objectName?: Nullable<string>;
  fileTypeId?: Nullable<number>;
  name?: Nullable<string>;
  url?: Nullable<string>;
  size?: Nullable<number>;
  addUserId?: Nullable<number>;
  fileExplain?: Nullable<string>;
  addDateTime?: Nullable<number | string | Date>;
  updateDateTime?: Nullable<number | string | Date>;
  ifDelete?: Nullable<number>;
  [key: string]: any;
}

export interface CommonFileI {
  id?: Nullable<number>;
  name: string;
  downloadType?: any;
  attach?: Nullable<string>;
  role?: Nullable<number>;
  addDateTime?: Nullable<number | string | Date>;
  updateDateTime?: Nullable<number | string | Date>;
  ifDelete?: Nullable<number>;
  useMark?: Nullable<number>;
  downloadAmount?: Nullable<number>;
  systemModule?: Nullable<number>;
  [key: string]: any;
}

export interface NoticeI {
  id?: Nullable<number>;
  title?: Nullable<string>;
  content?: Nullable<string>;
  systemModule?: Nullable<number>;
  role?: Nullable<number>;
  viewingTimes?: Nullable<number>;
  ifIndexShow?: Nullable<number>;
  pic?: Nullable<string>;
  addUserId?: any;
  addDateTime?: Nullable<number | string | Date>;
  ifDelete?: Nullable<number>;
  useMark?: Nullable<number>;
  updateDateTime?: Nullable<number | string | Date>;
  [key: string]: any;
}

// 我的业务 interfce
export interface MyBusinessItemI {
  addDateTime: number;
  amount: Nullable<number>;
  currencyTypeName: string;
  id: number;
  name: string;
  objNumber: string;
  statusName: string;
  type: string;
  [key: string]: any;
}
