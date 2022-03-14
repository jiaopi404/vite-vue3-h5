<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 添加合同模板 </a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '编辑',
              onClick: handleEdit.bind(null, record),
            },
            {
              label: '添加',
              ifShow: (_action) => {
                return record.leafLevel < 3;
              },
              onClick: handleAdd.bind(null, record),
              disabled: record.ifShow === 0 ? true : false,
            },
            {
              label: '删除',
              color: 'error',
              onClick: handleDelete.bind(null, record),
            },
            {
              label: '预览',
              ifShow: (_action) => {
                return record.leafLevel == 1;
              },
              onClick: handlepre.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <addContract @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, toRaw } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useRouter } from 'vue-router';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import addContract from './components/addContract.vue';
  // 配置数据
  import { columns, searchFormSchema } from './contract.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { cloneDeep } from 'lodash-es';
  import {
    getDocumentTemplatePageTreeList,
    deleteDocumentTemplateById,
  } from '/@/api/templateManagement/templateManagementApi';
  export default defineComponent({
    name: 'contractModel',
    components: {
      BasicTable,
      TableAction,
      addContract,
    },
    setup() {
      const router = useRouter();
      const { createMessage, createConfirmPromise } = useMessage();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          ifCustomHql: true,
          sorts: [{ dir: 'asc', prop: 'id' }],
          queryList: [
            { param: 'documentTemplate.ifDelete', type: 'equal', value: [0] },
            { param: 'documentTemplate.type', type: 'equal', value: [2] },
          ],
          dataFieldList: ['documentTemplate', 'documentTemplate.id'],
        },
      });
      // 请求之前对参数进行处理
      const beforeFetch = (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        if (queryInfo.content) {
          appendQueryList({
            param: 'documentTemplate.content',
            type: 'like',
            value: [queryInfo.content],
          });
        }
        const queryDto = getHqlQueryDto();
        console.log('🚀 ~ file: index.vue ~ line 66 ~ queryDto', queryDto);
        return queryDto;
      };
      //获取表格数据
      const [registerTable, { reload }] = useTable({
        title: '合同模板列表',
        api: getDocumentTemplatePageTreeList,
        isTreeTable: true,
        columns: columns(),
        rowKey: 'id',
        bordered: true,
        ellipsis: true,
        expandIcon: null,
        showIndexColumn: true,
        beforeFetch,
        afterFetch: (data) => {
          const tableData: any = cloneDeep(data);
          deleteChildren(tableData);
          console.log(tableData);
          return tableData;
        },
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
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
          fixed: undefined,
        },
      });

      function deleteChildren(arr) {
        arr.forEach((item) => {
          if (item.children.length) {
            deleteChildren(item.children);
          } else {
            delete item.children;
          }
        });
      }
      // 创建
      function handleCreate() {
        openDrawer(true, {
          isUpdate: false,
          isAdd: true,
          record: {
            leafLevel: 0,
          },
        });
      }
      // 编辑
      function handleEdit(record: Recordable) {
        openDrawer(true, {
          record,
          isUpdate: true,
        });
      }
      // 添加
      function handleAdd(record: Recordable) {
        openDrawer(true, {
          record,
          isUpdate: false,
          isAdd: true,
        });
      }
      // 删除
      async function handleDelete(record: Recordable) {
        try {
          await createConfirmPromise({
            content: '确认删除吗？',
          });
          const id: number = toRaw(record).id;
          await deleteDocumentTemplateById(id);
          await reload();
          createMessage.success('删除成功');
        } catch (error) {
          console.log('删除error：', error);
        }
      }
      // 预览
      function handlepre(record: Recordable) {
        router.push({ path: '/previewtemplate', query: { id: record.id } });
      }
      //成功的回调
      function handleSuccess() {
        reload();
      }

      return {
        registerTable,
        registerDrawer,
        handleCreate,
        handleEdit,
        handleAdd,
        handleDelete,
        handleSuccess,
        handlepre,
      };
    },
  });
</script>
