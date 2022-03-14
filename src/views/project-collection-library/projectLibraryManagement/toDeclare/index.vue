<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="toAddProject">添加项目</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '编辑',
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: '',
              label: '删除',
              color: 'error',
              onClick: handleDelete.bind(null, record),
            },
            {
              icon: '',
              label: '申报',
              color: 'warning',
              onClick: handleDeclare.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 待申报
   * toDeclare
   * project-collection-library/projectLibraryManagement/toDeclare/index.vue
   */
  import { defineComponent, ref } from 'vue';
  // import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './toDeclare.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useRoute, useRouter } from 'vue-router';
  import {
    getProBudgetPageByQueryDto,
    deleteProBudgetById,
  } from '/@/api/projectManagement/projectCollectionLibraryApi';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      // const userStore = useUserStore();
      const configStore = useConfigStore();
      const { createMessage, createConfirm, createConfirmPromise } = useMessage();
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
        console.log('queryInfo===', queryInfo);
        setSortByQueryInfo(queryInfo);
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.proBudget);
      };

      const [registerTable, { reload }] = useTable({
        title: '待申报列表',
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
          width: 180,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      const handleEdit = (record) => {
        console.log('record', record);
        router.push({
          path: '/projectLibraryManagement/addProject',
          query: {
            projectId: record.id,
          },
        });
      };

      const toAddProject = () => {
        router.push({ path: '/projectLibraryManagement/addProject' });
      };

      const handleDelete = async (record) => {
        try {
          await createConfirmPromise({
            iconType: 'warning',
            title: '提示',
            content: `确认删除吗？`,
          });
          await deleteProBudgetById(record.id);
          await reload();
          createMessage.success('删除项目成功');
        } catch (err) {}
      };

      const handleDeclare = async (record) => {
        try {
          await createConfirmPromise({
            content: `确认申报吗？`,
          });
          console.log('record', record);
          await reload();
          createMessage.success('申报项目成功');
        } catch (err) {}
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerTable,
        handleSuccess,
        handleEdit,
        handleDelete,
        handleDeclare,
        toAddProject,
      };
    },
  });
</script>
