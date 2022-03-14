<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" :disabled="checkedKeys.length <= 1" @click="handleDisposeAll">
          批量处理项目
        </a-button>
        <!-- <a-button @click="fun"> fun </a-button> -->
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '处理项目',
              onClick: handleDispose.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <ToReceiveDrawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  /**
   * 采购申报》待处理项目》待接收
   * toReceive
   * purchaseDeclare_4_4/pendingProject_4_4_5/toReceive/index.vue
   */
  import { defineComponent, ref, toRaw } from 'vue';
  // import { useUserStore } from '/@/store/modules/user';
  // import { useMessage } from '/@/hooks/web/useMessage';
  // import { useConfigStore } from '/@/store/modules/config';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './ToReceive.data';

  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import ToReceiveDrawer from './components/ToReceiveDrawer.vue';

  import {
    getProjectPageByQueryDto,
    getDictionaryByParentIdAndCode,
  } from '/@/api/purchaseDeclare/pendingProjectApi';

  export default defineComponent({
    components: { BasicTable, TableAction, ToReceiveDrawer },
    setup() {
      const checkedKeys = ref<Array<string | number>>([]);
      // const userStore = useUserStore();
      // const configStore = useConfigStore();
      // const { createMessage } = useMessage();

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
      // 在请求之前处理搜索条件参数
      const handleSearchInfoFn = (data) => {
        console.log('搜索条件：', data);
      };

      const [registerTable, { reload }] = useTable({
        title: '待接收列表',
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
        clickToRowSelect: false,
        rowSelection: {
          type: 'checkbox',
          // selectedRowKeys: checkedKeys, // 指定选中项的 key 数组，需要和 onChange 进行配合
          onChange: onSelectChange,
        },
      });

      // 单个处理
      const handleDispose = (record: any) => {
        openDrawer(true, {
          projectIds: [record.id],
          projectName: record.proName,
        });
      };
      // 批量处理
      const handleDisposeAll = () => {
        openDrawer(true, {
          projectIds: toRaw(checkedKeys.value),
          projectName: '',
        });
      };

      // 表格可选择
      function onSelectChange(selectedRowKeys: (string | number)[]) {
        console.log(selectedRowKeys);
        checkedKeys.value = selectedRowKeys;
      }

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        checkedKeys,
        onSelectChange,
        registerDrawer,
        registerTable,
        handleDispose,
        handleDisposeAll,
        handleSuccess,
      };
    },
  });
</script>
