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
              onClick: handleUpload.bind(null, record),
              // 根据业务控制是否禁用
              disabled:
                record?.procurementMethod?.node === '2' &&
                record?.project?.organizationalForm?.code === '1' &&
                record.status.code === '16'
                  ? false
                  : true,
            },
            {
              label: '设为待成交',
              color: 'warning',
              onClick: handleSetUp.bind(null, record),
              // 根据业务控制是否禁用
              disabled:
                record?.procurementMethod?.node === '2' &&
                record?.project?.organizationalForm?.code === '1' &&
                record.status.code === '16'
                  ? false
                  : true,
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
  import { getCusConfirmTip } from '/@/enums/messageEnum';
  import { useUserStore } from '/@/store/modules/user';
  import { setAsPendingTransaction } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  import uploadFile from './components/uploadFile.vue';
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
              { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
              {
                param: 'bidSection.status.code',
                type: 'in',
                value: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                  24,
                ],
              },
              { param: 'bidSection.project.relevantUserId', type: 'equal', value: [userInfo.id] },
            ],
            dataFieldList: ['bidSection', 'bidSection.id'],
            sorts: [
              {
                dir: 'desc',
                prop: 'bidSection.updateDateTime',
              },
              {
                dir: 'desc',
                prop: 'bidSection.id',
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
            param: 'bidSection.proName',
            type: 'like',
            value: [queryInfo.proName],
          });
        }
        if (queryInfo.proNumber) {
          appendQueryList({
            param: 'bidSection.proNumber',
            type: 'like',
            value: [queryInfo.proNumber],
          });
        }
        if (queryInfo.projectType) {
          appendQueryList({
            param: 'bidSection.project.projectType.id',
            type: 'equal',
            value: [queryInfo.projectType],
          });
        }
        if (queryInfo?.planUseTime) {
          queryInfo.planUseTime = queryInfo.planUseTime.slice(0, 10) + ' ' + '23:59:59';
          appendQueryList({
            param: 'bidSection.project.planUseTime',
            type: 'le',
            value: [queryInfo.planUseTime],
          });
        }
        if (queryInfo?.status) {
          appendQueryList({
            param: 'bidSection.status.code',
            type: 'equal',
            value: [queryInfo.status],
          });
        }
        // if (queryInfo?.procurementMethod) {
        //   appendQueryList({
        //     param: 'project.procurementMethod.id',
        //     type: 'equal',
        //     value: [queryInfo.procurementMethod],
        //   });
        // }
        if (queryInfo?.field == 'budgetAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo?.field == 'planUseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.project.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo?.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
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
        const tableData = data.map((item) => item.bidSection);
        return tableData;
      };
      const [registerTable, { reload }] = useTable({
        title: '待采购列表',
        api: getBidSectionPage,
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
          fixed: 'right',
        },
      });
      // 上传附件
      function handleUpload(record: Recordable) {
        console.log(record);
        openDrawer(true, {
          record,
        });
      }
      // 设为待成交
      async function handleSetUp(record: Recordable) {
        // console.log(record.ifUploadProcurementDocuments, 'record.ifUploadProcurementDocuments');
        if (!record.ifUploadProcurementDocuments) {
          // 未上传附件
          createMessage.error('请先上传零星采购备案表！');
          return;
        }
        // 待成交
        await createConfirmPromise({
          content: getCusConfirmTip('设为待成交'),
        });
        const show = await setAsPendingTransaction(record.id, 1);
        if (!show.msg) {
          createMessage.success('更新成功');
        } else {
          createMessage.warn(show.msg);
        }
        reload();
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
