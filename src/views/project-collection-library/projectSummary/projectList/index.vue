<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <LxBasicExportBtn
          class="inline-block"
          :disabled="exportDisabled"
          :exportType="ExportTypeEnum.PROBUDGET"
          :exportExcelDto="{
            fileName: exportFileName,
            sheetName: exportFileName,
            ifShowTotal: true,
            listDataColumn: DataColumn,
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="getHqlQueryDto"
        />
      </template>
      <!-- <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: 'edit',
              onClick: handleEdit.bind(null, record),
            },
          ]"
        />
      </template> -->
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 项目汇总 项目列表
   * projectList
   * project-collection-library/projectSummary/projectList/index.vue
   */
  import { defineComponent, ref } from 'vue';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './projectList.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getProBudgetPageByQueryDto } from '/@/api/projectManagement/projectCollectionLibraryApi';

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
    },
    setup() {
      const userStore = useUserStore();
      const configStore = useConfigStore();
      const { createMessage } = useMessage();
      const exportDisabled = ref<boolean>(true); //导出禁用
      const exportFileName = ref<string>(''); // 导出文件名

      let DataColumn = [
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_YEAR],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_PRONAME],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_PROJECTTYPENAME],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_BUDGETAMOUNT],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_RELEVANTDEPTNAME],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_PROCHARGEUSER],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_STARTINGTIME],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_DECLAREDEPTNAME],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_ADDDATETIME],
        ExportColumnMap[ExportColumnKeyEnum.PRODBUDGET_SUMMARY_REMARK],
      ];
      // 组织查询参数
      const {
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

        if (queryInfo.year) {
          exportFileName.value = `${queryInfo.year}年${userStore.getUserInfo.orgName}政府采购项目计划申报汇总表`;
        } else {
          exportFileName.value = `${userStore.getUserInfo.orgName}政府采购项目计划申报汇总表`;
        }

        appendQueryListByQueryInfoValuePlain('proBudget.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain('proBudget.year', 'equal', queryInfo.year);
        appendQueryListByQueryInfoValuePlain(
          'proBudget.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );
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
        return data.map((item) => item.proBudget);
      };

      const [registerTable, { reload }] = useTable({
        title: '项目列表',
        api: getProBudgetPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'id',
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          autoSubmitOnEnter: true,
          schemas: searchFormSchema(),
        },
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
        // actionColumn: {
        //   width: 120,
        //   title: '操作',
        //   dataIndex: 'action',
        //   fixed: 'right',
        //   slots: {
        //     customRender: 'action',
        //   },
        // },
      });

      const handleEdit = (record) => {
        console.log('record', record);
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerTable,
        handleSuccess,
        handleEdit,

        reload,
        getHqlQueryDto,
        exportDisabled,
        exportFileName,
        ExportTypeEnum,
        ExportColumnMap,
        ExportColumnKeyEnum,
        DataColumn,
      };
    },
  });
</script>
