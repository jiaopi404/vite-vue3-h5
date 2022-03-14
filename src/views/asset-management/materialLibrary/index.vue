<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <LxBasicExportBtn
          class="inline-block"
          :disabled="exportDisabled"
          :exportType="ExportTypeEnum.CONCONTRACT"
          :exportExcelDto="{
            fileName: '耗材库',
            sheetName: '耗材库',
            ifShowTotal: false,
            listDataColumn: DataColumn,
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="getHqlQueryDto"
        />
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '出库',
              onClick: outbound.bind(null, record),
              disabled: Number(
                record.conContractList.number - record.conContractList.outboundQuantity,
              )
                ? false
                : true,
            },
            {
              icon: '',
              label: '查看出库记录',
              onClick: checkRecord.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <MaterialLibraryDrawer @register="registerDrawer" @success="handleSuccess" />
    <OutboundRecords @register="registerDrawer2" />
  </div>
</template>
<script lang="ts">
  /**
   * 耗材库
   * materialLibrary
   * asset-management/materialLibrary/index.vue
   */
  import { defineComponent, ref, toRaw, onMounted } from 'vue';
  // import { useUserStore } from '/@/store/modules/user';
  // import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './materialLibrary.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getConContractListPageByQueryDto } from '/@/api/assetManagement/assetManagementApi';

  import MaterialLibraryDrawer from '../materialLibrary/components/MaterialLibraryDrawer.vue';
  import OutboundRecords from '../materialLibrary/components/OutboundRecords.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';

  import {
    LxBasicExportBtn,
    ExportColumnMap,
    ExportColumnKeyEnum,
  } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      MaterialLibraryDrawer,
      OutboundRecords,

      LxBasicExportBtn,
      ExportTypeEnum,
      ExportColumnMap,
      ExportColumnKeyEnum,
    },
    setup() {
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerDrawer2, { openDrawer: openDrawer2 }] = useDrawer();
      const exportDisabled = ref<boolean>(true); //导出禁用
      // const userStore = useUserStore();
      const configStore = useConfigStore();
      // const { createMessage } = useMessage();

      let DataColumn = [
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_BIDSECTIONNAME],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_CONCONTRACTNAME],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_NAME],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_BRANDMODEL],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_MANUFACTURER],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_UNITDIC],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_NUMBER],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_OUTNUMBER],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_TRANSACTIONUNITPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_TRANSACTIONUNITSUMPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_ASSETSUNITPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_ASSETSUNITSUMPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_ACTUALSPEC],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_WARRANTYYEAR],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_DECLAREDEPTNAME],
      ];

      onMounted(async () => {
        console.log('资产显示：', configStore.GET_CONFIG_MODULE.ifShowAssetFund);
        console.log('资产显示：', !configStore.GET_CONFIG_MODULE.ifShowAssetFund);
        console.log('资产显示：', !!configStore.GET_CONFIG_MODULE.ifShowAssetFund);
        if (!configStore.GET_CONFIG_MODULE.ifShowAssetFund) {
          DataColumn.splice(9, 2);
        }
      });

      // 组织查询参数
      const {
        appendQueryList,
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSortByQueryInfo,
        getHqlQueryDto,
      } = useHqlQueryDto(pageAndSort());
      // 请求之前对参数进行处理
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);

        appendQueryListByQueryInfoValuePlain(
          'conContract.bidSection.proName',
          'like',
          queryInfo.proName,
        );
        if (queryInfo.declareDeptId) {
          let res = await getDepartmentStringById(queryInfo.declareDeptId);
          let numArr = res.msg.split(',').map(Number);
          appendQueryList({
            param: 'conContract.bidSection.project.declareDept.id',
            type: 'in',
            // value: [queryInfo.departmentId],
            value: numArr,
          });
        }

        appendQueryListByQueryInfoValuePlain(
          'conContractList.brandModel',
          'like',
          queryInfo.brandModel,
        );
        appendQueryListByQueryInfoValuePlain(
          'conContractList.manufacturer',
          'like',
          queryInfo.manufacturer,
        );
        appendQueryListByQueryInfoValuePlain(
          'conContractList.actualSpec',
          'like',
          queryInfo.actualSpec,
        );
        if (queryInfo.transactionUnitPrice) {
          if (queryInfo.transactionUnitPrice[0]) {
            appendQueryListByQueryInfoValuePlain(
              'conContractList.transactionUnitPrice',
              'ge',
              queryInfo.transactionUnitPrice[0],
            );
          }
          if (queryInfo.transactionUnitPrice[1]) {
            appendQueryListByQueryInfoValuePlain(
              'conContractList.transactionUnitPrice',
              'le',
              queryInfo.transactionUnitPrice[1],
            );
          }
        }
        if (queryInfo.assetsUnitPrice) {
          if (queryInfo.assetsUnitPrice[0]) {
            appendQueryListByQueryInfoValuePlain(
              'conContractList.assetsUnitPrice',
              'ge',
              queryInfo.assetsUnitPrice[0],
            );
          }
          if (queryInfo.assetsUnitPrice[1]) {
            appendQueryListByQueryInfoValuePlain(
              'conContractList.assetsUnitPrice',
              'le',
              queryInfo.assetsUnitPrice[1],
            );
          }
        }

        setSortByQueryInfo(queryInfo);
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        if (data.length > 0) {
          exportDisabled.value = false;
        } else {
          exportDisabled.value = true;
        }
        return data;
      };
      // 在请求之前处理搜索条件参数
      const handleSearchInfoFn = (data) => {
        console.log('搜索条件：', data);
      };

      const [registerTable, { reload }] = useTable({
        title: '耗材库列表',
        api: getConContractListPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: (record) => record.conContractList.id,
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          autoSubmitOnEnter: true,
          schemas: searchFormSchema(),
        },
        handleSearchInfoFn,
        showTableSetting: true, // 显示表格设置工具
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
        bordered: true,
        showIndexColumn: true,
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 180,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      const outbound = (record) => {
        openDrawer(true, {
          contractListId: record.conContractList.id,
          maxNumber: Number(
            record.conContractList.number - record.conContractList.outboundQuantity,
          ),
        });
      };

      const checkRecord = async (record) => {
        openDrawer2(true, {
          contractListId: record.conContractList.id,
        });
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerTable,
        handleSuccess,
        registerDrawer,
        registerDrawer2,
        outbound,
        checkRecord,

        reload,
        getHqlQueryDto,
        exportDisabled,
        ExportTypeEnum,
        ExportColumnMap,
        ExportColumnKeyEnum,
        DataColumn,
      };
    },
  });
</script>
