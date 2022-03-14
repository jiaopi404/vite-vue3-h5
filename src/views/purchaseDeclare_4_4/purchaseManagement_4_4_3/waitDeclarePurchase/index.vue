<template>
  <div>
    <BasicTable @register="registerTable" @fetch-success="onFetchSuccess">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 项目申报 </a-button>
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
              color: 'error',
              label: '删除',
              onClick: handleDelete.bind(null, record),
            },
            {
              icon: '',
              color: 'success',
              loading: submitLoading,
              label: '申报',
              onClick: handleAdd.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, toRaw, nextTick, ref } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema } from './waitDeclare.data';
  import {
    deleteProjectById,
    getFundsCategoryById,
    getProjectPage,
    preservateOfficeExpenses,
    submitVerification,
    verificatePublicityDays,
  } from '/@/api/purchase/plan-purchase';
  import { useRouter } from 'vue-router';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { projectDeclare } from '/@/api/auditMangement/auditMangement';
  import { useConfigStore } from '/@/store/modules/config';
  import { useBusinessStore } from '/@/store/modules/business';
  export default defineComponent({
    name: 'WaitDeclarePurchase',
    components: {
      BasicTable,
      TableAction,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      const configStore = useConfigStore();
      const businessStore = useBusinessStore();
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            sorts: [
              { dir: 'desc', prop: 'project.updateDateTime' },
              { dir: 'desc', prop: 'project.id' },
            ],
            queryList: [
              { param: 'project.ifDelete', type: 'equal', value: [0] },
              { param: 'project.status.code', type: 'equal', value: [8] },
              { param: 'project.addUser', type: 'equal', value: [userInfo.id] },
            ],
            dataFieldList: ['project', 'project.id'],
          },
        });
      const [registerTable, { reload, setColumns, expandAll, collapseAll }] = useTable({
        title: '待申报列表',
        api: getProjectPage,
        columns,
        rowKey: 'id',
        bordered: true,
        expandIcon: null,
        showIndexColumn: true,
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          if (queryInfo.page && queryInfo.pageSize) {
            setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
          }
          if (!!queryInfo.proName) {
            appendQueryList({
              param: 'project.proName',
              type: 'like',
              value: [queryInfo.proName],
            });
          }
          if (!!queryInfo.purchaseType) {
            appendQueryList({
              param: 'project.projectType.id',
              type: 'equal',
              value: [queryInfo.purchaseType],
            });
          }
          if (queryInfo.field == 'planUseTime') {
            queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
            setSorts({
              prop: queryInfo.field,
              dir: queryInfo.order,
            });
          }
          if (queryInfo.field == 'planPurchaseTime') {
            queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
            setSorts({
              prop: queryInfo.field,
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
        },
        afterFetch: (data) => {
          const tableData: any[] = [];
          data.forEach((item) => {
            tableData.push(item.project);
          });
          console.log('待提交', tableData);
          return tableData;
        },
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema,
          // placeHolder: '请输入菜单名称',
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        showTableSetting: true,
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
        actionColumn: {
          width: 120,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: 'right',
        },
        defaultExpandAllRows: true,
      });
      const _list = ref([]);
      // onMounted(async () => {
      //   _list.value = await getDictionaryInfo();
      //   console.log("_list is ", _list);
      // });
      // interface Columns {
      //   [key: string]: any
      // }
      const format = (_text, record) => {
        const res = _list.value?.find((item) => {
          return (<any>item)?.id === record.tagModule;
        });
        return (<any>res)?.name;
      };
      function onFetchSuccess() {
        // 演示默认展开所有表项
        nextTick(() => {
          columns.forEach((col) => {
            if (col.dataIndex === 'tagModule') {
              col.format = format;
            }
          });
          setColumns(columns);
        });
      }
      const router = useRouter();
      // initMenuList();
      function handleCreate() {
        router.push('/purchaseManagement/declare');
      }

      function handleEdit(record: Recordable) {
        const proId = toRaw(record).id;
        router.push(`/purchaseManagement/declare?id=${proId}`);
      }

      const ifExpand = ref(true);
      function openExpand() {
        ifExpand.value = !ifExpand.value;
        expandAll();
      }
      function closeExpand() {
        ifExpand.value = !ifExpand.value;
        collapseAll();
      }
      const { createMessage, createConfirmPromise } = useMessage();

      const submitLoading = ref(false);
      async function handleAdd(record: Recordable) {
        try {
          submitLoading.value = true;
          const id: number = toRaw(record).id;
          if (
            toRaw(record).projectAdditionPhase !== 4 &&
            configStore?.GET_CONFIG_MODULE?.ifGovernmentProcurement
          ) {
            const vpd = await verificatePublicityDays(id);
            if (!vpd) {
              submitLoading.value = false;
              return createMessage.error('该项目还在公示期！');
            }
          }
          // let fundsCategory;
          // if (toRaw(record).fundsCategoryId) {
          //   const data = await getFundsCategoryById(toRaw(record).fundsCategoryId);
          //   fundsCategory = data;
          // }
          const error: any = await submitVerification({
            id: id,
            ifInitiateMethodAttachment: 1,
          });
          if (error.length > 0) {
            createMessage.error(error[0]);
          } else {
            await createConfirmPromise({
              content: '确认申报吗？',
            });
            // if (toRaw(record).budgetAmount < 10000 && !toRaw(record).ifMultiBidSection) {
            //   const res = await preservateOfficeExpenses(id);
            //   if (!res) {
            //     createMessage.success('提交成功！');
            //   }
            // } else {
            const res = await projectDeclare({
              objectId: id,
              code: '4',
              tagModuleId: businessStore.GET_TAG_MODULE_INFO?.id ?? -1,
              account: userInfo.account,
            });
            if (res) {
              createMessage.success('申报成功！');
            }
            // }
          }
          await reload();
          submitLoading.value = false;
        } catch (error) {
          submitLoading.value = false;
        }
      }

      async function handleDelete(record: Recordable) {
        try {
          await createConfirmPromise({
            content: '确认删除吗？',
          });
          const id: number = toRaw(record).id;
          // deleteTableDataRecord(id)
          const { msg } = await deleteProjectById({
            clickStage: 4,
            id: id,
          });
          if (msg) {
            createMessage.error(msg);
          } else {
            createMessage.success('删除成功！');
          }
          await reload();
        } catch (error) {}
      }

      function handleSuccess() {
        reload();
      }

      return {
        registerTable,
        handleCreate,
        handleEdit,
        handleAdd,
        handleDelete,
        handleSuccess,
        onFetchSuccess,
        submitLoading,
        ifExpand,
        openExpand,
        closeExpand,
      };
    },
  });

  function toRow(record: Recordable<any>): any {
    throw new Error('Function not implemented.');
  }
</script>
