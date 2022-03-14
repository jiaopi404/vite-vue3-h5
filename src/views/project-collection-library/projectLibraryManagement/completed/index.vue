<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar> </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 已完成
   * completed
   * project-collection-library/projectLibraryManagement/completed/index.vue
   */
  import { defineComponent, ref } from 'vue';
  // import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './completed.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { getProBudgetPageByQueryDto } from '/@/api/projectManagement/projectCollectionLibraryApi';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
    },
    setup() {
      // const userStore = useUserStore();
      const configStore = useConfigStore();
      const { createMessage } = useMessage();
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

        appendQueryListByQueryInfoValuePlain('proBudget.proName', 'like', queryInfo.proName);
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
        return data.map((item) => item.proBudget);
      };

      const [registerTable, { reload }] = useTable({
        title: '已完成列表',
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
      };
    },
  });
</script>
