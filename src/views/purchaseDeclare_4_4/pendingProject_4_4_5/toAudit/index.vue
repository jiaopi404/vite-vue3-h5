<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- <template #toolbar>
        <a-button @click="openDrawer">fun</a-button>
      </template> -->
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '处理项目',
              color: 'success',
              onClick: handleEditor.bind(null, record),
            },
            {
              label: '转交',
              onClick: handleTransfer.bind(null, record),
              ifShow: ifShowTransferBtn,
            },
          ]"
        />
      </template>
    </BasicTable>
    <ToAuditDrawer @register="registerDrawer" @success="handleSuccess" />
    <!-- 转交 Drawer -->
    <LxTransferDrawer @register="registerDrawer2" :objectType="1" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  /**
   * 待审核
   * toAudit
   * purchaseDeclare_4_4/pendingProject_4_4_5/toAudit/index.vue
   */
  import { defineComponent, ref, unref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './ToAudit.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import ToAuditDrawer from './components/ToAuditDrawer.vue';
  import LxTransferDrawer from '/@/components/LxComponents/LxTransfer/LxTransferDrawer.vue';

  import { getProjectPageByQueryDto } from '/@/api/purchaseDeclare/pendingProjectApi';

  export default defineComponent({
    components: { BasicTable, TableAction, ToAuditDrawer, LxTransferDrawer },
    setup() {
      const { createMessage } = useMessage();
      const userStore = useUserStore();
      const ifShowTransferBtn = ref<boolean>(false); //是否显示 转交按钮
      ifShowTransferBtn.value = [1, 5].includes(userStore.getUserInfo.role) ? false : true;

      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerDrawer2, { openDrawer: openDrawer2 }] = useDrawer();

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
        title: '待审核列表',
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
          // 表格右侧操作列配置 BasicColumn
          width: unref(ifShowTransferBtn.value) ? 150 : 120,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      const handleEditor = (record: any) => {
        openDrawer(true, {
          projectId: record.id,
          projectName: record.proName,
        });
      };

      // 转交项目
      const handleTransfer = (record: any) => {
        openDrawer2(true, {
          objectId: record.id,
          biddingDepartmentId: record.biddingDepartmentId,
        });
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerDrawer,
        openDrawer,
        registerDrawer2,
        openDrawer2,
        registerTable,
        handleEditor,
        handleTransfer,
        handleSuccess,
        userStore,
        ifShowTransferBtn,
      };
    },
  });
</script>
