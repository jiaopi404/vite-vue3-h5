<template>
  <div>
    <BasicTable @register="registerTable"> </BasicTable>
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { NO_ACTION_DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getConContractPageByQueryDto } from '/@/api/contractManagement/waitImprove';
  import {
    AlreadyImproveSearchFormSchema,
    AlreadyImproveTableColumns,
  } from './alreadyImprove.data';
  const userInfo = useUserStore().getUserInfo;
  const {
    getHqlQueryDto,
    resetHqlQueryDto,
    setPageByQueryInfo,
    appendQueryListByQueryInfoValuePlain,
    setSortByQueryInfo,
  } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      page: { pageNum: 1, pageSize: 10 },
      sorts: [
        { dir: 'desc', prop: 'conContract.updateDateTime' },
        { dir: 'desc', prop: 'conContract.id' },
      ],
      queryList: [
        // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
        { param: 'conContract.ifDelete', type: 'equal', value: [0] },
        { param: 'conContract.bidSection.ifDelete', type: 'equal', value: [0] },
        { param: 'bidWinner.ifDelete', type: 'equal', value: [0] },
        { param: 'conContract.status.code', type: 'in', value: [2, 3, 4, 5] }, // 待采购
        { param: 'conContract.successfulSupplier.user.id', type: 'equal', value: [userInfo.id] },
      ],
      dataFieldList: ['conContract', 'conContract.id'],
    },
  });
  // getBidSectionPage
  const [registerTable, { reload }] = useTable({
    ...NO_ACTION_DEFAULT_TABLE_SETTING_GETTER('已完善列表'),
    api: getConContractPageByQueryDto,
    columns: AlreadyImproveTableColumns(),
    rowKey: 'conContract_id',
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      setPageByQueryInfo(queryInfo);
      appendQueryListByQueryInfoValuePlain('conContract.name', 'like', queryInfo.name);
      appendQueryListByQueryInfoValuePlain('conContract.code', 'like', queryInfo.code);
      // 项目
      appendQueryListByQueryInfoValuePlain(
        'conContract.bidSection.proName',
        'like',
        queryInfo.proName,
      );
      appendQueryListByQueryInfoValuePlain(
        'conContract.bidSection.proNumber',
        'like',
        queryInfo.proNumber,
      );
      appendQueryListByQueryInfoValuePlain(
        'conContract.bidSection.project.projectType.id',
        'equal',
        queryInfo.purchaseType,
      );
      // 发布日期
      if (queryInfo.bidWinningDate) {
        appendQueryListByQueryInfoValuePlain(
          'bidWinner.bidWinningDate',
          'ge',
          `${queryInfo.bidWinningDate[0]} 00:00:00`,
        );
        appendQueryListByQueryInfoValuePlain(
          'bidWinner.bidWinningDate',
          'le',
          `${queryInfo.bidWinningDate[1]} 23:59:59`,
        );
      }
      setSortByQueryInfo(queryInfo);
      return getHqlQueryDto();
    },
    afterFetch: (data) => {
      return data;
    },
    formConfig: {
      labelWidth: 120,
      schemas: AlreadyImproveSearchFormSchema(),
      // placeHolder: '请输入菜单名称',
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
  });
</script>
