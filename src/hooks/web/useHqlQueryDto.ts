import { cloneDeep } from 'lodash-es';
import { unref } from 'vue';
import { HqlQueryDtoI, MyPageI, MyQueryDtoI, MySortI, SqlQueryDtoI } from '/#/business';
import { deepMerge } from '/@/utils';

/** @type {*} */
const defaultHqlQueryDto: HqlQueryDtoI = {
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [],
    dataFieldList: [],
    page: null,
    sorts: [],
    sumList: undefined,
  },
};
const defaultSqlQueryDto: SqlQueryDtoI = {
  sqlPageAndSortSumDto: {
    ifCustomSql: true,
    queryList: [],
    page: null,
    sorts: [],
    sumList: undefined,
  },
};

/**
 * hooks 方法
 * @param hqlQueryDto 初始查询参数
 * @returns 可用的 hook
 */
export const useHqlQueryDto = (hqlQueryDto: HqlQueryDtoI | undefined) => {
  let hqlQueryDtoRef: HqlQueryDtoI = deepMerge(cloneDeep(defaultHqlQueryDto), hqlQueryDto || {});

  const cacheInitHqlQueryDto = cloneDeep(hqlQueryDtoRef);

  /**
   * 重置为初始的查询参数
   */
  const resetHqlQueryDto = () => {
    hqlQueryDtoRef = cloneDeep(cacheInitHqlQueryDto);
  };

  /**
   * 设置分页参数
   * @param page MyPageI
   */
  const setPage = (page: MyPageI) => {
    hqlQueryDtoRef.hqlPageAndSortSumDto.page = page;
  };

  /**
   * 根据 queryInfo 设置 page
   * @param queryInfo
   */
  const setPageByQueryInfo = (queryInfo) => {
    if (queryInfo.page && queryInfo.pageSize) {
      setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
    }
  };

  /**
   * @description 添加查询参数到 queryList
   * @author jiaopi404
   * @date 23/11/2021
   * @param {...MyQueryDtoI[]} queryItems
   */
  const appendQueryList = (...queryItems: MyQueryDtoI[]) => {
    hqlQueryDtoRef.hqlPageAndSortSumDto.queryList.unshift(...queryItems);
  };

  /**
   * 根据 value 有无值，添加queryItem；要求value 是基本类型的值，如 单选，字符串输入框等；
   * @param param
   * @param type
   * @param value
   */
  function appendQueryListByQueryInfoValuePlain(
    param: string,
    type: string,
    value: string | number,
  ): void {
    if (value) {
      if (typeof value === 'string') {
        appendQueryList({
          param,
          type,
          value: [value],
        });
      }
      if (typeof value === 'number') {
        appendQueryList({
          param,
          type,
          value: [value],
        });
      }
    }
  }

  /**
   * 更新单个 queryItem 的方法
   * @param queryItem {Partial<MyQueryDtoI>};
   */
  const updateQueryItem = (queryItem: Partial<MyQueryDtoI>) => {
    const oldQueryItem = hqlQueryDtoRef.hqlPageAndSortSumDto.queryList.find(
      (_) => _.param === queryItem.param,
    );
    if (oldQueryItem) {
      oldQueryItem.type = queryItem.type ? queryItem.type : oldQueryItem.type;
      oldQueryItem.value = queryItem.value ? queryItem.value : oldQueryItem.value;
    }
  };

  /**
   * @description 重新设置查询参数 queryList
   * @author jiaopi404
   * @date 23/11/2021
   * @param {...MyQueryDtoI[]} queryItems
   */
  const setQueryList = (...queryItems: MyQueryDtoI[]) => {
    const _queryList = hqlQueryDtoRef.hqlPageAndSortSumDto.queryList;
    _queryList?.splice(0, _queryList.length, ...queryItems);
  };

  /**
   * @description 设置 sorts
   * @author jiaopi404
   * @date 23/11/2021
   * @param {...MySortI[]} sorts
   */
  const setSorts = (...sorts: MySortI[]) => {
    const _sorts = hqlQueryDtoRef.hqlPageAndSortSumDto.sorts;
    _sorts?.splice(0, _sorts.length, ...sorts);
  };

  const setSortByQueryInfo = (queryInfo, PrefixName?: String) => {
    if (queryInfo.field) {
      // 排序的字段
      // const _prop = queryInfo.field;
      const _prop = PrefixName ? `${PrefixName}.${queryInfo.field}` : `${queryInfo.field}`;
      const _dir = queryInfo.order.substring(0, queryInfo.order.length - 3);
      setSorts({
        prop: _prop,
        dir: _dir,
      });
    }
  };

  /**
   * 设置 sumList
   * @param sumList string[]
   */
  const setSumList = (...sumList: string[]) => {
    const _sumList = hqlQueryDtoRef.hqlPageAndSortSumDto.sumList;
    _sumList?.splice(0, _sumList.length, ...sumList);
  };

  /**
   * @description 返回整个查询参数
   * @author jiaopi404
   * @date 23/11/2021
   * @return {*}  {HqlQueryDtoI} 返回体
   */
  const getHqlQueryDto = (): HqlQueryDtoI => {
    return unref(hqlQueryDtoRef);
  };

  return {
    resetHqlQueryDto,
    setPage,
    setPageByQueryInfo,
    appendQueryList,
    setQueryList,
    setSorts,
    setSumList,
    getHqlQueryDto,
    updateQueryItem,
    setSortByQueryInfo,
    appendQueryListByQueryInfoValuePlain,
  };
};

