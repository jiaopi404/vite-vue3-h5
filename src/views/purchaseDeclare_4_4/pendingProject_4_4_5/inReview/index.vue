<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- <template #toolbar>
        <a-button @click="openDrawer"> fun </a-button>
      </template> -->
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看审核流',
              onClick: handleEditor.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <!-- <InReviewDrawer @register="registerDrawer" @success="handleSuccess" /> -->
    <AuditProcessDrawer
      @register="registerDrawer"
      :minHeight="100"
      :ifTodoTask="false"
      @success="handleSuccess"
    />
  </div>
</template>
<script lang="ts">
  /**
   * 审核中
   * inReview
   * purchaseDeclare_4_4/pendingProject_4_4_5/inReview/index.vue
   */
  import { defineComponent, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useConfigStore } from '/@/store/modules/config';
  import { columns, searchFormSchema, pageAndSort } from './InReview.data';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import InReviewDrawer from './components/InReviewDrawer.vue';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';

  import { getProjectPageByQueryDto } from '/@/api/purchaseDeclare/pendingProjectApi';
  import { getActRuTaskByProcessId } from '/@/api/auditMangement/auditMangement';

  export default defineComponent({
    components: { BasicTable, TableAction, InReviewDrawer, AuditProcessDrawer },
    setup() {
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
        title: '审核中列表',
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
          width: 120,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      // 查看审核流
      async function handleEditor(record: Recordable) {
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
        openDrawer,
        registerTable,
        registerDrawer,
        handleEditor,
        handleSuccess,
      };
    },
  });
</script>
