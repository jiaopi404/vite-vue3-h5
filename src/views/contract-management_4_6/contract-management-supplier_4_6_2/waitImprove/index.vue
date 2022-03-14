<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `完善合同清单`,
              onClick: clickImproveContract.bind(null, record),
            },
            {
              label: '上传附件',
              onClick: clickuploadFile.bind(null, record),
            },
            {
              label: '完善完成',
              onClick: clickImproveSuccess.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <ImproveContractDawerVue
      @register="registerDrawer"
      @success="handleSuccess"
      width="70%"
    ></ImproveContractDawerVue>
    <UploadContractFileDrawerVue
      :statusId="statusId"
      @register="regDrawerUploadFile"
      @success="reload"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { useDrawer } from '/@/components/Drawer';
  import ImproveContractDawerVue from './improveContractDawer.vue';
  import UploadContractFileDrawerVue from './UploadContractFileDrawer.vue';
  import {
    getConContractPageByQueryDto,
    perfectCompletion,
  } from '/@/api/contractManagement/waitImprove';
  import { WaitImproveSearchFormSchema, WaitImproveTableColumns } from './waitImprove.data';
  import { useConfigStore } from '/@/store/modules/config';
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
        { dir: 'desc', prop: 'conContract.updateDateTime' },
        { dir: 'desc', prop: 'conContract.id' },
      ],
      queryList: [
        // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
        { param: 'conContract.ifDelete', type: 'equal', value: [0] },
        { param: 'conContract.bidSection.ifDelete', type: 'equal', value: [0] },
        { param: 'bidWinner.ifDelete', type: 'equal', value: [0] },
        { param: 'conContract.status.code', type: 'equal', value: [1] },
        { param: 'conContract.successfulSupplier.user.id', type: 'equal', value: [userInfo.id] },
      ],
      dataFieldList: ['conContract', 'conContract.id'],
    },
  });
  const configStore = useConfigStore();
  const flag = ref(false);
  const ifShowAssetFund = ref(configStore.GET_CONFIG_MODULE.ifShowAssetFund);
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [regDrawerUploadFile, { openDrawer: openDrawerUploadFile }] = useDrawer();
  // getBidSectionPage
  const [registerTable, { reload }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER('待完善列表', 270),
    api: getConContractPageByQueryDto,
    columns: WaitImproveTableColumns(),
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
      schemas: WaitImproveSearchFormSchema(),
      // placeHolder: '请输入菜单名称',
      autoSubmitOnEnter: true,
    },
    useSearchForm: true,
  });
  const { createMessage, createConfirmPromise, createInfoModal } = useMessage();
  const clickImproveContract = async (record: Recordable) => {
    openDrawer(true, { record });
  };
  const statusId = ref();
  const clickuploadFile = async (record: Recordable) => {
    console.log('fujian ', record);
    statusId.value = record.conContract.status.id;
    openDrawerUploadFile(true, { id: record.conContract.id });
  };
  const clickImproveSuccess = async (record: Recordable) => {
    try {
      await createConfirmPromise({
        content: '确认完善完成吗？',
      });
      if (flag.value && ifShowAssetFund.value) {
        createMessage.error('资产总价合计与合同金额不符！');
        return;
      } else if (flag.value && !ifShowAssetFund.value) {
        createMessage.error('成交总价合计与合同金额不符！');
        return;
      }
      const res: any = await perfectCompletion(record.conContract.id);
      if (res.data.length > 0) {
        createMessage.error(res.data[0]);
      } else {
        createMessage.success('确认完善完成成功！');
        await reload();
      }
    } catch (error) {}
  };
  const handleSuccess = async (ifFlag) => {
    console.log('flag', ifFlag);
    flag.value = ifFlag;
    await reload();
  };
</script>
