<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <LxBasicExportBtn
        :disabled="disabled"
        :exportType="ExportTypeEnum.PROJECT"
        :exportExcelDto="{
          fileName: '待采购项目',
          sheetName: '待采购项目',
          ifShowTotal: false,
          listDataColumn: [
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_PRO_NAME],
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_BUDGET_AMOUNT],
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_STATUS],
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_TYPE],
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_PROCUREMENT_METHOD],
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_ORGANIZATIONAL_FORM],
            ExportColumnMap[ExportColumnKeyEnum.PLAN_PURCHASE_TIME],
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_DECLARE_DEPT],
            ExportColumnMap[ExportColumnKeyEnum.PROJECT_CHARGE_USER],
            ExportColumnMap[ExportColumnKeyEnum.ADD_DATE_TIME],
          ],
        }"
        :reloadTableFn="reload"
        :getHqlQueryDtoFn="
          () => {
            const dto = getHqlQueryDto();
            return dto;
          }
        "
      />
    </template>
  </BasicTable>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { purchasedSearchFormSchema, purchasedTableScheam } from './purchased.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import {
    getProjectPageByQueryDto,
    getDepartmentStringById,
  } from '/@/api/archivesAdministration/projectArchives';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';

  export default defineComponent({
    name: 'toBePurchasedList',
    components: {
      BasicTable,
      TableAction,
      LxBasicExportBtn,
      ExportColumnKeyEnum,
      ExportColumnMap,
      ExportTypeEnum,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      // 获取授权部门
      const authorizeDepIds = <any>[];
      userInfo?.authorizeDepIds?.split(',').forEach((item) => {
        if (item) {
          authorizeDepIds.push(+item);
        }
      });
      let disabled = ref(false);
      // 查询参数初始化
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            sorts: [
              { dir: 'desc', prop: 'project.updateDateTime' },
              { dir: 'desc', prop: 'project.id' },
            ],
            queryList: [
              { param: 'project.ifDelete', type: 'equal', value: [0] },
              {
                param: 'project.status.code',
                type: 'in',
                value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
              },
              // 获取授权部门
              {
                param: 'project.declareDept.id',
                type: 'in',
                value: authorizeDepIds.length ? authorizeDepIds : [userInfo?.department?.id],
              },
            ],
            dataFieldList: ['project', 'project.id'],
          },
        });
      const [registerTable, { reload }] = useTable({
        title: '待采购列表',
        api: async (params) => {
          try {
            const queryItem = params.hqlPageAndSortSumDto.queryList.find(
              (item) => item.param === 'project.declareDept',
            );
            if (queryItem) {
              let res = await getDepartmentStringById(queryItem.value[0]);
              let msg = res.msg;
              queryItem.value[0] = msg;
            }
            return await getProjectPageByQueryDto(params);
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        columns: purchasedTableScheam(),
        rowKey: 'id',
        formConfig: {
          labelWidth: 120,
          schemas: purchasedSearchFormSchema(),
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        showTableSetting: true,
        // 查询参数设置
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          if (queryInfo.page && queryInfo.pageSize) {
            setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
          }
          // 项目名称
          if (!!queryInfo.proName) {
            appendQueryList({
              param: 'project.proName',
              type: 'like',
              value: [queryInfo.proName],
            });
          }
          // 申报部门
          if (queryInfo.declareDept) {
            appendQueryList({
              param: 'project.declareDept',
              type: 'in',
              value: [queryInfo.declareDept],
            });
          }
          // 采购类型
          if (queryInfo.projectType) {
            appendQueryList({
              param: 'project.projectType.code',
              type: 'equal',
              value: [queryInfo.projectType],
            });
          }
          // 预算金额
          if (queryInfo.budgetAmount && !!queryInfo.budgetAmount[0]) {
            appendQueryList({
              param: 'project.budgetAmount',
              type: 'ge',
              value: [queryInfo.budgetAmount[0]],
            });
          }
          if (queryInfo.budgetAmount && !!queryInfo.budgetAmount[1]) {
            appendQueryList({
              param: 'project.budgetAmount',
              type: 'le',
              value: [queryInfo.budgetAmount[1]],
            });
          }
          // 项目状态
          if (queryInfo.status) {
            appendQueryList({
              param: 'project.status.code',
              type: 'equal',
              value: [queryInfo.status],
            });
          }
          // 计划采购时间
          if (queryInfo.field == 'planPurchaseTime') {
            queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
            setSorts({
              prop: queryInfo.field,
              dir: queryInfo.order,
            });
          }
          if (queryInfo.planPurchaseTime && queryInfo.planPurchaseTime.length > 0) {
            queryInfo.planPurchaseTime[0] =
              queryInfo.planPurchaseTime[0].slice(0, 10) + ' ' + '00:00:00';
            queryInfo.planPurchaseTime[1] =
              queryInfo.planPurchaseTime[1].slice(0, 10) + ' ' + '23:59:59';
            appendQueryList({
              param: 'project.planPurchaseTime',
              type: 'ge',
              value: [queryInfo.planPurchaseTime[0]],
            });
            appendQueryList({
              param: 'project.planPurchaseTime',
              type: 'le',
              value: [queryInfo.planPurchaseTime[1]],
            });
          }
          // 添加日期排序
          if (queryInfo.field == 'addDateTime') {
            queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
            setSorts({
              prop: 'project.addDateTime',
              dir: queryInfo.order,
            });
          }
          const queryDto: any = getHqlQueryDto();
          if (queryDto.hqlPageAndSortSumDto.sumList) {
            delete queryDto.hqlPageAndSortSumDto.sumList;
          }
          return queryDto;
        },

        afterFetch: (data) => {
          const tableData: any[] = [];
          data.forEach((item) => {
            tableData.push(item.project);
          });
          disabled.value = tableData.length === 0 ? true : false;
          return tableData;
        },
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

      return {
        disabled,
        reload,
        getHqlQueryDto,
        registerTable,
        ExportColumnKeyEnum,
        ExportColumnMap,
        ExportTypeEnum,
      };
    },
  });
</script>
