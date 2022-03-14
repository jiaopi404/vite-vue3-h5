<template>
  <div>
    <BasicTable @register="registerTable" ref="refForm">
      <template #toolbar> </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '上传',
              color: 'warning',
              // 根据业务控制是否禁用
              disabled:
                record?.procurementMethod?.node === '2' &&
                record?.organizationalForm?.code === '5' &&
                record.status.code === '16'
                  ? false
                  : true,
              onClick: handleUpload.bind(null, record),
            },
            {
              label: '设为待成交',
              color: 'warning',
              // 根据业务控制是否禁用
              disabled:
                record?.procurementMethod?.node === '2' &&
                record?.organizationalForm?.code === '5' &&
                record.status.code === '16'
                  ? false
                  : true,
              onClick: handleSetUp.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <uploadFile @register="registerDrawer" @success="handleSuccess"></uploadFile>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns, searchFormSchema } from './toBePurchased.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    getProjectPage,
    getOneByproId,
    setAsPendingTransaction,
  } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { useUserStore } from '/@/store/modules/user';
  import uploadFile from './components/uploadFile.vue';
  import { getCusConfirmTip } from '/@/enums/messageEnum';
  export default defineComponent({
    name: 'toBePurchased',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
      uploadFile,
    },
    setup() {
      const { createMessage, createConfirmPromise } = useMessage();
      const userInfo = useUserStore().getUserInfo;
      const [registerDrawer, { openDrawer }] = useDrawer();
      // 组织查询参数
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            queryList: [
              { param: 'project.ifDelete', type: 'equal', value: [0] },
              {
                param: 'project.status.code',
                type: 'in',
                value: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
              },
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
        console.log('queryInfo', queryInfo);
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
        if (queryInfo?.procurementMethod) {
          appendQueryList({
            param: 'project.procurementMethod.id',
            type: 'equal',
            value: [queryInfo.procurementMethod],
          });
        }
        if (queryInfo?.field == 'planPurchaseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `project.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo?.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `project.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        const queryDto: any = getHqlQueryDto();
        if (queryDto?.hqlPageAndSortSumDto?.sumList) {
          delete queryDto?.hqlPageAndSortSumDto?.sumList;
        }
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        const tableData: any[] = [];
        data.forEach((item) => {
          tableData.push(item.project);
        });
        return tableData;
      };
      const [registerTable, { reload }] = useTable({
        title: '待采购列表',
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
          width: 140,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: undefined,
        },
      });
      // 上传附件
      function handleUpload(record: Recordable) {
        openDrawer(true, {
          record,
        });
      }
      // 设为待成交
      async function handleSetUp(record: Recordable) {
        try {
          const res = await getOneByproId(record.id);
          if (!res.ifUploadProcurementDocuments) {
            // 未上传附件
            createMessage.error('请先上传零星采购备案表！');
            return;
          }
          await createConfirmPromise({
            content: getCusConfirmTip('设为待成交'),
          });
          const show = await setAsPendingTransaction(res.id, 0);
          if (!show.msg) {
            createMessage.success('更新成功');
          } else {
            createMessage.warn(show.msg);
          }
          reload();
        } catch {}
      }
      // 保存成功回调
      function handleSuccess() {
        reload();
      }
      return {
        registerTable,
        registerDrawer,
        handleUpload,
        handleSetUp,
        handleSuccess,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 12vw);
  }
</style>
