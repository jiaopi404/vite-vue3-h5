<template>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <LxBasicExportBtn
        :disabled="disabled"
        :exportType="ExportTypeEnum.BIDSECTION"
        :exportExcelDto="{
          fileName: '待验收项目',
          sheetName: '待验收项目',
          ifShowTotal: false,
          listDataColumn: [
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PRO_NAME],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PRO_NUMBER],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_BUDGET_AMOUNT],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_STATUS_NAME],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PROJECT_TYPE],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PROCUREMENT_METHOD],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_ORGANIZATIONAL_FORM],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_DECLARE_DEPARTMENT],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PROCHARGE_USER],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_PLAN_PURCHASE_TIME],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_ADDDATETIME],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_BIDDING_COMPANY],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_WINNING_AMOUNT],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_BIDWINNING_DATE],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_QUOTEENDTIME],
            ExportColumnMap[ExportColumnKeyEnum.BIDSECTION_DELIVERY_TIME],
          ],
        }"
        :reloadTableFn="reload"
        :getHqlQueryDtoFn="
          () => {
            const dto = getHqlQueryDto();
            dto.hqlPageAndSortSumDto.dataFieldList = [
              'bidSection',
              'user',
              'bidWinner',
              'biddingCompany',
            ];
            return dto;
          }
        "
      />
    </template>
  </BasicTable>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { acceptedSearchFormSchema, acceptedTableScheam } from './accepted.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { NO_ACTION_DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { useUserStore } from '/@/store/modules/user';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import {
    getBidSectionPageByQueryDto,
    getDepartmentStringById,
  } from '/@/api/archivesAdministration/projectArchives';

  export default defineComponent({
    name: 'toBeAcceptedList',
    components: {
      BasicTable,
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
      const {
        appendQueryList,
        getHqlQueryDto,
        appendQueryListByQueryInfoValuePlain,
        resetHqlQueryDto,
        setPageByQueryInfo,
        setSorts,
      } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          page: { pageNum: 1, pageSize: 10 },
          sorts: [
            { dir: 'desc', prop: 'bidSection.id' },
            { dir: 'desc', prop: 'bidSection.updateDateTime' },
          ],
          queryList: [
            { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
            { param: 'bidSection.status.code', type: 'in', value: [22, 23, 24] },
            // 获取授权部门
            {
              param: 'bidSection.project.declareDept.id',
              type: 'in',
              value: authorizeDepIds.length ? authorizeDepIds : [userInfo?.department?.id],
            },
          ],
          dataFieldList: ['bidSection', 'bidWinner'],
        },
      });
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        // 项目名称
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.proName',
          'like',
          queryInfo.proName,
        );
        // 项目编号
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.purchaseNumber',
          'like',
          queryInfo.proNumber,
        );
        // 申报部门
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.declareDept.id',
          'in',
          queryInfo.declareDept,
        );
        // 采购类型
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.projectType.code',
          'equal',
          queryInfo.projectType,
        );
        // 项目状态
        appendQueryListByQueryInfoValuePlain('bidSection.status.code', 'in', queryInfo.status);
        // 预算金额
        if (queryInfo.budgetAmount && !!queryInfo.budgetAmount[0]) {
          appendQueryList({
            param: 'bidSection.budgetAmount',
            type: 'ge',
            value: [queryInfo.budgetAmount[0]],
          });
        }
        if (queryInfo.budgetAmount && !!queryInfo.budgetAmount[1]) {
          appendQueryList({
            param: 'bidSection.budgetAmount',
            type: 'le',
            value: [queryInfo.budgetAmount[1]],
          });
        }
        // 中标金额
        if (queryInfo.bidWinningAmount && !!queryInfo.bidWinningAmount[0]) {
          appendQueryList({
            param: 'bidSection.bidWinningAmount',
            type: 'ge',
            value: [queryInfo.bidWinningAmount[0]],
          });
        }
        if (queryInfo.bidWinningAmount && !!queryInfo.bidWinningAmount[1]) {
          appendQueryList({
            param: 'bidSection.bidWinningAmount',
            type: 'le',
            value: [queryInfo.bidWinningAmount[1]],
          });
        }
        // 计划采购时间
        if (queryInfo.planPurchaseTime && queryInfo.planPurchaseTime.length > 0) {
          queryInfo.planPurchaseTime[0] =
            queryInfo.planPurchaseTime[0].slice(0, 10) + ' ' + '00:00:00';
          queryInfo.planPurchaseTime[1] =
            queryInfo.planPurchaseTime[1].slice(0, 10) + ' ' + '23:59:59';
          appendQueryList({
            param: 'bidSection.project.planPurchaseTime',
            type: 'ge',
            value: [queryInfo.planPurchaseTime[0]],
          });
          appendQueryList({
            param: 'bidSection.project.planPurchaseTime',
            type: 'le',
            value: [queryInfo.planPurchaseTime[1]],
          });
        }
        // 中标金额排序
        if (queryInfo.field == 'bidWinningAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: 'bidSection.bidWinningAmount',
            dir: queryInfo.order,
          });
        }
        // 预算金额排序
        if (queryInfo.field == 'budgetAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: 'bidSection.budgetAmount',
            dir: queryInfo.order,
          });
        }
        // 计划采购时间排序
        if (queryInfo.field == 'project.planPurchaseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: 'bidSection.project.planPurchaseTime',
            dir: queryInfo.order,
          });
        }
        // 中标日期排序
        if (queryInfo.field == 'bidWinningDate') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: 'bidWinner.bidWinningDate',
            dir: queryInfo.order,
          });
        }
        // 添加日期排序
        if (queryInfo.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: 'bidSection.addDateTime',
            dir: queryInfo.order,
          });
        }
        // 开标时间排序
        if (queryInfo.field == 'quoteEndTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: 'bidSection.quoteEndTime',
            dir: queryInfo.order,
          });
        }
        // 交付日期排序
        if (queryInfo.field == 'deliveryTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: queryInfo.field,
            dir: queryInfo.order,
          });
        }
        const queryDto: any = getHqlQueryDto();
        if (queryDto.hqlPageAndSortSumDto.sumList) {
          delete queryDto.hqlPageAndSortSumDto.sumList;
        }
        return queryDto;
      };
      const [registerTable, { reload }] = useTable({
        ...NO_ACTION_DEFAULT_TABLE_SETTING_GETTER('待验收列表', true),
        api: async (params) => {
          try {
            const queryItem = params.hqlPageAndSortSumDto.queryList.find(
              (item) => item.param === 'bidSection.project.declareDept.id',
            );
            if (queryItem) {
              let res = await getDepartmentStringById(queryItem.value[0]);
              let msg = res.msg;
              queryItem.value[0] = msg;
            }
            const result = await getBidSectionPageByQueryDto(params);
            console.log('result: ', result.data.page.content.length);
            disabled.value = result.data.page.content.length === 0 ? true : false;
            return result;
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        beforeFetch,
        afterFetch: (data) => {
          return data.map((item) => item.bidSection);
        },
        columns: acceptedTableScheam(),
        rowKey: 'id',
        formConfig: {
          labelWidth: 120,
          schemas: acceptedSearchFormSchema(),
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        fetchSetting: {
          //   The field name of the current page passed to the background
          pageField: 'page',
          //   The number field name of each page displayed in the background
          sizeField: 'pageSize',
          //   Field name of the form data returned by the interface
          listField: 'data.page.content',
          //   Total number of tables returned by the interface field name
          totalField: 'data.page.totalElements',
        },
      });

      return {
        disabled,
        registerTable,
        reload,
        getHqlQueryDto,
        ExportColumnKeyEnum,
        ExportColumnMap,
        ExportTypeEnum,
      };
    },
  });
</script>
