<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <!-- <a-button type="primary" @click="fun"> fun </a-button> -->
        <a-button type="primary" :disabled="checkedKeys.length <= 1" @click="batchSetAssets(1)">
          批量设为固定资产库
        </a-button>
        <a-button
          type="primary"
          danger
          :disabled="checkedKeys.length <= 1"
          @click="batchSetAssets(2)"
        >
          批量设为耗材库
        </a-button>
        <LxBasicExportBtn
          class="inline-block"
          :disabled="exportDisabled"
          :exportType="ExportTypeEnum.CONCONTRACT"
          :exportExcelDto="{
            fileName: '资产清单',
            sheetName: '资产清单',
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
              label: '设为固定资产库',
              onClick: setAssets.bind(null, record, 1),
            },
            {
              icon: '',
              label: '设为耗材库',
              color: 'error',
              onClick: setAssets.bind(null, record, 2),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 资产清单
   * assetsList
   * asset-management/assetsList/index.vue
   */
  import { defineComponent, ref, unref, onMounted } from 'vue';
  // import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './assetsList.data';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import {
    getConContractListPageByQueryDto,
    updateClassificationByIds,
  } from '/@/api/assetManagement/assetManagementApi';
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

      LxBasicExportBtn,
      ExportTypeEnum,
      ExportColumnMap,
      ExportColumnKeyEnum,
    },
    setup() {
      const checkedKeys = ref<Array<string | number>>([]);
      const exportDisabled = ref<boolean>(true); //导出禁用
      // const userStore = useUserStore();
      const configStore = useConfigStore();
      const { createMessage, createConfirmPromise } = useMessage();

      let DataColumn = [
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_BIDSECTIONNAME],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_CONCONTRACTNAME],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_NAME],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_BRANDMODEL],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_MANUFACTURER],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_UNITDIC],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_NUMBER],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_TRANSACTIONUNITPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_TRANSACTIONUNITSUMPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_ASSETSUNITPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_ASSETSUNITSUMPRICE],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_ACTUALSPEC],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_WARRANTYYEAR],
        ExportColumnMap[ExportColumnKeyEnum.ASSETS_LIST_DECLAREDEPTNAME],
      ];

      onMounted(async () => {
        // console.log('资产', configStore.GET_CONFIG_MODULE.ifShowAssetFund);
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
            type: 'in', // equal
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
        title: '资产清单列表',
        api: getConContractListPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        // rowKey: 'id',
        rowKey: (record) => record.conContractList.id,
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          // autoAdvancedLine: 4,
          // alwaysShowLines: 2,
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
          width: 230,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
        clickToRowSelect: false,
        rowSelection: {
          type: 'checkbox',
          // selectedRowKeys: unref(checkedKeys), // 指定选中项的 key 数组，需要和 onChange 进行配合
          onChange: onSelectChange,
        },
      });

      const fun = () => {
        console.log('checkedKeys.value', checkedKeys.value);
      };
      // 单个设置
      const setAssets = async (record, typeNumber) => {
        try {
          const msg = typeNumber === 1 ? '固定资产库' : '耗材库';
          await createConfirmPromise({
            content: `确认设为${msg}吗？`,
          });
          await updateClassificationByIds({
            ids: [record.conContractList.id],
            warehousingClassification: typeNumber,
          });

          let checkedIndex = checkedKeys.value.indexOf(record.conContractList.id);
          if (checkedIndex !== -1) {
            checkedKeys.value.splice(checkedIndex, 1);
          }
          reload();
          createMessage.success(`设为${msg}成功`);
        } catch (err) {
          console.log(err);
        }
      };

      // 批量设置
      const batchSetAssets = async (typeNumber) => {
        try {
          const msg = typeNumber === 1 ? '固定资产库' : '耗材库';
          await createConfirmPromise({
            content: `确认批量设为${msg}吗？`,
          });
          await updateClassificationByIds({
            ids: unref(checkedKeys),
            warehousingClassification: typeNumber,
          });

          // vue3使用proxy，对于对象和数组都不能直接整个赋值 所以 checkedKeys.value = [] 无效。
          checkedKeys.value.splice(0, checkedKeys.value.length);
          reload();
          createMessage.success(`批量设为${msg}成功`);
        } catch (err) {
          console.log(err);
        }
      };

      // 表格可选择
      function onSelectChange(selectedRowKeys: (string | number)[]) {
        //onSelectChange有两个参数 Function(selectedRowKeys, selectedRows)
        // console.log('selectedRowKeys', selectedRowKeys);
        // selectedRows: []
        // console.log('selectedRows', selectedRows);
        checkedKeys.value = selectedRowKeys;
        console.log('checkedKeys.value1', checkedKeys.value);
      }

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        checkedKeys,
        onSelectChange,
        registerTable,
        handleSuccess,
        setAssets,
        batchSetAssets,
        reload,
        getHqlQueryDto,
        exportDisabled,
        ExportTypeEnum,
        ExportColumnMap,
        ExportColumnKeyEnum,
        DataColumn,
        fun,
      };
    },
  });
</script>
