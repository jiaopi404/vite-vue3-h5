<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 添加常用下载 </a-button>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '下载',
              onClick: handleDownload.bind(null, record),
            },
            {
              icon: '',
              label: record.commonFile.useMark == 0 ? '启用' : '禁用',
              color: record.commonFile.useMark == 0 ? 'success' : 'black',
              onClick: handleStatus.bind(null, record),
            },
            {
              icon: '',
              label: '删除',
              color: 'error',
              onClick: handleDelete.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <DownloadDrawer @register="register" @success="handleSuccess" />
  </div>
</template>

<script lang="ts">
  import DownloadDrawer from './DownloadDrawer.vue';
  import { defineComponent, toRaw } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { downloadTableScheam, downloadSearchFormSchema } from './download.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { previewFile } from '/@/utils/commonServe/businessUtil';
  import {
    getCommonFilePageByQueryDto,
    updateCommonFileUseMark,
    deleteCommonFileById,
    getCommonFileById,
    UpDateAmount,
  } from '/@/api/download/download';

  export default defineComponent({
    name: 'downloadList',
    components: { BasicTable, TableAction, DownloadDrawer },
    setup() {
      const { createMessage, createConfirmPromise } = useMessage();
      const [register, { openDrawer }] = useDrawer();
      // 查询参数初始化
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          queryList: [{ param: 'commonFile.ifDelete', type: 'equal', value: [0] }],
          dataFieldList: ['commonFile', 'commonFile.id', 'dictionary.name'],
          sorts: [{ dir: 'desc', prop: 'commonFile.id' }],
        },
      });
      const [registerTable, { reload }] = useTable({
        title: '常用下载列表',
        api: getCommonFilePageByQueryDto,
        columns: downloadTableScheam(),
        rowKey: 'commonFile_id',
        formConfig: {
          labelWidth: 120,
          schemas: downloadSearchFormSchema(),
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
        showTableSetting: true,
        // 查询参数设置
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          if (queryInfo.page && queryInfo.pageSize) {
            setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
          }
          if (queryInfo.name) {
            appendQueryList({ param: 'commonFile.name', type: 'like', value: [queryInfo.name] });
          }
          if (queryInfo.useMark) {
            appendQueryList({
              param: 'commonFile.useMark',
              type: 'equal',
              value: [queryInfo.useMark],
            });
          }
          const queryDto = getHqlQueryDto();
          return queryDto;
        },
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
          width: 100,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: 'right',
        },
      });

      // 添加常用下载
      function handleCreate() {
        openDrawer(true, {});
      }

      // 下载-操作
      // const handleDownload = async (record: Recordable) => {
      //   try {
      //     const downloadId = toRaw(record).commonFile.id;
      //     const res = await getCommonFileById(downloadId);
      //     if (res.attach) {
      //       let a = document.createElement('a');
      //       a.target = '_blank';
      //       a.href = res.attach;
      //       // a.download = res.name;
      //       a.click();
      //       // 下载次数加一
      //       UpDateAmount(downloadId);
      //       await reload();
      //       document.body.removeChild(a);
      //     }
      //   } catch (err) {
      //     console.log('err is', err);
      //   } finally {
      //     reload();
      //   }
      // };

      // 下载-操作
      const handleDownload = (record: Recordable) => {
        const downloadId = toRaw(record).commonFile.id;
        previewFile({ name: record.commonFile.name, url: record.commonFile.attach });
        UpDateAmount(downloadId);
        reload();
      };

      // 启用禁用
      const handleStatus = async (record: Recordable) => {
        const downloadId = toRaw(record).commonFile.id;
        const downloadUseMark = toRaw(record).commonFile.useMark === 0 ? 1 : 0;
        await updateCommonFileUseMark({ id: downloadId, useMark: downloadUseMark });
        createMessage.success(downloadUseMark === 0 ? '禁用成功！' : '启用成功！');
        await reload();
      };

      // 删除-操作
      const handleDelete = async (record: Recordable) => {
        await createConfirmPromise({
          content: '确认删除吗？',
        });
        const downloadId = toRaw(record).commonFile.id;
        await deleteCommonFileById(downloadId);
        createMessage.success('删除成功！');
        await reload();
      };

      // 保存成功回调
      function handleSuccess() {
        reload();
      }

      return {
        register,
        registerTable,
        handleCreate,
        handleStatus,
        handleDownload,
        handleDelete,
        handleSuccess,
      };
    },
  });
</script>
