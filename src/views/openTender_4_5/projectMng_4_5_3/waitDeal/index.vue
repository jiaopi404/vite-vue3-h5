<template>
  <div>
    <!-- { label: '查看评审情况', onClick: clickViewReviewInfomation.bind(null, record), ifShow:
    !!record.bidSection.procurementMethod &&
    nodeOne.includes(record.bidSection.procurementMethod?.id), }, -->
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `确认评审信息`,
              onClick: clickConfirmReviewInfomation.bind(null, record),
              ifShow:
                !!record.bidSection.procurementMethod &&
                (nodeNull.includes(record.bidSection.procurementMethod?.id) ||
                  nodeOne.includes(record.bidSection.procurementMethod?.id)),
            },
            {
              label: '查看报价供应商',
              onClick: clickViewQuoteVendor.bind(null, record),
              ifShow: () => record.bidSection.procurementMethod?.node === '1',
            },
            {
              label: '设为已完成',
              color: 'success',
              onClick: clickSetWaitDeal.bind(null, record),
              ifShow:
                !!record.bidSection.procurementMethod &&
                purchaseType.includes(record.bidSection.procurementMethod.id),
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
    <AuditProcessDrawer @register="registerDrawer" :minHeight="100" />
    <ReviewInfoDrawer
      @register="registerInfoDrawer"
      @success="handleSuccess"
    ></ReviewInfoDrawer>
    <!-- 转交 Drawer -->
    <LxTransferDrawer @register="registerDrawerTransfer" :objectType="2" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { toRaw, nextTick, ref, onMounted, onBeforeMount, defineComponent } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { WaitReviewTableColumns, WaitReviewSearchFormSchema } from './waitDeal.data';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  import ReviewInfoDrawer from './confirmReviewInfoDawer.vue';
  import { updateBidSectionAndProjectStatus } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';
  import { useRouter } from 'vue-router';
  export default defineComponent({
    components: { ReviewInfoDrawer, AuditProcessDrawer, BasicTable, TableAction, LxTransferDrawer },
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
            // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
            { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
            { param: 'bidSection.status.code', type: 'equal', value: [20] }, // 待采购
            { param: 'bidSection.project.BiddingUserId', type: 'equal', value: [userInfo.id] },
          ],
          dataFieldList: ['bidSection', 'bidSection.id'],
        },
      });
      const [registerTable, { reload }] = useTable({
        ...DEFAULT_TABLE_SETTING_GETTER('待成交列表', 280),
        // api: getBidSectionPage,
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
            return await getBidSectionPage(params);
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        columns: WaitReviewTableColumns(),
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
            'bidSection.project.declareDept.id',
            'in',
            queryInfo.declareDept,
          );
          setSortByQueryInfo(queryInfo);
          return getHqlQueryDto();
        },
        afterFetch: (data) => {
          // data.forEach((item) => {
          //   item.ifPsInfo =
          //     !!item.bidSection.procurementMethod &&
          //     (nodeNull.value.includes(item.bidSection.procurementMethod?.id) ||
          //       nodeOne.value.includes(item.bidSection.procurementMethod?.id));
          //   item.ifPsQK =
          //     !!item.bidSection.procurementMethod &&
          //     nodeOne.value.includes(item.bidSection.procurementMethod?.id);
          // });
          return data;
        },
        formConfig: {
          labelWidth: 120,
          schemas: WaitReviewSearchFormSchema(),
          // placeHolder: '请输入菜单名称',
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
      });
      const { createMessage, createConfirmPromise } = useMessage();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerInfoDrawer, { openDrawer: openInfoDrawer }] = useDrawer();
      const [registerDrawerTransfer, { openDrawer: openDrawerTransfer }] = useDrawer();

      // 查看评审情况
      const clickViewReviewInfomation = async (record: Recordable) => {
        // const res = await getActRuTaskByProcessId(record.processId);
        console.log('查看评审情况', record);
      };
      const status: any = ref();
      const completed: any = ref();
      const purchaseType: any = ref([]);
      const configStore = useConfigStore();
      const nodeNull: any = ref([]);
      const nodeOne: any = ref([]);
      onMounted(async () => {
        const statusList = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.projectStatusId,
        );
        status.value = statusList;
        const purchaseTypeList = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
        );
        purchaseType.value = purchaseTypeList;
        const purchaseList: any[] = [];
        const nodeNullList: any[] = [];
        const nodeOneList: any[] = [];
        status.value.forEach((item: any) => {
          if (item.code === '21') {
            completed.value = item.id;
          }
        });
        purchaseType.value.forEach((item: any) => {
          if (item.node === '2') {
            purchaseList.push(item.id);
          }
          if (!item.node) {
            nodeNullList.push(item.id);
          }
          if (item.node === '1') {
            nodeOneList.push(item.id);
          }
        });
        nodeNull.value = nodeNullList;
        nodeOne.value = nodeOneList;
        purchaseType.value = purchaseList;
      });
      const clickConfirmReviewInfomation = async (record: Recordable) => {
        openInfoDrawer(true, {
          record,
        });
      };
      const handleSuccess = async () => {
        await reload();
      };
      /**
       * 设为已完成
       */
      const clickSetWaitDeal = async (record: Recordable) => {
        await createConfirmPromise({
          content: '确认设为已完成吗？',
        });
        await updateBidSectionAndProjectStatus(toRaw(record)?.bidSection?.id);
        createMessage.success('保存成功！');
        await reload();
      };
      // 转让
      function handleTransfer(record: Recordable) {
        openDrawerTransfer(true, {
          objectId: record.bidSection.project.id,
          biddingDepartmentId: record.bidSection.project.biddingDepartmentId,
        });
      }
      // 查看报价供应商
      const router = useRouter();
      function clickViewQuoteVendor(record: Recordable) {
        router.push({
          path: '/reportForm/reportBasicProjectInformation',
          query: {
            projectId: record.bidSection.project.id,
          },
        });
      }
      return {
        registerTable,
        clickConfirmReviewInfomation,
        nodeNull,
        nodeOne,
        clickViewReviewInfomation,
        clickSetWaitDeal,
        purchaseType,
        registerDrawer,
        registerInfoDrawer,
        handleSuccess,
        registerDrawerTransfer,
        handleTransfer,
        clickViewQuoteVendor,
        userInfo,
      };
    },
  });
</script>
