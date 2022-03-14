<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <LxBasicExportBtn
          :disabled="!ifDisabled"
          :exportType="ExportTypeEnum.CONTRACT"
          :exportExcelDto="{
            fileName: '已签订合同',
            sheetName: '已签订合同',
            ifShowTotal: true,
            listDataColumn: [
              ExportColumnMap[ExportColumnKeyEnum.CONTRACT_NAME],
              ExportColumnMap[ExportColumnKeyEnum.CONTRACT_CODE],
              ExportColumnMap[ExportColumnKeyEnum.CONTRACT_CONAMOUNT],
              ExportColumnMap[ExportColumnKeyEnum.PROJECTTYPE_NAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PRONAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PRONUMBER],
              ExportColumnMap[ExportColumnKeyEnum.SUPPLIER_NAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNER_BIDWINNINGDATE],
              ExportColumnMap[ExportColumnKeyEnum.CONTRACT_COMPETENTDEPT],
              ExportColumnMap[ExportColumnKeyEnum.BIDWINNER_CHARGEUSER],
              ExportColumnMap[ExportColumnKeyEnum.CONTRACT_ADDDATETIME],
              ExportColumnMap[ExportColumnKeyEnum.CONTRACT_SIGNDATE],
            ],
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="getHqlQueryDto"
        />
      </template>
    </BasicTable>
  </div>
</template>

<script lang="ts" setup>
  import { BasicTable, useTable } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import { roleListTableSchema, roleSearchFormSchema } from './alreadySigned.data';
  import { getConContractPageByQueryDto } from '/@/api/contractManagement/signedApi';
  import { useUserStore } from '/@/store/modules/user';
  const userInfo = useUserStore().getUserInfo;
  const ifDisabled = ref<any>(null);
  // 获取授权部门
  const authorizeDepIds = <any>[];
  userInfo?.authorizeDepIds?.split(',').forEach((item) => {
    if (item) {
      authorizeDepIds.push(+item);
    }
  });
  const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'conContract.ifDelete', type: 'equal', value: [0] },
        { param: 'conContract.status.code', type: 'in', value: [5] },
        { param: 'bidWinner.ifDelete', type: 'equal', value: [0] },
        // 获取授权部门
        {
          param: 'conContract.competentDeptId',
          type: 'in',
          value: authorizeDepIds.length ? authorizeDepIds : [userInfo?.department?.id],
        },
      ],
      dataFieldList: ['conContract', 'conContract.id'],
      sorts: [
        { dir: 'desc', prop: 'conContract.updateDateTime' },
        { dir: 'desc', prop: 'conContract.id' },
      ],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '已签订列表',
    api: getConContractPageByQueryDto,
    columns: roleListTableSchema,
    formConfig: {
      labelWidth: 130,
      schemas: roleSearchFormSchema(),
      autoSubmitOnEnter: true,
    },
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      if (queryInfo.page && queryInfo.pageSize) {
        setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
      }
      if (queryInfo.proName) {
        appendQueryList({
          param: 'conContract.bidSection.proName',
          type: 'like',
          value: [queryInfo.proName],
        });
      }
      if (queryInfo.proNumber) {
        appendQueryList({
          param: 'conContract.bidSection.proNumber',
          type: 'like',
          value: [queryInfo.proNumber],
        });
      }
      if (queryInfo.name) {
        appendQueryList({
          param: 'conContract.name',
          type: 'like',
          value: [queryInfo.name],
        });
      }
      if (queryInfo.code) {
        appendQueryList({
          param: 'conContract.code',
          type: 'like',
          value: [queryInfo.code],
        });
      }
      if (queryInfo.contractDep) {
        appendQueryList({
          param: 'conContract.competentDeptId',
          type: 'equal',
          value: [queryInfo.contractDep],
        });
      }
      if (queryInfo.purchaseType) {
        appendQueryList({
          param: 'conContract.bidSection.project.projectType.id',
          type: 'equal',
          value: [queryInfo.purchaseType],
        });
      }
      if (queryInfo.conAmount && !!queryInfo.conAmount[0]) {
        appendQueryList({
          param: 'conContract.conAmount',
          type: 'ge',
          value: [queryInfo.conAmount[0]],
        });
      }
      if (queryInfo.conAmount && !!queryInfo.conAmount[1]) {
        appendQueryList({
          param: 'conContract.conAmount',
          type: 'le',
          value: [queryInfo.conAmount[1]],
        });
      }
      if (queryInfo.field == 'conContract.bidWinner.bidWinningDate') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: 'bidWinner.bidWinningDate',
          dir: queryInfo.order,
        });
      }
      if (queryInfo.field == 'conContract.addDateTime') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `${queryInfo.field}`,
          dir: queryInfo.order,
        });
      }
      if (queryInfo.field == 'conContract.signDate') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `${queryInfo.field}`,
          dir: queryInfo.order,
        });
      }
      // 合同金额排序
      if (queryInfo.field == 'conContract.conAmount') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `${queryInfo.field}`,
          dir: queryInfo.order,
        });
      }
      const queryDto = getHqlQueryDto();
      return queryDto;
    },
    afterFetch: (data) => {
      ifDisabled.value = data.length ? true : false;
    },
    useSearchForm: true,
    showTableSetting: true,
    tableSetting: {
      // 是否显示刷新按钮
      redo: true,
      // 是否显示尺寸调整按钮
      size: true,
      // 是否显示字段调整按钮
      setting: true,
      // 是否显示全屏按钮
      fullScreen: true,
    },
    bordered: true,
    showIndexColumn: true,
  });
</script>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  export default defineComponent({
    name: 'RoleManagement',
  });
</script>
