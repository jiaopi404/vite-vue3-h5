export interface BasicPageParams {
  page: number;
  pageSize: number;
}

export interface BasicFetchResult<T> {
  filter(arg0: (item: any) => boolean);
  filters: any;
  items: T[];
  total: number;
  [key: string]: any;
}
