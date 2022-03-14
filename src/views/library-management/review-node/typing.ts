export interface ReviewNodeI {
  id?: number;
  addDateTime?: string;
  extractCount?: number;
  extractMethod?: number; // 0：手动抽取，1：随机抽取
  extractType?: number; // 0：专家，1：招标公司
  ifDelete?: number;
  ifExtract?: number;
  ifReview?: number;
  node?: number;
  objectId?: string | number;
  objectName?: string;
  reviewMethod?: number;
  statusId?: number;
  ifOnFile?: number;
  addUserId?: number;
  [key: string]: any;
}

export interface ProExtConditionI {
  id?: number;
  addDateTime?: string;
  addUserId?: number;
  ifDelete?: number;
  keyWord?: object;
  researchAreaId?: object;
  reviewId?: number;
  updateDateTime?: string;
  userNumber?: number;
  expertCategoryId?: number;
  researchAreaIds?: string;
  status?: number; // 未回复1参与2不参与3
  userCount?: number;
  [key: string]: any;
}

// 招标公司
export interface BiddingCompanyI {
  id?: number;
  adddateTime?: string;
  address?: string;
  bankAccount?: string;
  businessType?: string;
  comlicCode?: string;
  complaintNumber?: number;
  depositBank?: string;
  ifDelete?: number;
  ifRepairer?: number;
  ifSupplier?: number;
  legalperCitId?: string;
  legalperName?: string;
  legalperTel?: string;
  majorScope?: string;
  name?: string;
  officeAddress?: string;
  regdate?: string;
  regfunAmount?: number;
  regtel?: object;
  useMark?: number;
  user?: { [key: string]: any };
  [key: string]: any;
}

export type AddReviewNodeActionType = {
  init(...args): Promise<Nullable<ReviewNodeI>>;
  reset(): void;
  confirm(): Promise<any>;
};
