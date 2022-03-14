<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <LxBasicExportBtn
          :disabled="!ifDisabled"
          :exportType="ExportTypeEnum.PROJECT"
          :exportExcelDto="{
            fileName: '采购意向公开',
            sheetName: '采购意向公开',
            ifShowTotal: false,
            listDataColumn: [
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_PRONAME],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_PURCHASENUMBER],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_BUDGETAMOUNT],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_PROJECTTYPE],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_PLANPURCHASETIME],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_DECLAREDEPT],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_USER],
              ExportColumnMap[ExportColumnKeyEnum.PROJECT_SUMMARY_ADDDATETIME],
            ],
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="getHqlQueryDto"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns, searchFormSchema } from './itemList.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getProjectPage, getDepartmentStringById } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    name: 'completed',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
      AuditProcessDrawer,
      LxBasicExportBtn,
    },
    setup() {
      const ifDisabled = ref<any>(null);
      // 组织查询参数
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            queryList: [
              { param: 'project.ifDelete', type: 'equal', value: [0] },
              {
                param: 'project.status.code',
                type: 'in',
                // value: [8],
                value: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
              },
              { param: 'project.projectAdditionPhase', type: 'in', value: [1, 2, 3] },
            ],
            dataFieldList: ['project', 'project.id'],
            sorts: [
              {
                dir: 'desc',
                prop: 'project.updateDateTime',
              },
              {
                dir: 'desc',
                prop: 'project.id',
              },
            ],
          },
        });
      // 请求之前对参数进行处理
      const beforeFetch = (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        if (queryInfo.page && queryInfo.pageSize) {
          setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
        }
        if (queryInfo.proName) {
          appendQueryList({
            param: 'project.proName',
            type: 'like',
            value: [queryInfo.proName],
          });
        }
        if (queryInfo.projectType) {
          appendQueryList({
            param: 'project.projectType.id',
            type: 'equal',
            value: [queryInfo.projectType],
          });
        }
        if (queryInfo.declareDept) {
          appendQueryList({
            param: 'project.declareDept',
            type: 'in',
            value: [queryInfo.declareDept],
          });
        }
        if (queryInfo.planPurchaseTime) {
          queryInfo.planPurchaseTime = queryInfo.planPurchaseTime.slice(0, 10) + ' ' + '23:59:59';
          appendQueryList({
            param: 'project.planPurchaseTime',
            type: 'le',
            value: [queryInfo.planPurchaseTime],
          });
        }
        if (queryInfo.field == 'planPurchaseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `project.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `project.${queryInfo.field}`,
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
        const tableData: any[] = [];
        data.forEach((item) => {
          tableData.push(item.project);
        });
        ifDisabled.value = tableData.length ? true : false;
        return tableData;
      };
      const [registerTable, { reload }] = useTable({
        title: '项目列表',
        api: async (params) => {
          try {
            const queryItem = params.hqlPageAndSortSumDto.queryList.find(
              (item) => item.param === 'project.declareDept',
            );
            if (queryItem) {
              let res = await getDepartmentStringById(queryItem.value[0]);
              let msg = res.msg;
              queryItem.value[0] = msg;
            }
            return await getProjectPage(params);
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        useSearchForm: true, // 使用搜索表单
        rowKey: 'id',
        formConfig: {
          // 表单配置，参考表单组件的 Props
          labelWidth: 120,
          schemas: searchFormSchema(),
          autoSubmitOnEnter: true,
        },
        handleSearchInfoFn: (data) => {
          console.log('搜索条件：', data);
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
      });

      // console.log(123, 'ifDisabledifDisabledifDisabled');
      return {
        registerTable,
        reload,
        getHqlQueryDto,
        ExportColumnKeyEnum,
        ExportColumnMap,
        ExportTypeEnum,
        ifDisabled,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 1vw);
  }
</style>
