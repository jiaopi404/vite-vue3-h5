<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreate"> 发布通知公告 </a-button>
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
              label: '预览',
              color: 'warning',
              onClick: handlePreview.bind(null, record),
            },
            {
              icon: '',
              label: record.notice.useMark == 0 ? '启用' : '禁用',
              color: record.notice.useMark == 0 ? 'success' : 'black',
              onClick: handleStatus.bind(null, record),
            },
            {
              icon: '',
              label: '查看',
              onClick: handleOpenImg.bind(null, record),
            },
            {
              icon: '',
              label: record.notice.ifIndexShow === 0 ? '设为首页显示' : '取消首页显示',
              color: record.notice.ifIndexShow === 0 ? 'success' : 'warning',
              onClick: handleSetHomePage.bind(null, record),
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
    <EditNoticeDrawer @register="register" @success="handleSuccess" />
    <Modal @register="registerModal" @visible-change="handleClose" />
  </div>
</template>

<script lang="ts">
  import EditNoticeDrawer from './EditNoticeDrawer.vue'; // 编辑页面
  import Modal from './Modal.vue'; // 预览弹窗
  import { defineComponent, toRaw } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { useRouter } from 'vue-router';
  import { noticeListTableScheam, noticeSearchFormSchema } from './notice.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { createImgPreview } from '/@/components/Preview/index';
  import {
    updateNoticeById,
    updateNoticeUseMark,
    deleteNoticeById,
    getNoticePageByQueryDto,
  } from '/@/api/noticeManagement/noticeManagement';

  export default defineComponent({
    name: 'NoticeList',
    components: { BasicTable, TableAction, EditNoticeDrawer, Modal },
    setup() {
      const [register, { openDrawer }] = useDrawer();
      const [registerModal, { openModal: openModal }] = useModal();
      const { createMessage, createConfirmPromise } = useMessage();
      // 查询参数初始化
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          queryList: [{ param: 'notice.ifDelete', type: 'equal', value: [0] }],
          dataFieldList: ['notice', 'notice.id'],
          sorts: [{ dir: 'desc', prop: 'notice.id' }],
        },
      });
      const [registerTable, { reload }] = useTable({
        title: '通知公告列表',
        api: getNoticePageByQueryDto,
        columns: noticeListTableScheam(),
        rowKey: 'notice_id',
        formConfig: {
          labelWidth: 100,
          schemas: noticeSearchFormSchema(),
          autoSubmitOnEnter: true,
        },
        // 查询参数设置
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          if (queryInfo.page && queryInfo.pageSize) {
            setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
          }
          // 标题
          if (queryInfo.title) {
            appendQueryList({
              param: 'notice.title',
              type: 'like',
              value: [queryInfo.title],
            });
          }
          // 状态
          if (queryInfo.useMark === 0 || queryInfo.useMark === 1) {
            appendQueryList({
              param: 'notice.useMark',
              type: 'equal',
              value: [queryInfo.useMark],
            });
          }
          const queryDto = getHqlQueryDto();
          return queryDto;
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
        bordered: true,
        showIndexColumn: true,
        actionColumn: {
          width: 280,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: 'right',
        },
      });

      const router = useRouter();
      // 发布通知公告
      const handleCreate = () => {
        router.push('/notice-management_4_9/publishNotice_4_9_1');
      };

      // 操作-编辑
      const handleEdit = (record: Recordable) => {
        openDrawer(true, {
          record: toRaw(record),
          isUpdate: true,
        });
      };

      // 操作-预览
      const handlePreview = (record: Recordable) => {
        const previewId = toRaw(record).notice.id;
        openModal(true, { previewId });
      };

      // 关闭预览回调
      function handleClose() {
        reload();
      }

      // 操作-启用禁用
      const handleStatus = async (record: Recordable) => {
        const noticeId = toRaw(record).notice.id;
        const noticeUseMark = toRaw(record).notice.useMark === 0 ? 1 : 0;
        await updateNoticeUseMark({ id: noticeId, useMark: noticeUseMark });
        createMessage.success(noticeUseMark === 0 ? '禁用成功！' : '启用成功！');
        await reload();
      };

      // 操作-查看
      const handleOpenImg = async (record: Recordable) => {
        // 有图片时，查看图片
        if (toRaw(record).notice.pic) {
          createImgPreview({
            imageList: [toRaw(record).notice.pic + ''],
            defaultWidth: 700,
          });
        } else {
          // 没图片时提示
          createMessage.error('该公告未上传照片!');
        }
      };

      // 操作-设为首页
      const handleSetHomePage = async (record: Recordable) => {
        const noticeId = toRaw(record).notice.id;
        const ifHomeShow = toRaw(record).notice.ifIndexShow === 0 ? 1 : 0;
        await updateNoticeById({ id: noticeId, ifIndexShow: ifHomeShow });
        createMessage.success(ifHomeShow === 0 ? '取消首页显示！' : '设为首页显示！');
        await reload();
      };

      // 操作-删除
      const handleDelete = async (record: Recordable) => {
        await createConfirmPromise({
          content: '确认删除吗？',
        });
        const noticeId = toRaw(record).notice.id;
        await deleteNoticeById(noticeId);
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
        registerModal,
        handleCreate,
        handleEdit,
        handlePreview,
        handleClose,
        handleStatus,
        handleOpenImg,
        handleSetHomePage,
        handleDelete,
        handleSuccess,
      };
    },
  });
</script>
