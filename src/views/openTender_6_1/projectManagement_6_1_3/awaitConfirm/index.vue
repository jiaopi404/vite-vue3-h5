<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- <template #toolbar>
        <a-button @click="handleEditor">fun</a-button>
      </template> -->
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '完善中标信息',
              color: 'success',
              onClick: handleEditor.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 待确认(项目管理)
   * awaitConfirm
   * openTender_6_1/projectManagement_6_1_3/awaitConfirm/index.vue
   */
  import { defineComponent } from 'vue';
  import { useRouter } from 'vue-router';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { columns, searchFormSchema, pageAndSort } from './awaitConfirm.data';
  import {
    getBidSectionAndBidWinnerPageByQueryDto,
    getBiddingCompanyByUserId,
    // copyPurchaseToBidwinningList,
  } from '/@/api/purchase/supplierApi';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
    },
    setup() {
      const router = useRouter();
      const userInfo = useUserStore().getUserInfo;
      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSortByQueryInfo,
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
        // 中标日期
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

        const resData = await getBiddingCompanyByUserId(userInfo.id);
        appendQueryListByQueryInfoValuePlain(
          'bidWinner.successfulSupplierId',
          'equal',
          resData?.id,
        );

        setSortByQueryInfo(queryInfo, 'bidSection');
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      const afterFetch = (data) => {
        return data;
      };

      const [registerTable, { reload }] = useTable({
        title: '待确认列表',
        api: getBidSectionAndBidWinnerPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: (record) => record.bidSection.id,
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
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
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 120,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      // 完善中标信息
      const handleEditor = async (record: any) => {
        // if (!record.bidSection.status.node) {
        //   const _data = {
        //     userId: userInfo.id,
        //     bidSectionId: record.bidSection.id,
        //     projectId: record.bidSection.project.id,
        //   };
        //   await copyPurchaseToBidwinningList(_data);
        // }

        router.push({
          path: '/supplier/completeListing',
          query: {
            bidSectionId: record.bidSection.id,
            projectId: record.bidSection.project.id,
            bidWinningAmount: record.bidWinner.bidWinningAmount,
          },
        });
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerTable,
        handleEditor,
        handleSuccess,
      };
    },
  });
</script>
