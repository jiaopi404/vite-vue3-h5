<template>
  <div>
    <!-- 审核流显示与隐藏 -->

    <!-- label: `查看审核流`, -->

    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `查看审核流`,
              onClick: clickViewAuditFlow.bind(null, record),
              ifShow:
                !!record.bidSection.procurementMethod &&
                purchaseType.includes(record.bidSection.procurementMethod.id),
            },
            {
              label: '查看报价供应商',
              onClick: clickViewQuoteVendor.bind(null, record),
              ifShow: () =>
                record.bidSection.procurementMethod?.node === '1' &&
                !ifCurrentUserBiddingCompanyUser,
            },
            {
              label: '录入评审信息',
              onClick: clickreviewInfomation.bind(null, record),
              ifShow:
                !!record.bidSection.procurementMethod &&
                !purchaseType.includes(record.bidSection.procurementMethod.id),
            },
            {
              label: '设为待成交',
              color: 'success',
              onClick: clickSetWaitDeal.bind(null, record),
              ifShow:
                !!record.bidSection.procurementMethod &&
                !purchaseType.includes(record.bidSection.procurementMethod.id) &&
                !ifCurrentUserBiddingCompanyUser,
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
    <AuditProcessDrawer @register="registerDrawer" />
    <ReviewInfoDrawer @register="registerInfoDrawer" width="50%"></ReviewInfoDrawer>
    <!-- 转交 Drawer -->
    <LxTransferDrawer @register="registerDrawer2" :objectType="2" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { toRaw, nextTick, ref, onMounted, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { WaitReviewTableColumns, WaitReviewSearchFormSchema } from './waitReview.data';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import {
    getBidSectionPage,
    setAsPendingTransactionAboutSupplierQuotation,
  } from '/@/api/projectManagement/proMngWaitReviewApi';
  // import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import AuditProcessDrawer from './auditProcessDrawer.vue';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  import ReviewInfoDrawer from './reviewInfoDawer.vue';
  import {
    getActRuTaskByProcessId,
    saveBidSection,
  } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';
  import { useRouter } from 'vue-router';
  const userInfo = useUserStore().getUserInfo;
  const ifCurrentUserBiddingCompanyUser = computed(() => {
    return userInfo.role === 5;
  });
  const {
    getHqlQueryDto,
    resetHqlQueryDto,
    setPageByQueryInfo,
    appendQueryList,
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
        { param: 'bidSection.status.code', type: 'equal', value: [19] }, // 待采购
        // { param: 'bidSection.project.BiddingUserId', type: 'equal', value: [userInfo.id] },
        // { param: 'project.procurementMethod.code', type: 'notIn', value: ['6', '7'] },
      ],
      dataFieldList: ['bidSection', 'bidSection.id'],
    },
  });
  // getBidSectionPage
  const [registerTable, { reload }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER(
      '待评审列表',
      ifCurrentUserBiddingCompanyUser.value ? 120 : 270,
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
    columns: WaitReviewTableColumns(),
    rowKey: 'bidSection_id',
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      setPageByQueryInfo(queryInfo);
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
  const { createMessage, createConfirmPromise, createInfoModal } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerInfoDrawer, { openDrawer: openInfoDrawer }] = useDrawer();
  const [registerDrawer2, { openDrawer: openDrawer2 }] = useDrawer();

  const clickViewAuditFlow = async (record: Recordable) => {
    openDrawer(true, {
      record,
    });
    // const res = await getActRuTaskByProcessId(record.processId);
    // // const res = await getActRuTaskByProcessId('9af675fb-6233-11ec-98d5-52540034b5e6');
    // openDrawer(true, {
    //   ID_: res.data.ID_ ? res.data.ID_ : '',
    //   PROC_INST_ID_: res.data.PROC_INST_ID_ ? res.data.PROC_INST_ID_ : '',
    //   FILENAME: res.data.DGRM_RESOURCE_NAME_ ? res.data.DGRM_RESOURCE_NAME_ : '',
    // });
  };
  const status: any = ref();
  const waitDealStatus: any = ref();
  const purchaseType: any = ref([]);
  const configStore = useConfigStore();
  const getProjectStatus = async () => {
    const statusList = await getDictionaryByParentId(
      configStore.GET_CONFIG_DICTIONRY.projectStatusId,
    );
    status.value = statusList;
    const purchaseTypeList = await getDictionaryByParentId(
      configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
    );
    purchaseType.value = purchaseTypeList;
  };
  onMounted(async () => {
    await getProjectStatus();
    const purchaseList: any[] = [];
    status.value.forEach((item: any) => {
      if (item.code === '20') {
        waitDealStatus.value = item.id;
      }
    });
    console.log(waitDealStatus.value, 'waitDealStatus');
    purchaseType.value.forEach((item: any) => {
      if (item.code === '5' || item.code === '6') {
        purchaseList.push(item.id);
      }
    });
    purchaseType.value = purchaseList;
  });
  const clickreviewInfomation = async (record: Recordable) => {
    openInfoDrawer(true, {
      record,
    });
  };
  /**
   * 设为待上传采购文件
   */
  const clickSetWaitDeal = async (record: Recordable) => {
    const result = await setAsPendingTransactionAboutSupplierQuotation(toRaw(record).bidSection.id);
    const values = {
      id: toRaw(record).bidSection.id,
      status: {
        id: waitDealStatus.value,
      },
      ifSetAsPendingTransaction: 1,
    };
    if (!!result.msg) {
      await createConfirmPromise({
        content: '该项目无有效报价，确认设为待成交吗？',
      });
      await saveBidSection(values);
      createMessage.success('保存成功！');
      await reload();
    } else {
      await createConfirmPromise({
        content: '确认设为待成交吗？',
      });
      await saveBidSection(values);
      createMessage.success('保存成功！');
      await reload();
    }
  };
  // 转交
  const handleTransfer = (record: Recordable) => {
    console.log(record, 'record');
    openDrawer2(true, {
      objectId: record.bidSection.project.id,
      biddingDepartmentId: record.bidSection.project.biddingDepartmentId,
    });
  };
  // 查看报价供应商
  const router = useRouter();
  function clickViewQuoteVendor(record: Recordable) {
    router.push({
      path: '/reportForm/reportProjectBidsection',
      query: {
        bidSectionId: record.bidSection.id,
      },
    });
  }
  const handleSuccess = () => {
    reload();
  };
</script>
