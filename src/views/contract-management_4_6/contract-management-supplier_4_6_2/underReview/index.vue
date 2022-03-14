<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `查看审核流`,
              onClick: clickViewAuditFlow.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <AuditProcessDrawer
      @register="registerDrawer"
      :minHeight="100"
      :ifTodoTask="false"
      @success="handleSuccess"
    />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getConContractPageByQueryDto } from '/@/api/contractManagement/waitImprove';
  import { UnderReviewSearchFormSchema, UnderReviewTableColumns } from './underReview.data';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { getActRuTaskByProcessId } from '/@/api/auditMangement/auditMangement';
  import { useDrawer } from '/@/components/Drawer';

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
        { param: 'conContract.status.code', type: 'equal', value: [3] }, // 待采购
        { param: 'conContract.chargeUser.id', type: 'equal', value: [userInfo.id] },
      ],
      dataFieldList: ['conContract', 'conContract.id'],
    },
  });
  const [registerDrawer, { openDrawer }] = useDrawer();

  // getBidSectionPage
  const [registerTable, { reload }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER('审核中列表', 110),
    api: getConContractPageByQueryDto,
    columns: UnderReviewTableColumns(),
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
      schemas: UnderReviewSearchFormSchema(),
      // placeHolder: '请输入菜单名称',
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
  });
  async function clickViewAuditFlow(record: Recordable) {
    const res = await getActRuTaskByProcessId(record.conContract.processId);
    // const res = await getActRuTaskByProcessId('9af675fb-6233-11ec-98d5-52540034b5e6');
    openDrawer(true, {
      ID_: res.data.ID_ ? res.data.ID_ : '',
      PROC_INST_ID_: res.data.PROC_INST_ID_ ? res.data.PROC_INST_ID_ : '',
      FILENAME: res.data.DGRM_RESOURCE_NAME_ ? res.data.DGRM_RESOURCE_NAME_ : '',
    });
  }
  async function handleSuccess() {
    await reload();
  }
</script>