/**
 * hooks 方法
 * @param sqlQueryDto 初始查询参数
 * @returns 可用的 hook
 */
export const useSqlQueryDto = (sqlQueryDto: SqlQueryDtoI | undefined) => {
  let sqlQueryDtoRef: SqlQueryDtoI = deepMerge(cloneDeep(defaultSqlQueryDto), sqlQueryDto || {});

  const cacheInitSqlQueryDto = cloneDeep(sqlQueryDtoRef);

  /**
   * 重置为初始的查询参数
   */
  const resetSqlQueryDto = () => {
    sqlQueryDtoRef = cloneDeep(cacheInitSqlQueryDto);
  };

  /**
   * 设置分页参数
   * @param page MyPageI
   */
  const setPage = (page: MyPageI) => {
    sqlQueryDtoRef.sqlPageAndSortSumDto.page = page;
  };

  /**
   * @description 添加查询参数到 queryList
   * @author jiaopi404
   * @date 23/11/2021
   * @param {...MyQueryDtoI[]} queryItems
   */
  const appendQueryList = (...queryItems: MyQueryDtoI[]) => {
    sqlQueryDtoRef.sqlPageAndSortSumDto.queryList.push(...queryItems);
  };

  /**
   * 更新单个 queryItem 的方法
   * @param queryItem {Partial<MyQueryDtoI>};
   */
  const updateQueryItem = (queryItem: Partial<MyQueryDtoI>) => {
    const oldQueryItem = sqlQueryDtoRef.sqlPageAndSortSumDto.queryList.find(
      (_) => _.param === queryItem.param,
    );
    if (oldQueryItem) {
      oldQueryItem.type = queryItem.type ? queryItem.type : oldQueryItem.type;
      oldQueryItem.value = queryItem.value ? queryItem.value : oldQueryItem.value;
    }
  };

  /**
   * @description 重新设置查询参数 queryList
   * @author jiaopi404
   * @date 23/11/2021
   * @param {...MyQueryDtoI[]} queryItems
   */
  const setQueryList = (...queryItems: MyQueryDtoI[]) => {
    const _queryList = sqlQueryDtoRef.sqlPageAndSortSumDto.queryList;
    _queryList?.splice(0, _queryList.length, ...queryItems);
  };

  /**
   * @description 设置 sorts
   * @author jiaopi404
   * @date 23/11/2021
   * @param {...MySortI[]} sorts
   */
  const setSorts = (...sorts: MySortI[]) => {
    const _sorts = sqlQueryDtoRef.sqlPageAndSortSumDto.sorts;
    _sorts?.splice(0, _sorts.length, ...sorts);
  };

  /**
   * 设置 sumList
   * @param sumList string[]
   */
  const setSumList = (...sumList: string[]) => {
    const _sumList = sqlQueryDtoRef.sqlPageAndSortSumDto.sumList;
    _sumList?.splice(0, _sumList.length, ...sumList);
  };

  /**
   * @description 返回整个查询参数
   * @author jiaopi404
   * @date 23/11/2021
   * @return {*}  {HqlQueryDtoI} 返回体
   */
  const getSqlQueryDto = (): SqlQueryDtoI => {
    return unref(sqlQueryDtoRef);
  };

  return {
    resetSqlQueryDto,
    setPage,
    appendQueryList,
    setQueryList,
    setSorts,
    setSumList,
    getSqlQueryDto,
    updateQueryItem,
  };
};
