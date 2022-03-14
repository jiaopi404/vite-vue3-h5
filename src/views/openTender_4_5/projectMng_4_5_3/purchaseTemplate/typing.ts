export interface PurchaseTemplateI {
  id?: Nullable<number>;
  bidSectionId?: Nullable<number>;
  content?: Nullable<string>;
  parent?: any;
  leafLevel?: Nullable<number>;
  type?: Nullable<number>;
  addUser?: any;
  addDateTime?: Nullable<number | string | Date>;
  ifDelete?: Nullable<number>;
  ifShow?: Nullable<number>;
  useMark?: Nullable<number>;
  parentId?: Nullable<number>;
  [key: string]: any;
}
