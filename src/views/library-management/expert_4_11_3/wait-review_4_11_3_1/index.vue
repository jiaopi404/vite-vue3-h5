<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '审核',
              onClick: auditing.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <EditRoleDrawerVue @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>

<script lang="ts" setup>
  import { toRaw } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import EditRoleDrawerVue from './components/EditRoleDrawer.vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { roleListTableSchema, roleSearchFormSchema } from './schemas';
  import { getUserExtendPageList } from '/@/api/libraryManager/libExpert';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'user.approveStatus', type: 'equal', value: [0] },
        { param: 'user.ifDelete', type: 'equal', value: [0] },
        {
          param: 'user.role',
          type: 'or',
          value: [orParamsFormatter('(user.role=3 or user.ifSchoolExpert=1)')],
        },
      ],
      dataFieldList: ['user', 'userExtend', 'user.id'],
      sorts: [{ dir: 'desc', prop: 'user.id' }],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '专家待审核列表',
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
      width: 80,
      title: '操作',
      dataIndex: 'action',
      slots: {
        customRender: 'action',
      },
      fixed: 'right',
    },
  });

  const auditing = async (record) => {
    openDrawer(true, {
      isUpdate: true,
      record: toRaw(record.user),
    });
  };

  /**
   * 保存成功回调
   */
  const handleSuccess = () => {
    reload(); // 回调列表数据
  };
</script>
<script lang="ts">
  import { defineComponent } from 'vue';
  export default defineComponent({
    name: 'RoleManagement',
  });
</script>
