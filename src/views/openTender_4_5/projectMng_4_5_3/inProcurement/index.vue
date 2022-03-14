<template>
  <div>
    <BasicTable @register="registerTable" ref="refForm">
      <template #toolbar> </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '抽取',
              onClick: clickHandlerExtractCompany.bind(null, record),
              ifShow: () =>
                record.procurementMethod?.node === '1' && !ifCurrentUserBiddingCompanyUser,
            },
            {
              label: '作废',
              onClick: invalidate.bind(null, record),
              ifShow: () =>
                record.procurementMethod?.node === '1' && !ifCurrentUserBiddingCompanyUser,
            },
            {
              label: '查看报价供应商',
              onClick: clickViewQuoteVendor.bind(null, record),
              ifShow: () =>
                record.procurementMethod?.node === '1' && !ifCurrentUserBiddingCompanyUser,
            },
            {
              label: '发起评审',
              onClick: clickInitiateReview.bind(null, record),
              ifShow: () =>
                record.procurementMethod?.node === '1' && !ifCurrentUserBiddingCompanyUser,
            },
            {
              label: '录入报名供应商',
              onClick: clickEnterTheRegisteredSupplier.bind(null, record),
              ifShow: () => record.procurementMethod?.node !== '1',
            },
            {
              label: '设为待评审',
              onClick: clickSetToBeReviewed.bind(null, record),
              ifShow: () =>
                record.procurementMethod?.node !== '1' && !ifCurrentUserBiddingCompanyUser,
            },
            {
              label: '转交',
              onClick: handleTransfer.bind(null, record),
              ifShow: (_action) => {
                return !ifCurrentUserBiddingCompanyUser; // 根据业务控制是否显示: 非enable状态的不显示启用按钮
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <InformationEntry @register="registerDrawer" @success="handleSuccess" />
    <ExtractExpertDrawer @register="registerDrawerExtractExpert" />
    <DoReviewWithPostponeDrawerVue @register="registerDrawerDoReview" @refresh-list="reload" />
    <!-- 转交 Drawer -->
    <LxTransferDrawer @register="registerDrawerTransfer" :objectType="2" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 引入抽屉
  import InformationEntry from './components/InformationEntry.vue';
  // 配置数据
  import { columns, searchFormSchema } from './inProcurement.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { saveBidSection } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { useUserStore } from '/@/store/modules/user';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import ExtractExpertDrawer from './ExtractExpertDrawer.vue';
  import DoReviewWithPostponeDrawerVue from './DoReviewWithPostponeDrawer.vue';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';
  import { getReviewNodeByProjectNode } from '/@/api/review-node/proReviewNode';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';
  import { invalidateReviewNode } from '/@/views/purchaseDeclare_4_4/pendingProject_4_4_5/toProcessed/components/reviewNode.mixin';

  export default defineComponent({
    name: 'inProcurement',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
      InformationEntry,
      ExtractExpertDrawer,
      DoReviewWithPostponeDrawerVue,
      LxTransferDrawer,
    },
    setup() {
      const status: any = ref();
      const waitDealStatus: any = ref();
      const Status: any = ref();
      const purchaseType: any = ref();
      const configStore = useConfigStore();
      const router = useRouter();
      const userInfo = useUserStore().getUserInfo;
      const { createMessage, createConfirmPromise } = useMessage();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerDrawerExtractExpert, { openDrawer: openDrawerExtractExpert }] = useDrawer();
      const [registerDrawerDoReview, { openDrawer: openDrawerDoReview }] = useDrawer();
      const [registerDrawerTransfer, { openDrawer: openDrawerTransfer }] = useDrawer();

      // 是否是招标公司用户
      const ifCurrentUserBiddingCompanyUser = computed(() => {
        return userInfo.role === 5;
      });

      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            sorts: [
              { dir: 'desc', prop: 'bidSection.updateDateTime' },
              { dir: 'desc', prop: 'bidSection.id' },
            ],
            queryList: [
              { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
              { param: 'bidSection.status.code', type: 'in', value: [18] }, // 待采购
              // { param: 'bidSection.project.BiddingUserId', type: 'equal', value: [userInfo.id] },
              {
                param: '',
                type: 'or',
                value: [
                  orParamsFormatter(
                    '((bidSection.procurementMethod.node=1 AND CURRENT_TIMESTAMP ()>=bidSection.project.quoteEndTime) OR (bidSection.procurementMethod.node IS NULL AND CURRENT_TIMESTAMP ()>=bidSection.quoteEndTime))',
                  ),
                ],
              },
            ],
            dataFieldList: ['bidSection', 'bidSection.id'],
          },
        });
      // 请求之前对参数进行处理
      const beforeFetch = (queryInfo: any) => {
        console.log('queryInfo', queryInfo);
        resetHqlQueryDto(); // 先重置
        if (queryInfo.page && queryInfo.pageSize) {
          setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
        }
        // 当前人
        // 是否是招标公司用户
        if (ifCurrentUserBiddingCompanyUser.value) {
          // 招标公司
          appendQueryList({
            param: 'bidSection.biddingCompany.user.id',
            type: 'equal',
            value: [userInfo.id],
          });
        } else {
          // 组织处理人
          appendQueryList({
            param: 'bidSection.project.BiddingUserId',
            type: 'equal',
            value: [userInfo.id],
          });
        }
        if (queryInfo.proName) {
          appendQueryList({
            param: 'bidSection.proName',
            type: 'like',
            value: [queryInfo.proName],
          });
        }
        if (queryInfo.projectType) {
          appendQueryList({
            param: 'bidSection.project.projectType.id',
            type: 'equal',
            value: [queryInfo.projectType],
          });
        }
        if (queryInfo.proNumber) {
          appendQueryList({
            param: 'bidSection.proNumber',
            type: 'like',
            value: [queryInfo.proNumber],
          });
        }
        if (queryInfo.declareDept) {
          appendQueryList({
            param: 'bidSection.project.declareDept.id',
            type: 'in',
            value: [queryInfo.declareDept],
          });
        }
        if (queryInfo.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        const queryDto: any = getHqlQueryDto();
        if (queryDto.hqlPageAndSortSumDto.sumList) {
          delete queryDto.hqlPageAndSortSumDto.sumList;
        }
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.bidSection);
      };
      const [registerTable, { reload }] = useTable({
        ...DEFAULT_TABLE_SETTING_GETTER(
          '采购中列表',
          ifCurrentUserBiddingCompanyUser.value ? 170 : 350,
        ),
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
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'id',
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
          autoSubmitOnEnter: true,
        },
      });
      //初始化获取字典
      onMounted(async () => {
        await getProjectStatus();
        status.value.forEach((item: any) => {
          if (item.code === '19') {
            waitDealStatus.value = item.id;
          }
          if (item.code === '20') {
            Status.value = item.id;
          }
        });
      });
      const getProjectStatus = async () => {
        const statusList = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.projectStatusId,
        );
        console.log(statusList, 'statusList');
        status.value = statusList;
        const purchaseTypeList = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
        );
        purchaseType.value = purchaseTypeList;
        console.log(purchaseTypeList, 'purchaseTypeList');
      };
      // 抽取
      const clickHandlerExtractCompany = (record) => {
        openDrawerExtractExpert(true, { id: record.id });
      };
      // 查看报价供应商
      function clickViewQuoteVendor(record: Recordable) {
        // router.push({
        //   path: '/reportForm/reportBasicProjectInformation',
        //   query: {
        //     projectId: record.project.id,
        //   },
        // });
        router.push({
          path: '/reportForm/reportProjectBidsection',
          query: { bidSectionId: record.id },
        });
      }
      // 录入报名供应商
      function clickEnterTheRegisteredSupplier(record: Recordable) {
        router.push({ path: '/proMng/enterTheRegisteredSupplier', query: { id: record.id } });
      }
      // 发起评审
      async function clickInitiateReview(record: Recordable) {
        const reviewNode = await getReviewNodeByProjectNode({
          objectId: record.id,
          objectName: 'pro_bidSection',
          node: 3,
        });
        if (reviewNode && reviewNode.ifReview && reviewNode.statusId !== 3) {
          // 说明抽取结点未完成
          await createConfirmPromise({
            content: '抽取未完成，确定继续？',
          });
        }
        openDrawerDoReview(true, {
          id: record.id,
          proReviewNodeId: reviewNode?.id ?? null,
          scene: 1,
          proReviewNode: reviewNode,
        });
      }
      //设为待评审
      async function clickSetToBeReviewed(record: Recordable) {
        console.log(record, 'values');
        let values = {
          id: record?.id,
          status: {
            id: Status.value,
          },
          ifGenerateAuditRecord: 1,
        };
        if (record.ifHaveEligibleRegisteredSupplier) {
          openDrawer(true, {
            record,
            waitDealStatus,
          });
        } else {
          await createConfirmPromise({
            content: '该项目无有效报名，确认设为待成交吗？',
          });
          await saveBidSection(values);
          createMessage.success('保存成功！');
          await reload();
        }
      }
      // 转让
      function handleTransfer(record: Recordable) {
        console.log(record, 'record');
        openDrawerTransfer(true, {
          objectId: record.project.id,
          biddingDepartmentId: record.project.biddingDepartmentId,
        });
      }
      const invalidate = async (record: any) => {
        const ifAborted = await invalidateReviewNode(null, {
          objectId: record.id,
          objectName: 'pro_bidSection',
          node: 3,
        });
        if (ifAborted) {
          reload();
        }
      };
      function handleSuccess() {
        reload();
      }
      return {
        registerTable,
        registerDrawer,
        clickHandlerExtractCompany,
        clickViewQuoteVendor,
        clickInitiateReview,
        clickEnterTheRegisteredSupplier,
        clickSetToBeReviewed,
        handleSuccess,
        registerDrawerExtractExpert,
        openDrawerExtractExpert,
        registerDrawerDoReview,
        openDrawerDoReview,
        reload,
        ifCurrentUserBiddingCompanyUser,
        registerDrawerTransfer,
        handleTransfer,
        invalidate,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 12vw);
  }
</style>
