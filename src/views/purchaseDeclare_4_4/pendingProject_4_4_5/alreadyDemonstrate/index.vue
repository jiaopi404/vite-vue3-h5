<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- <template #toolbar>
        <a-button @click="openDrawer">fun</a-button>
      </template> -->
    </BasicTable>
    <!-- <ToDemonstrateDrawer @register="registerDrawer" @success="handleSuccess" /> -->
  </div>
</template>
<script lang="ts">
  /**
   * 已论证
   * alreadyDemonstrate
   * purchaseDeclare_4_4/pendingProject_4_4_5/alreadyDemonstrate/index.vue
   */
  import { defineComponent, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './alreadyDemonstrate.data';

  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';

  import { getMultiProjectPageByQueryDto } from '/@/api/purchaseDeclare/pendingProjectApi';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
    },
    setup() {
      const { createMessage } = useMessage();

      const [registerDrawer, { openDrawer }] = useDrawer();

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

      const [registerTable, { reload }] = useTable({
        title: '已论证列表',
        api: getMultiProjectPageByQueryDto,
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
        //   // 表格右侧操作列配置 BasicColumn
        //   width: 120,
        //   title: '操作',
        //   dataIndex: 'action',
        //   fixed: 'right',
        //   slots: {
        //     customRender: 'action',
        //   },
        // },
      });

      const handleEditor = (record: any) => {
        openDrawer(true, {
          proName: record.proName,
          id: record.id,
        });
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }
      return {
        registerDrawer,
        registerTable,
        handleEditor,
        handleSuccess,
        openDrawer,
      };
    },
  });
</script>
