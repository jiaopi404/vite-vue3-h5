<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: `设为供应商`,
              onClick: clickSetBidSupplier.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <BidSupplierDrawer
      @register="registerInfoDrawer"
      @success="handleSuccess"
      width="30%"
    ></BidSupplierDrawer>
  </div>
</template>
<script lang="ts" setup>
  import { toRaw, ref, onMounted } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { bidSupplierTableColumns } from './waitDeal.data';
  import { getsupplierQuotationPageByQueryDto } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { useDrawer } from '/@/components/Drawer';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  import BidSupplierDrawer from './bidSupplier.vue';
  import { useRoute } from 'vue-router';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  const route = useRoute();
  const bidSupplier = ref();
  const {
    getHqlQueryDto,
    resetHqlQueryDto,
    setPageByQueryInfo,
    setSortByQueryInfo,
    appendQueryListByQueryInfoValuePlain,
  } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      page: { pageNum: 1, pageSize: 10 },
      sorts: [
        { dir: 'desc', prop: 'supplierQuotation.updateDateTime' },
        { dir: 'desc', prop: 'supplierQuotation.id' },
      ],
      queryList: [
        // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
        {
          param: 'supplierQuotation.bidSectionId',
          type: 'equal',
          value: [Number(route.query.id)],
        },
        {
          param: 'supplierQuotation.ifCancelQuotation',
          type: 'equal',
          value: [0],
        },
      ],
      ifCustomHql: true,
      dataFieldList: ['supplierQuotation.id'],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '供应商信息',
    canResize: false,
    // 点击行不选中
    // api: getsupplierQuotationPageByQueryDto,
    api: async (params) => {
      try {
        await getProjectStatus();
        status.value.forEach((item: any) => {
          if (item.code === '1') {
            waitDealStatus.value = item.id;
          }
        });
        console.log('供应商', params);
        params.sqlPageAndSortSumDto.queryList.push({
          param: 'supplierQuotation.statusId',
          type: 'equal',
          value: [waitDealStatus.value],
        });
        return await getsupplierQuotationPageByQueryDto(params);
      } catch (err) {
        console.log('error is: ', err);
      }
    },
    columns: bidSupplierTableColumns,
    rowKey: 'supplierQuotation.id',
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      setPageByQueryInfo(queryInfo);
      // appendQueryListByQueryInfoValuePlain(
      //   'supplierQuotation.statusId',
      //   'equal',
      //   waitDealStatus.value,
      // );
      setSortByQueryInfo(queryInfo);
      const params = getHqlQueryDto();
      const query = {
        sqlPageAndSortSumDto: {},
      };
      query.sqlPageAndSortSumDto = params.hqlPageAndSortSumDto;
      return query;
    },
    afterFetch: (data) => {
      bidSupplier.value = data;
      return data;
    },
    fetchSetting: {
      // The field name of the current page passed to the background
      pageField: 'page',
      // The number field name of each page displayed in the background
      sizeField: 'pageSize',
      // Field name of the form data returned by the interface
      listField: 'page.content',
      // Total number of tables returned by the interface field name
      totalField: 'page.totalElements',
    },
    showTableSetting: true,
    tableSetting: {
      // 是否显示刷新按钮
      redo: true,
      // 是否显示尺寸调整按钮
      size: true,
      // 是否显示字段调整按钮
      setting: true,
      // 是否显示全屏按钮
      fullScreen: true,
    },
    actionColumn: {
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: {
        customRender: 'action',
      },
      fixed: 'right',
    },
  });
  const { createMessage, createConfirmPromise, createInfoModal } = useMessage();
  const [registerInfoDrawer, { openDrawer: openInfoDrawer }] = useDrawer();
  const status: any = ref();
  const waitDealStatus: any = ref();
  const configStore = useConfigStore();
  const getProjectStatus = async () => {
    const statusList = await getDictionaryByParentId(
      configStore.GET_CONFIG_DICTIONRY.quotationStatusId,
    );
    status.value = statusList;
  };
  // 设为供应商
  const clickSetBidSupplier = async (record: Recordable) => {
    const noIds = [];
    toRaw(bidSupplier.value).forEach((item: any) => {
      if (item.returnBidSection.id !== record.returnBidSection.id) {
        noIds.push(item?.returnBidSection.id);
      }
    });
    console.log('bidSupplier', noIds);
    openInfoDrawer(true, {
      record,
      noIds,
    });
  };
  const handleSuccess = async () => {
    await reload();
  };
</script>
