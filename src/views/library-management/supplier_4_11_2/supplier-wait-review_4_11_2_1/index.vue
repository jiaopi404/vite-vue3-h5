<template>
  <div>
    <BasicTable @register="registerTable">
      <template #name="{ text, record }">
        <Tooltip :title="text">
          <div class="truncate lx-color--primary cursor-pointer" @click="handleToReport(record)">{{
            text
          }}</div>
        </Tooltip>
      </template>
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
  import { useRouter } from 'vue-router';
  import { Tooltip } from 'ant-design-vue';
  import { useDrawer } from '/@/components/Drawer';
  import EditRoleDrawerVue from './components/EditRoleDrawer.vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { roleListTableSchema, roleSearchFormSchema } from './schemas';
  import { getBiddingCompanyPageByQueryDto } from '/@/api/review-node/biddingCompany';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  const router = useRouter();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'biddingCompany.user.approveStatus', type: 'equal', value: [0] },
        { param: 'biddingCompany.ifDelete', type: 'equal', value: [0] },
        { param: 'biddingCompany.useMark', type: 'equal', value: [1] },
        { param: 'biddingCompany.user.role', type: 'equal', value: [1] },
      ],
      dataFieldList: ['biddingCompany', 'biddingCompany.id'],
      sorts: [{ dir: 'desc', prop: 'biddingCompany.id' }],
    },
  });
  const [registerTable, { reload }] = useTable({
    title: '供应商待审核列表',
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
      if (queryInfo.comlicCode) {
        appendQueryList({
          param: 'biddingCompany.comlicCode',
          type: 'like',
          value: [queryInfo.comlicCode],
        });
      }
      if (queryInfo.legalperName) {
        appendQueryList({
          param: 'biddingCompany.legalperName',
          type: 'like',
          value: [queryInfo.legalperName],
        });
      }
      if (queryInfo.regdate && queryInfo.regdate.length > 0) {
        appendQueryList({
          param: 'biddingCompany.regdate',
          type: 'ge',
          value: [queryInfo.regdate[0]],
        });
        appendQueryList({
          param: 'biddingCompany.regdate',
          type: 'le',
          value: [queryInfo.regdate[1]],
        });
      }
      if (queryInfo.perName) {
        appendQueryList({
          param: 'biddingCompany.user.perName',
          type: 'like',
          value: [queryInfo.perName],
        });
      }
      if (queryInfo.addDateTime && queryInfo.addDateTime.length > 0) {
        appendQueryList({
          param: 'biddingCompany.user.addDateTime',
          type: 'ge',
          value: [queryInfo.addDateTime[0]],
        });
        appendQueryList({
          param: 'biddingCompany.user.addDateTime',
          type: 'le',
          value: [queryInfo.addDateTime[1]],
        });
      }
      if (queryInfo.ifSupplier) {
        appendQueryList({
          param: 'biddingCompany.ifSupplier',
          type: 'like',
          value: [queryInfo.ifSupplier],
        });
      }
      if (queryInfo.ifRepairer) {
        appendQueryList({
          param: 'biddingCompany.ifRepairer',
          type: 'like',
          value: [queryInfo.ifRepairer],
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

  const handleToReport = (record?: any) => {
    router.push({
      path: '/reportForm/reportSupplier',
      query: {
        supplierId: record.biddingCompany.id,
      },
    });
  };

  const auditing = async (record) => {
    openDrawer(true, {
      isUpdate: true,
      record: toRaw(record.biddingCompany),
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
