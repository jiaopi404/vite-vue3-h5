<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar>
        <a-button type="primary" @click="handleCreateRole"> 添加招标公司 </a-button>
        <LxBasicExportBtn
          :disabled="!ifDisabled"
          :exportType="ExportTypeEnum.BIDDINGCOMPANY"
          :exportExcelDto="{
            fileName: '招标公司',
            sheetName: '招标公司',
            ifShowTotal: true,
            listDataColumn: [
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_NAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_ACCOUNT],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_LEGALPERNAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_LEGALPERCITID],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_LEGALPERTEL],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_USER_PERNAME],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_USER_SEXCODE],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_USER_CITID],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_USER_MOBILE],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_REGTEL],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_REGFUNAMOUNT],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_REGDATE],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_ADDRESS],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_DEPOSITBANK],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_BANKACCOUNT],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_USEMARK],
              ExportColumnMap[ExportColumnKeyEnum.BIDDINGCOMPANY_ADDDATE],
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
              onClick: handleEdit.bind(null, record),
            },
            {
              icon: '',
              label: '重置密码',
              onClick: resetPassword.bind(null, record),
            },
            {
              icon: '',
              label: record.biddingCompany.useMark == 0 ? '正常' : '黑名单',
              color: record.biddingCompany.useMark == 0 ? 'success' : 'black',
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
    <EditBiddingDrawerVue @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { toRaw } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import EditBiddingDrawerVue from './components/EditBiddingDrawer.vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { roleListTableSchema, roleSearchFormSchema } from './schemas';
  import {
    getBiddingCompanyPageByQueryDto,
    updateBiddingCompanyUseMark,
    deleteBiddingCompanyById,
  } from '/@/api/review-node/biddingCompany';
  import {
    LxBasicExportBtn,
    ExportColumnKeyEnum,
    ExportColumnMap,
  } from '/@/components/LxComponents';
  import { ExportTypeEnum } from '/@/enums/businessEnum';
  import { updatePassword } from '/@/api/libraryManager/libExpert';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { encryptByMd5 } from '/@/utils/cipher';
  const ifDisabled = ref<any>(null);
  const [registerDrawer, { openDrawer }] = useDrawer();
  const { createConfirm, createMessage, createConfirmPromise } = useMessage();
  const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'biddingCompany.user.approveStatus', type: 'equal', value: [1] },
        { param: 'biddingCompany.ifDelete', type: 'equal', value: [0] },
        { param: 'biddingCompany.user.role', type: 'equal', value: [5] },
      ],
      dataFieldList: ['biddingCompany', 'biddingCompany.id'],
      sorts: [{ dir: 'desc', prop: 'biddingCompany.id' }],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '招标公司已审核列表',
    api: getBiddingCompanyPageByQueryDto,
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
      if (queryInfo.name) {
        appendQueryList({ param: 'biddingCompany.name', type: 'like', value: [queryInfo.name] });
      }
      if (queryInfo.account) {
        appendQueryList({
          param: 'biddingCompany.user.account',
          type: 'like',
          value: [queryInfo.account],
        });
      }
      if (queryInfo.perName) {
        appendQueryList({
          param: 'biddingCompany.user.perName',
          type: 'like',
          value: [queryInfo.perName],
        });
      }
      if (queryInfo.mobile) {
        appendQueryList({
          param: 'biddingCompany.user.mobile',
          type: 'like',
          value: [queryInfo.mobile],
        });
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
      width: 240,
      title: '操作',
      dataIndex: 'action',
      slots: {
        customRender: 'action',
      },
      fixed: 'right',
    },
  });
  // 创建
  const handleCreateRole = () => {
    openDrawer(true, {
      isUpdate: false,
    });
  };
  // 编辑
  const handleEdit = (record) => {
    openDrawer(true, {
      isUpdate: true,
      record: toRaw(record.biddingCompany),
      user: toRaw(record.biddingCompany.user),
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
            id: record.biddingCompany.user.id,
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
    const biddingId = toRaw(record).biddingCompany.id;
    const userUseMark = toRaw(record).biddingCompany.useMark === 0 ? '1' : '0';
    await updateBiddingCompanyUseMark({ id: biddingId, useMark: userUseMark });
    createMessage.success(userUseMark === '0' ? '加入黑名单成功！' : '移除黑名单成功！');
    await reload();
  };
  // 删除
  const handleDelete = async (record) => {
    await createConfirmPromise({
      content: '确认删除吗？',
    });
    const biddingId = toRaw(record.biddingCompany.id);
    await deleteBiddingCompanyById(biddingId);
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
