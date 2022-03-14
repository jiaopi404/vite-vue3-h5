<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '评价',
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
  import { getBidSectionPageByQueryDtoNew } from '/@/api/review-node/biddingCompany';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  const [registerDrawer, { openDrawer }] = useDrawer();
  const userInfo = useUserStore().getUserInfo;
  const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
        { param: 'bidSection.ifAbandonedBid', type: 'equal', value: [0] },
        { param: 'bidSection.biddingCompanyEvaluation', type: 'equal', value: [0] },
        { param: 'bidSection.status.code', type: 'in', value: [25] },
        { param: 'bidWinner.ifDelete', type: 'equal', value: [0] },
        {
          param: 'bidSection.biddingCompany',
          type: 'isNotNull',
          value: [''],
        },
        {
          param: '',
          type: 'or',
          value: [
            orParamsFormatter(
              "(bidSection.project.proChargeUserId ='" +
                userInfo.id +
                "' or bidSection.project.BiddingUserId ='" +
                userInfo.id +
                "')",
            ),
          ],
        },
      ],
      dataFieldList: ['bidSection', 'bidSection.id', 'bidWinner', 'bidWinner.id', 'biddingCompany'],
      sorts: [
        { dir: 'desc', prop: 'bidSection.updateDateTime' },
        { dir: 'desc', prop: 'bidSection.id' },
      ],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '招标公司待评价列表',
    api: getBidSectionPageByQueryDtoNew,
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
      if (queryInfo.proName) {
        appendQueryList({ param: 'bidSection.proName', type: 'like', value: [queryInfo.proName] });
      }
      if (queryInfo.orgName) {
        appendQueryList({
          param: 'bidSection.biddingCompany.name',
          type: 'like',
          value: [queryInfo.orgName],
        });
      }
      if (queryInfo.purchaseType) {
        appendQueryList({
          param: 'bidSection.project.projectType.id',
          type: 'equal',
          value: [queryInfo.purchaseType],
        });
      }
      if (queryInfo.field == 'bidWinner.bidWinningDate') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: 'bidWinner.bidWinningDate',
          dir: queryInfo.order,
        });
      }
      if (queryInfo.field == 'bidSection.completeDate') {
        queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
        setSorts({
          prop: `${queryInfo.field}`,
          dir: queryInfo.order,
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
      record: toRaw(record.bidSection),
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
