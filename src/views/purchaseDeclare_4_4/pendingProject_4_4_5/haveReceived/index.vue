<template>
  <div>
    <BasicTable @register="registerTable"> </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 已接收
   * haveReceived
   * purchaseDeclare_4_4/pendingProject_4_4_5/haveReceived/index.vue
   */
  import { defineComponent, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useConfigStore } from '/@/store/modules/config';
  import { columns, searchFormSchema, pageAndSort } from './HaveReceived.data';

  import { BasicTable, useTable, TableAction } from '/@/components/Table';

  import {
    getProjectPageByQueryDto,
    getDictionaryByParentIdAndCode,
  } from '/@/api/purchaseDeclare/pendingProjectApi';

  export default defineComponent({
    components: { BasicTable, TableAction },
    setup() {
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
        appendQueryListByQueryInfoValuePlain('project.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain(
          'project.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );
        setSortByQueryInfo(queryInfo, 'project');
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.project);
      };
      // 在请求之前处理搜索条件参数
      const handleSearchInfoFn = (data) => {
        console.log('搜索条件：', data);
      };

      const [registerTable, { reload }] = useTable({
        title: '已接收列表',
        api: getProjectPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'id',
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          // alwaysShowLines: 2,
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

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerTable,
        handleSuccess,
      };
    },
  });
</script>
