<template>
  <div>
    <BasicTable @register="registerTable" ref="refForm">
      <template #toolbar> </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看审核流',
              onClick: handleEdit.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns, searchFormSchema } from './underReview.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getProjectPage } from '/@/api/projectManagement/projectManagementApi';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'underReview',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      const [registerDrawer, { openDrawer }] = useDrawer();
      // 组织查询参数
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            queryList: [
              { param: 'project.ifDelete', type: 'equal', value: [0] },
              { param: 'project.status.code', type: 'equal', value: [5] },
              { param: 'project.addUser', type: 'equal', value: [userInfo.id] },
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
        if (queryInfo.field == 'planUseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `project.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'planPurchaseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          console.log(queryInfo.order, 'queryInfo.order');
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
        console.log('待提交', tableData);
        return tableData;
      };
      const [registerTable, { reload }] = useTable({
        title: '审核中列表',
        api: getProjectPage,
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
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 200,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: undefined,
        },
        pagination: {
          pageSizeOptions: ['10', '20', '50'],
        },
      });
      // 编辑
      function handleEdit(record: Recordable) {
        openDrawer(true, {
          record,
          isUpdate: true,
        });
      }
      return {
        registerTable,
        registerDrawer,
        handleEdit,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 12vw);
  }
</style>
