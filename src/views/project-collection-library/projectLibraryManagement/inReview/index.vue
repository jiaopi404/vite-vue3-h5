<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar> </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '查看审核流',
              onClick: handleEdit.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <AuditProcessDrawer @register="registerDrawer" :minHeight="100" />
  </div>
</template>
<script lang="ts">
  /**
   * 审核中
   * inReview
   * project-collection-library/projectLibraryManagement/inReview/index.vue
   */
  import { defineComponent, ref } from 'vue';
  // import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './inReview.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { getProBudgetPageByQueryDto } from '/@/api/projectManagement/projectCollectionLibraryApi';
  import { getActRuTaskByProcessId } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      AuditProcessDrawer,
    },
    setup() {
      // const userStore = useUserStore();
      const configStore = useConfigStore();
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
        title: '审核中列表',
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
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 120,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      // const handleEdit = (record) => {
      //   console.log('record', record);
      // };
      // 查看审核流
      async function handleEdit(record: Recordable) {
        console.log('流程ID：', record.processId);
        const res = await getActRuTaskByProcessId(record.processId);
        openDrawer(true, {
          ID_: res.data.ID_ ? res.data.ID_ : '',
          PROC_INST_ID_: res.data.PROC_INST_ID_ ? res.data.PROC_INST_ID_ : '',
          FILENAME: res.data.DGRM_RESOURCE_NAME_ ? res.data.DGRM_RESOURCE_NAME_ : '',
        });
      }

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerTable,
        registerDrawer,
        handleSuccess,
        handleEdit,
      };
    },
  });
</script>
