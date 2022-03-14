<template>
  <div style="padding: 16px">
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 添加报名供应商</a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '删除',
              color: 'error',
              onClick: handleDelete.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <SetUpEnterTheRegisteredSupplier @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns } from './enterTheRegisteredSupplier.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import SetUpEnterTheRegisteredSupplier from './components/setUpEnterTheRegisteredSupplier.vue';
  import {
    getRegisteredSupplierPageByQueryDto,
    deleteRegisteredSupplierById,
  } from '/@/api/inProcurement/inProcurementApi';

  export default defineComponent({
    name: 'enterTheRegisteredSupplier',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
      SetUpEnterTheRegisteredSupplier,
    },
    setup() {
      const { createMessage, createConfirmPromise } = useMessage();
      const route = useRoute();
      let id = Number(route.query.id);
      let selectList = ref<any>(null);
      const [registerDrawer, { openDrawer }] = useDrawer();
      // 组织查询参数
      const { getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          queryList: [
            { param: 'registeredSupplier.ifDelete', type: 'equal', value: [0] },
            {
              param: 'registeredSupplier.bidSectionId',
              type: 'equal',
              value: [id],
            },
          ],
          dataFieldList: ['registeredSupplier', 'registeredSupplier.id'],
          sorts: [
            { dir: 'desc', prop: 'registeredSupplier.addDateTime' },
            {
              dir: 'desc',
              prop: 'registeredSupplier.id',
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
        const queryDto = getHqlQueryDto();
        console.log('🚀 ~ file: index.vue ~ line 66 ~ queryDto', queryDto);
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        selectList = data.map((item) => item.registeredSupplier);
        return selectList;
      };
      const [registerTable, { reload }] = useTable({
        title: '录入报名供应商列表',
        api: getRegisteredSupplierPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        // useSearchForm: true, // 使用搜索表单
        rowKey: 'id',
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
          width: 100,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: undefined,
        },
      });
      function handleCreate() {
        let selectId = <any>[];
        selectList.map((item) => {
          selectId.push(item.successfulSupplier.id);
        });
        openDrawer(true, {
          id,
          selectId,
        });
      }
      // 删除
      async function handleDelete(record: Recordable) {
        try {
          await createConfirmPromise({
            content: '确认删除吗？',
          });
          await deleteRegisteredSupplierById(record.id);
          await reload();
          createMessage.success('删除成功');
        } catch (error) {
          console.log('error：', error);
        }
      }

      function handleSuccess() {
        reload();
      }
      return {
        registerTable,
        registerDrawer,
        handleDelete, // 确认删除
        handleCreate,
        handleSuccess,
      };
    },
  });
</script>
