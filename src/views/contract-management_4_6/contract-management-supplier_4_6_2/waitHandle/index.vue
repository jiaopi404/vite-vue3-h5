<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `生成合同条款`,
              onClick: clickTOContract.bind(null, record),
            },
            {
              label: '上传附件',
              onClick: clickuploadFile.bind(null, record),
            },
            {
              label: '发起审核',
              onClick: clickToExamine.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <UploadContractFileDrawerVue
      :statusId="statusId"
      :statusCode="statusCode"
      @register="regDrawerUploadFile"
      @success="reload"
    />
    <ContractTemplateDrawer
      @register="regDrawerContract"
      @success="reload"
      width="30%"
    ></ContractTemplateDrawer>
    <ReviewDrawer @register="regDrawerReview" @success="reload" width="30%"></ReviewDrawer>
  </div>
</template>
<script lang="ts" setup>
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import {
    getConContractPageByQueryDto,
    getTotalByContractId,
    verifyWhetherConContractTemplates,
  } from '/@/api/contractManagement/waitImprove';
  import { WaitHandleSearchFormSchema, WaitHandleTableColumns } from './waitHandle.data';
  import UploadContractFileDrawerVue from '../waitImprove/UploadContractFileDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useBusinessStore } from '/@/store/modules/business';
  import { conContractDeclare } from '/@/api/auditMangement/auditMangement';
  import ContractTemplateDrawer from './contractTemplateDrawer.vue';
  import ReviewDrawer from './reviewDrawer.vue';
  import { useRouter } from 'vue-router';

  const userInfo = useUserStore().getUserInfo;
  const { createMessage, createConfirmPromise } = useMessage();
  const businessStore = useBusinessStore();
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
        { dir: 'desc', prop: 'conContract.updateDateTime' },
        { dir: 'desc', prop: 'conContract.id' },
      ],
      queryList: [
        // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
        { param: 'conContract.ifDelete', type: 'equal', value: [0] },
        { param: 'conContract.bidSection.ifDelete', type: 'equal', value: [0] },
        { param: 'bidWinner.ifDelete', type: 'equal', value: [0] },
        { param: 'conContract.status.code', type: 'equal', value: [2] }, // 待采购
        { param: 'conContract.chargeUser.id', type: 'equal', value: [userInfo.id] },
      ],
      dataFieldList: ['conContract', 'conContract.id'],
    },
  });
  // getBidSectionPage
  const [registerTable, { reload, setLoading }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER('待处理列表', 270),
    api: getConContractPageByQueryDto,
    columns: WaitHandleTableColumns(),
    rowKey: 'conContract_id',
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      setPageByQueryInfo(queryInfo);
      appendQueryListByQueryInfoValuePlain('conContract.name', 'like', queryInfo.name);
      appendQueryListByQueryInfoValuePlain('conContract.code', 'like', queryInfo.code);
      // 项目
      appendQueryListByQueryInfoValuePlain(
        'conContract.bidSection.proName',
        'like',
        queryInfo.proName,
      );
      appendQueryListByQueryInfoValuePlain(
        'conContract.bidSection.proNumber',
        'like',
        queryInfo.proNumber,
      );
      appendQueryListByQueryInfoValuePlain(
        'conContract.bidSection.project.projectType.id',
        'equal',
        queryInfo.purchaseType,
      );
      // 发布日期
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
      setSortByQueryInfo(queryInfo);
      return getHqlQueryDto();
    },
    afterFetch: (data) => {
      return data;
    },
    formConfig: {
      labelWidth: 120,
      schemas: WaitHandleSearchFormSchema(),
      // placeHolder: '请输入菜单名称',
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
  });
  const statusId = ref();
  const statusCode = ref();
  const [regDrawerUploadFile, { openDrawer: openDrawerUploadFile }] = useDrawer();
  const [regDrawerContract, { openDrawer: openDrawerContract }] = useDrawer();
  const [regDrawerReview, { openDrawer: openDrawerReview }] = useDrawer();
  const clickuploadFile = async (record: Recordable) => {
    console.log('fujian ', record);
    statusId.value = record.conContract.status.id;
    statusCode.value = '2';
    openDrawerUploadFile(true, { id: record.conContract.id });
  };
  const router = useRouter();

  const clickTOContract = async (record: Recordable) => {
    setLoading(true);
    const bool = await verifyWhetherConContractTemplates(record.conContract.id);
    if (bool) {
      router.push({
        path: '/contract-management/contractTemplate',
        query: {
          id: record.conContract.id,
        },
      });
      setLoading(false);
      return;
    }
    setLoading(false);
    openDrawerContract(true, {
      record,
    });
  };
  const clickToExamine = async (record: Recordable) => {
    try {
      setLoading(true);
      const bool = await verifyWhetherConContractTemplates(record.conContract.id);
      if (bool) {
        const paymentTitle: any = await getTotalByContractId(record.conContract.id);
        if (paymentTitle.amountSum !== record.conContract.conAmount) {
          createMessage.error('付款金额合计和合同金额不一致，请确认！');
          setLoading(false);
          return;
        }
        openDrawerReview(true, {
          record,
        });
        setLoading(false);
        return;
      }
      setLoading(false);
      createMessage.error('请先添加合同模板！');
      // 发起流程
    } catch (error) {}
  };
</script>
