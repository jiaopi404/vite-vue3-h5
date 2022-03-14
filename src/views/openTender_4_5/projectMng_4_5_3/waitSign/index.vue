<template>
  <div>
    <BasicTable @register="registerTable"> </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { NO_ACTION_DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { WaitSignSearchFormSchema, WaitSignTableColumns } from './waitSign.data';
  export default defineComponent({
    components: { BasicTable, TableAction },
    setup() {
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
            { dir: 'desc', prop: 'bidSection.updateDateTime' },
            { dir: 'desc', prop: 'bidSection.id' },
          ],
          queryList: [
            { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
            { param: 'bidWinner.ifDelete', type: 'equal', value: [0] },
            { param: 'bidSection.status.code', type: 'equal', value: [22] }, // 待签订
            { param: 'bidSection.project.BiddingUserId', type: 'equal', value: [userInfo.id] },
          ],
          dataFieldList: ['bidSection', 'bidSection.id'],
        },
      });
      const [registerTable, { reload }] = useTable({
        ...NO_ACTION_DEFAULT_TABLE_SETTING_GETTER('待签收列表'),
        // api: getBidSectionPage,
        api: getBidSectionPage,
        columns: WaitSignTableColumns(),
        rowKey: 'bidSection_id',
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          setPageByQueryInfo(queryInfo);
          appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
          appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.projectType.id',
            'equal',
            queryInfo.purchaseType,
          );
          appendQueryListByQueryInfoValuePlain(
            'bidSection.procurementMethod.id',
            'equal',
            queryInfo.purchaseMethod,
          );
          setSortByQueryInfo(queryInfo);
          return getHqlQueryDto();
        },
        afterFetch: (data) => {
          return data;
        },
        formConfig: {
          labelWidth: 120,
          schemas: WaitSignSearchFormSchema(),
          // placeHolder: '请输入菜单名称',
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
      });
      return {
        registerTable,
      };
    },
  });
</script>
