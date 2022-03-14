<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '编辑',
              onClick: clickHandlerProNumber.bind(null, record),
              disabled: !getDisabled(record),
            },
            {
              label: '制作',
              color: 'success',
              onClick: clickHandlerMakePurchaseFile.bind(null, record),
              disabled:
                !getDisabled(record) ||
                record.bidSection.ifUploadProcurementDocuments === 1 ||
                (record.bidSection.upLoader && record.bidSection.upLoader !== userInfo?.id),
            },
            {
              label: '上传',
              color: 'warning',
              onClick: clickHandlerUploadFile.bind(null, record),
              disabled:
                record.bidSection.ifUploadProcurementDocuments === 2 ||
                (record.bidSection.upLoader && record.bidSection.upLoader !== userInfo?.id),
            },
            {
              label: '委托',
              title: '委托协议',
              onClick: clickHandlerUploadConsignmentAgreement.bind(null, record),
              disabled: record.bidSection.upLoader && record.bidSection.upLoader !== userInfo?.id,
              ifShow: () => ifUploadConsignmentAgreementComputed,
            },
            {
              label: '确认',
              color: 'error',
              onClick: clickHandlerConfirmPurchaseFile.bind(null, record),
              disabled: !getDisabled(record) || record.bidSection.upLoader !== userInfo?.id,
            },
            {
              label: '设为待成交',
              onClick: clickHandlerSetWaitForDeal.bind(null, record),
              disabled: getDisabled(record),
            },
            {
              label: '转交',
              color: 'success',
              onClick: handleTransfer.bind(null, record),
              ifShow: (_action) => {
                return !ifCurrentUserBiddingCompanyUser; // 根据业务控制是否显示: 非enable状态的不显示启用按钮
              },
            },
          ]"
        />
      </template>
    </BasicTable>
    <CompleteBidSectionDrawerVue @register="regDrawerCompleteBidSection" @save-success="reload" />
    <MakePurchaseFileDrawerVue @register="regDrawerMakePurchaseFile" @save-success="reload" />
    <UploadPurchaseFileDrawerVue @register="regDrawerUploadPurchaseFile" @save-success="reload" />
    <UploadConsignmentAgreement
      @register="regDrawerUploadConsignmentAgreement"
      @save-success="reload"
    />
    <BidCompInternalReviewDrawer
      @register="regDrawerBidCompanyInternalReview"
      @save-success="bidCompInternalReviewCompleteHandler"
    />
    <!-- 转交 Drawer -->
    <LxTransferDrawer @register="registerDrawerTransfer" :objectType="2" @success="handleSuccess" />
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useRouter } from 'vue-router';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import CompleteBidSectionDrawerVue from './CompleteBidSectionDrawer.vue';
  import MakePurchaseFileDrawerVue from './MakePurchaseFileDrawer.vue';
  import UploadPurchaseFileDrawerVue from './UploadPurchaseFileDrawer.vue';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import {
    waitUploadPurchaseFileSearchFormSchema,
    waitUploadPurchaseFileTableColumns,
  } from './waitUploadPurchaseFile.data';
  import { getBidSectionPageByQueryDto } from '/@/api/purchase/waitTenderApi';
  import { verifyWhetherPurchaseDocuments } from '/@/api/templateManagement/templateManagementApi';
  import { computed } from 'vue';
  import {
    getFileList,
    setAsPendingTransaction,
  } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { getCusConfirmTip } from '/@/enums/messageEnum';
  import { bidSectionDeclare, projectDeclare } from '/@/api/auditMangement/auditMangement';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import { useBusinessStore } from '/@/store/modules/business';
  import { useConfigStore } from '/@/store/modules/config';
  import UploadConsignmentAgreement from './UploadConsignmentAgreement.vue';
  import BidCompInternalReviewDrawer from './BidCompInternalReviewDrawer.vue';

  const userInfo = useUserStore().getUserInfo;
  const businessStore = useBusinessStore();
  const configStore = useConfigStore();
  const [regDrawerCompleteBidSection, { openDrawer: openDrawerCompleteBidSection }] = useDrawer();
  const [regDrawerMakePurchaseFile, { openDrawer: openDrawerMakePurchaseFile }] = useDrawer();
  const [regDrawerUploadPurchaseFile, { openDrawer: openDrawerUploadPurchaseFile }] = useDrawer();
  const [regDrawerBidCompanyInternalReview, { openDrawer: openDrawerBidCompanyInternalReview }] =
    useDrawer();
  const [
    regDrawerUploadConsignmentAgreement,
    { openDrawer: openDrawerUploadConsignmentAgreement },
  ] = useDrawer();
  const [registerDrawerTransfer, { openDrawer: openDrawerTransfer }] = useDrawer();
  // 是否是招标公司用户
  const ifCurrentUserBiddingCompanyUser = computed(() => {
    return userInfo.role === 5;
  });

  // 是否需要上传委托协议: 当前用户 是 招标公司； 开启 是否上传委托协议配置； 标段的 upLoader 为当前用户
  const ifUploadConsignmentAgreementComputed = computed(() => {
    return (
      ifCurrentUserBiddingCompanyUser.value &&
      configStore.GET_CONFIG_MODULE.ifUploadConsignmentAgreement
    );
  });

  // 招标公司 上传内部评审情况: 当前用户 是 招标公司； 开启 ifBidCompInternalReview 标段的 upLoader 为当前用户
  // 用于打开 招标公司内部评审弹窗
  const ifBidCompInternalReview = computed(() => {
    return (
      ifCurrentUserBiddingCompanyUser.value && configStore.GET_CONFIG_MODULE.ifBidCompInternalReview
    );
  });

  const {
    getHqlQueryDto,
    resetHqlQueryDto,
    setPageByQueryInfo,
    appendQueryListByQueryInfoValuePlain,
    setSortByQueryInfo,
    appendQueryList,
  } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      page: { pageNum: 1, pageSize: 10 },
      sorts: [
        { dir: 'desc', prop: 'bidSection.updateDateTime' },
        { dir: 'desc', prop: 'bidSection.id' },
      ],
      queryList: [
        { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
        { param: 'bidSection.status.code', type: 'equal', value: [16] },
      ],
      dataFieldList: ['bidSection', 'bidSection.id'],
      sumList: ['bidSection.budgetAmount'],
    },
  });
  const [registerTable, { reload, setLoading }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER(
      '待上传采购文件列表',
      ifUploadConsignmentAgreementComputed.value ? 400 : 350, // 上传委托协议
    ),
    api: getBidSectionPageByQueryDto,
    columns: waitUploadPurchaseFileTableColumns,
    rowKey: 'bidSection_id',
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      setPageByQueryInfo(queryInfo);
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
        // 关于采购形式和采购方式得  organizationalForm procurementMethod
        // (采购方式 node = 1 or 采购方式 node is null) or (采购方式 node = 2 and 采购形式 node is null)
        appendQueryList({
          param: '',
          type: 'or',
          value: [
            orParamsFormatter(
              '((bidSection.procurementMethod.node = 1 or bidSection.procurementMethod.node is null) or (bidSection.procurementMethod.node = 2 and bidSection.organizationalForm.node is null))',
            ),
          ],
        });
      }
      appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
      appendQueryListByQueryInfoValuePlain(
        'bidSection.project.projectType.id',
        'equal',
        queryInfo.purchaseType,
      );
      setSortByQueryInfo(queryInfo);
      return getHqlQueryDto();
    },
    afterFetch: (data) => {
      return data;
    },
    formConfig: {
      labelWidth: 120,
      schemas: waitUploadPurchaseFileSearchFormSchema,
      // placeHolder: '请输入菜单名称',
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
  });
  // disabled
  // 采购方式 = 零星采购 或 电子卖场 且 采购形式 in (学校集中采购 部门集中采购 自行采购)
  const getDisabled = ({ bidSection }) => {
    // return !bidSection.procurementMethod?.node && !bidSection.organizationalForm?.node;
    return !bidSection.procurementMethod?.node;
  };
  const router = useRouter();

  const { createMessage, createConfirmPromise, createInfoModal } = useMessage();

  // BLOCK: handlers
  const clickHandlerProNumber = (record) => {
    // TODO: 查询标段的一级模板, 有的话直接跳转
    openDrawerCompleteBidSection(true, { id: record.bidSection.id });
  };

  const clickHandlerMakePurchaseFile = async (record) => {
    setLoading(true);
    try {
      const bool = await verifyWhetherPurchaseDocuments(record.bidSection.id);
      if (!bool) {
        // 表示已经有了, 跳转
        router.push({
          path: '/proMng/proPurchaseTemplate',
          query: {
            id: record.bidSection.id,
          },
        });
        setLoading(false);
        return;
      }
      openDrawerMakePurchaseFile(true, { id: record.bidSection.id });
    } finally {
      setLoading(false);
    }
  };
  const clickHandlerUploadFile = (record) => {
    openDrawerUploadPurchaseFile(true, { id: record.bidSection.id });
  };

  const clickHandlerUploadConsignmentAgreement = (record) => {
    openDrawerUploadConsignmentAgreement(true, { id: record.bidSection.id });
  };

  const clickHandlerConfirmPurchaseFile = async (record) => {
    // 验证
    let bidSection = record.bidSection;
    if (!bidSection.proNumber) {
      createMessage.error('请先填写项目编号！');
      return;
    }
    if (!bidSection.quoteEndTime) {
      createMessage.error('请先填写开标时间！');
      return;
    }
    if (!bidSection.ifUploadProcurementDocuments) {
      createMessage.error('请先上传采购文件！');
      return;
    }
    if (!bidSection.quoteLocation) {
      createMessage.error('请先填写开标地点！');
      return;
    }
    setLoading(true);
    // 验证 是否已上传 委托协议
    if (ifUploadConsignmentAgreementComputed.value && userInfo.id === record.bidSection.upLoader) {
      try {
        let fileList = await getFileList({
          projectId: record.bidSection.id,
          objectType: 1,
          statusId: [record.bidSection.status?.id], // 待上传采购文件的状态
          objectName: 'pro_bidSection',
        });
        fileList = fileList.filter((item) => {
          // 状态 16 且 非 采购文件的文件类型
          return (
            item.fileType.statusId?.code === '16' &&
            item.fileType.id !== configStore.GET_CONFIG_MODULE.fileTypePurchaseDocuments
          );
        });
        if (!fileList.length || !fileList[0].list.length) {
          setLoading(false);
          createMessage.error('请先上传委托协议！');
          return;
        }
      } catch (err) {
        console.log('验证 是否已上传委托协议出错', err);
        setLoading(false);
        return;
      }
    }
    try {
      // 待成交
      await createConfirmPromise({
        content: getCusConfirmTip('发起审核流'),
      });
      if (ifBidCompInternalReview.value && userInfo.id === bidSection.upLoader) {
        // 打开弹窗
        openDrawerBidCompanyInternalReview(true, { id: record.bidSection.id });
      } else {
        await declare(bidSection);
      }
    } finally {
      setLoading(false);
    }
  };

  const declare = async (bidSection) => {
    const data = await bidSectionDeclare({
      objectId: bidSection.id,
      code: '6', // 此处code时6，申报是4
      tagModuleId: businessStore.GET_TAG_MODULE_INFO?.id ?? -1,
      account: userInfo.account,
    });
    if (data) {
      createMessage.success('发起成功！');
      reload();
    } else {
      createMessage.error('发起失败！');
    }
  };

  const bidCompInternalReviewCompleteHandler = async (bidSection) => {
    setLoading(true);
    try {
      await declare(bidSection);
      reload();
    } finally {
      setLoading(false);
    }
  };

  const clickHandlerSetWaitForDeal = async (record) => {
    if (!record.bidSection.ifUploadProcurementDocuments) {
      // 未上传附件
      createMessage.error('请先上传零星采购备案表！');
      return;
    }
    // 待成交
    await createConfirmPromise({
      content: getCusConfirmTip('设为待成交'),
    });
    const show = await setAsPendingTransaction(record.bidSection.id, 1);
    if (!show.msg) {
      createMessage.success('更新成功');
    } else {
      createMessage.warn(show.msg);
    }
    reload();
  };
  // 转让
  const handleTransfer = (record: Recordable) => {
    openDrawerTransfer(true, {
      objectId: record?.bidSection.project.id,
      biddingDepartmentId: record?.bidSection.project.biddingDepartmentId,
    });
  };
  function handleSuccess() {
    reload();
  }
</script>
