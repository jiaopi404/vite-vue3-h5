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
  import { proCompletedSearchFormSchema, proCompletedTableColumns } from './proCompleted.data';
  import { getProjectPage } from '/@/api/purchase/plan-purchase';
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
            { dir: 'desc', prop: 'project.updateDateTime' },
            { dir: 'desc', prop: 'project.id' },
          ],
          queryList: [
            { param: 'project.ifDelete', type: 'equal', value: [0] },
            { param: 'project.status.code', type: 'equal', value: [25] },
            { param: 'project.BiddingUserId', type: 'equal', value: [userInfo.id] },
          ],
          dataFieldList: ['project', 'project.id'],
        },
      });
      const [registerTable] = useTable({
        ...NO_ACTION_DEFAULT_TABLE_SETTING_GETTER('已完成列表'),
        // api: getBidSectionPage,
        api: getProjectPage,
        columns: proCompletedTableColumns(),
        rowKey: 'project_id',
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          setPageByQueryInfo(queryInfo);
          appendQueryListByQueryInfoValuePlain('project.proName', 'like', queryInfo.proName);
          appendQueryListByQueryInfoValuePlain(
            'project.purchaseNumber',
            'like',
            queryInfo.purchaseNumber,
          );
          appendQueryListByQueryInfoValuePlain(
            'project.projectType.id',
            'equal',
            queryInfo.purchaseType,
          );
          appendQueryListByQueryInfoValuePlain(
            'project.procurementMethod.id',
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
          schemas: proCompletedSearchFormSchema(),
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
