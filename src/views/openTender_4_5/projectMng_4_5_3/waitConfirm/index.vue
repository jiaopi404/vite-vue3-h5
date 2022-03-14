<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `变更供应商`,
              onClick: clickChangeSupplier.bind(null, record),
            },
            {
              label: `生成合同`,
              onClick: clickContract.bind(null, record),
            },
            {
              label: '转交',
              onClick: handleTransfer.bind(null, record),
              ifShow: () => {
                const role: any = userInfo.role
                if ([1,5].includes(role)) {
                  return false;
                } else {
                  return true;
                }
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <ChangeBidSupplierDrawer
      @register="registerSupplierDrawer"
      @success="handleSupplierSuccess"
      width="30%"
    ></ChangeBidSupplierDrawer>
    <BidContractDrawer
      @register="registerContractDrawer"
      @success="handleContractSuccess"
      width="30%"
    ></BidContractDrawer>
    <!-- 转交 Drawer -->
    <LxTransferDrawer @register="registerDrawerTransfer" :objectType="2" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { getCompetentDept, getDictionaryByParentId } from '/@/api/demo/system';
  import { WaitConfirmSearchFormSchema, WaitConfirmTableColumns } from './waitConfirm.data';
  import BidContractDrawer from './bidContract.vue';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';
  import ChangeBidSupplierDrawer from './changeBidSupplier.vue';
  import { useDrawer } from '/@/components/Drawer';
  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      BidContractDrawer,
      ChangeBidSupplierDrawer,
      LxTransferDrawer,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      const [registerSupplierDrawer, { openDrawer: openSupplierDrawer }] = useDrawer();
      const [registerContractDrawer, { openDrawer: openContractDrawer }] = useDrawer();
      const [registerDrawerTransfer, { openDrawer: openDrawerTransfer }] = useDrawer();
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
            { param: 'bidSection.status.code', type: 'equal', value: [21] }, // 待交付
            { param: 'bidSection.project.BiddingUserId', type: 'equal', value: [userInfo.id] },
          ],
          dataFieldList: ['bidSection', 'bidSection.id'],
        },
      });
      const [registerTable, { reload }] = useTable({
        ...DEFAULT_TABLE_SETTING_GETTER('待确认列表', 280),
        // api: getBidSectionPage,
        api: getBidSectionPage,
        columns: WaitConfirmTableColumns(),
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
            'in',
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
          schemas: WaitConfirmSearchFormSchema(),
          // placeHolder: '请输入菜单名称',
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
      });
      const status = ref();
      const depAndUser = ref();
      const configStore = useConfigStore();
      onMounted(async () => {
        const statusList = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.projectStatusId,
        );
        statusList.forEach((item: any) => {
          if (item.code === '24') {
            status.value = item.id;
          }
        });
        const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
        depAndUser.value = await getCompetentDept(orgId);
      });
      // const { createMessage, createConfirmPromise } = useMessage();
      async function clickChangeSupplier(record: Recordable) {
        openSupplierDrawer(true, {
          record,
        });
      }
      async function clickContract(record: Recordable) {
        const depUser = depAndUser.value;
        openContractDrawer(true, {
          record,
          depUser,
        });
      }
      async function handleSupplierSuccess(record: Recordable) {
        await reload();
      }
      async function handleContractSuccess(record: Recordable) {
        await reload();
      }
      // 转让
      function handleTransfer(record: Recordable) {
        console.log(record, 'record');
        openDrawerTransfer(true, {
          objectId: record.bidSection.project.id,
          biddingDepartmentId: record.bidSection.project.biddingDepartmentId,
        });
      }
      function handleSuccess() {
        reload();
      }
      return {
        registerTable,
        clickChangeSupplier,
        clickContract,
        registerSupplierDrawer,
        registerContractDrawer,
        handleSupplierSuccess,
        handleContractSuccess,
        registerDrawerTransfer,
        handleTransfer,
        handleSuccess,
        userInfo,
      };
    },
  });
</script>
