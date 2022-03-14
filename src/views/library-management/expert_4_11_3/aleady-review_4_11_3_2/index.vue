<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button>
          <a
            :href="`${publicPath}resource/template/zhuanjia.xlsx`"
            download="专家模板.xlsx"
            class="pos-absolute"
            style="width: 100%; height: 100%; left: 0; top: 0"
            >下载专家模板</a
          >
        </a-button>
        <a-button preIcon="carbon:cloud-upload" @click="importUser"> 导入专家 </a-button>
        <a-button type="primary" @click="handleCreateRole"> 添加专家 </a-button>
        <LxBasicExportBtn
          :disabled="!ifDisabled"
          :exportType="ExportTypeEnum.EXPERT"
          :exportExcelDto="{
            fileName: '专家',
            sheetName: '专家',
            ifShowTotal: true,
            listDataColumn: [
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USER_PERNAME],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USER_SEXCODE],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USER_ACCOUNT],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USER_ORGNAME],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USEREXTEND_ACADEMICTITLE_NAME],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USEREXTEND_ACADEMICDATE],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USEREXTEND_SCH_NAME],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USEREXTEND_ACADEMICDEGREE_NAME],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USEREXTEND_EMAIL],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USER_MOBILE],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USER_USEMARK],
              ExportColumnMap[ExportColumnKeyEnum.EXPERT_USER_ADDDATE],
            ],
          }"
          :reloadTableFn="reload"
          :getHqlQueryDtoFn="getHqlQueryDto"
        />
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '编辑',
              color: 'blue',
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: '',
              label: '重置密码',
              onClick: resetPassword.bind(null, record),
            },
            {
              icon: '',
              label: record.user.useMark == 0 ? '正常' : '黑名单',
              color: record.user.useMark == 0 ? 'success' : 'black',
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
    <EditRoleDrawerVue @register="registerDrawer" @success="handleSuccess" />
    <!-- 导入专家 -->
    <UploadTemplate @register="registerModal" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { toRaw } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import UploadTemplate from './UploadTemplate.vue';
  import EditRoleDrawerVue from './components/EditRoleDrawer.vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { roleListTableSchema, roleSearchFormSchema } from './schemas';
  import { useModal } from '/@/components/Modal/src/hooks/useModal';
  import {
    deleteUser,
    updatePassword,
    getUserExtendPageList,
    updateUserUseMark,
  } from '/@/api/libraryManager/libExpert';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { encryptByMd5 } from '/@/utils/cipher';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  const ifDisabled = ref<any>(null);
  const { createConfirm, createMessage, createConfirmPromise } = useMessage();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
  const [registerModal, { openModal }] = useModal();
  const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'user.approveStatus', type: 'equal', value: [1] },
        { param: 'user.ifDelete', type: 'equal', value: [0] },
        {
          param: 'user.role',
          type: 'or',
          value: [orParamsFormatter('(user.role=3 or user.ifSchoolExpert=1)')],
        },
      ],
      ifCustomHql: true,
      dataFieldList: ['user', 'userExtend', 'user.id'],
      sorts: [{ dir: 'desc', prop: 'user.id' }],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '专家已审核列表',
    api: getUserExtendPageList,
    columns: roleListTableSchema,
    formConfig: {
      labelWidth: 130,
      schemas: roleSearchFormSchema,
      autoSubmitOnEnter: true,
    },
    beforeFetch: (queryInfo: any) => {
      resetHqlQueryDto(); // 先重置
      if (queryInfo.page && queryInfo.pageSize) {
        setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
      }
      if (queryInfo.perName) {
        appendQueryList({ param: 'user.perName', type: 'like', value: [queryInfo.perName] });
      }
      if (queryInfo.mobile) {
        appendQueryList({ param: 'user.mobile', type: 'like', value: [queryInfo.mobile] });
      }
      const queryDto = getHqlQueryDto();
      return queryDto;
    },
    afterFetch: (data) => {
      ifDisabled.value = data.length ? true : false;
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
      width: 270,
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      slots: {
        customRender: 'action',
      },
    },
  });
  // 创建
  const handleCreateRole = () => {
    openDrawer(true, {
      isUpdate: false,
    });
  };
  // 导入用户
  const importUser = () => {
    openModal(true);
  };
  // 编辑
  const handleEdit = (record) => {
    openDrawer(true, {
      isUpdate: true,
      record: toRaw(record.user),
      userExtend: toRaw(record.userExtend),
    });
  };
  // 重置密码
  const resetPassword = async (record) => {
    try {
      createConfirm({
        iconType: 'warning',
        title: '提示',
        content: '确定重置密码为‘ysjx012345’吗？',
        onOk: async () => {
          await updatePassword({
            id: record.user.id,
            password: encryptByMd5('ysjx012345'),
          });
          await reload();
          createMessage.success('重置密码成功');
        },
        onCancel: () => {
          createMessage.info('已取消重置密码');
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  // 黑名单
  const handleStatus = async (record: Recordable) => {
    const userId = toRaw(record).user.id;
    const userUseMark = toRaw(record).user.useMark === 0 ? '1' : '0';
    await updateUserUseMark({ id: userId, useMark: userUseMark });
    createMessage.success(userUseMark === '0' ? '加入黑名单成功！' : '移除黑名单成功！');
    await reload();
  };
  // 删除
  const handleDelete = async (record) => {
    await createConfirmPromise({
      content: '确认删除吗？',
    });
    const userId = toRaw(record.user.id);
    const ifSchoolExpert = toRaw(record.user.ifSchoolExpert);
    await deleteUser({ id: userId, ifSchoolExpert: ifSchoolExpert });
    createMessage.success('删除成功！');
    reload();
  };
  /**
   * 保存成功回调
   */
  const handleSuccess = () => {
    reload(); // 回调列表数据
  };
</script>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  export default defineComponent({
    name: 'RoleManagement',
  });
</script>
