<template>
  <div>
    <BasicTable @register="registerTable"> </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { columns, searchFormSchema, pageAndSort } from './completed.data';
  import {
    getBidSectionAndBidWinnerPageByQueryDto,
    getBiddingCompanyByUserId,
    // copyPurchaseToBidwinningList,
  } from '/@/api/purchase/supplierApi';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'completed',
    components: {
      BasicTable,
      TableAction,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSorts,
        getHqlQueryDto,
      } = useHqlQueryDto(pageAndSort());
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );
        appendQueryListByQueryInfoValuePlain(
          'bidSection.procurementMethod.id',
          'equal',
          queryInfo.procurementMethod,
        );
        const resData = await getBiddingCompanyByUserId(userInfo.id);
        appendQueryListByQueryInfoValuePlain(
          'bidWinner.successfulSupplierId',
          'equal',
          resData?.id,
        );

        if (queryInfo.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'bidWinningDate') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidWinner.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'deliveryTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'completeDate') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      const afterFetch = (data) => {
        return data;
      };

      const [registerTable] = useTable({
        title: '已完成列表',
        api: getBidSectionAndBidWinnerPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: (record) => record.bidSection.id,
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
          autoSubmitOnEnter: true,
        },
        showTableSetting: true, // 显示表格设置工具
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
        registerTable,
      };
    },
  });
</script>
