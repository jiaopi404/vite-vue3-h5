<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '上传附件',
              color: 'warning',
              onClick: clickHandlerUploadFile.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <UploadWaitCheckedFileDrawerVue
      @register="regDrawerUploadPurchaseFile"
      @save-success="reload"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { WaitCheckedSearchFormSchema, WaitCheckedTableColumns } from './waitChecked.data';
  import UploadWaitCheckedFileDrawerVue from './UploadWaitCheckedFileDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  export default defineComponent({
    components: { BasicTable, TableAction, UploadWaitCheckedFileDrawerVue },
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
            { param: 'bidSection.status.code', type: 'equal', value: [24] }, // 待验收
            { param: 'bidSection.project.BiddingUserId', type: 'equal', value: [userInfo.id] },
          ],
          dataFieldList: ['bidSection', 'bidSection.id'],
        },
      });
      const [registerTable, { reload }] = useTable({
        ...DEFAULT_TABLE_SETTING_GETTER('待验收列表', 100),
        // api: getBidSectionPage,
        api: getBidSectionPage,
        columns: WaitCheckedTableColumns(),
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
          schemas: WaitCheckedSearchFormSchema(),
          // placeHolder: '请输入菜单名称',
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
      });
      const [regDrawerUploadPurchaseFile, { openDrawer: openDrawerUploadPurchaseFile }] =
        useDrawer();
      function clickHandlerUploadFile(record: Recordable) {
        openDrawerUploadPurchaseFile(true, { id: record.bidSection.id });
      }
      return {
        registerTable,
        clickHandlerUploadFile,
        regDrawerUploadPurchaseFile,
        reload,
      };
    },
  });
</script>
