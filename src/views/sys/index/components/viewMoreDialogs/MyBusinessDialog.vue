<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="我的业务"
    :class="prefixCls"
    width="900px"
    :z-index="999"
  >
    <BasicTable @register="registerTable" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { nextTick } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import { useSqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { myBusinessFormSchema, myBusinessTableColumns } from '../index.data';
  import { useUserStore } from '/@/store/modules/user';
  import { getMyBusinessTask } from '/@/api/projectManagement/projectManagementApi';

  const { prefixCls } = useDesign('my-business-dialog');
  const userStore = useUserStore();

  const [register] = useModalInner(async () => {
    nextTick(async () => {
      await reload();
    });
  });

  const { getSqlQueryDto, resetSqlQueryDto, setPage, appendQueryList } = useSqlQueryDto({
    sqlPageAndSortSumDto: {
      page: { pageNum: 1, pageSize: 10 },
      queryList: [],
    },
  });

  const [registerTable, { reload }] = useTable({
    title: '',
    size: 'small',
    showTableSetting: false,
    bordered: true,
    showIndexColumn: true,
    api: getMyBusinessTask, // api
    columns: myBusinessTableColumns,
    beforeFetch: (queryInfo) => {
      resetSqlQueryDto();
      if (queryInfo.page && queryInfo.pageSize) {
        setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
      }
      if (queryInfo.objNumber) {
        appendQueryList({
          param: 'object.objNumber',
          type: 'like',
          value: [queryInfo.objNumber],
        });
      }
      if (queryInfo.type) {
        appendQueryList({
          param: 'object.type',
          type: 'equal',
          value: [queryInfo.type],
        });
      }
      if (queryInfo.amount && !!queryInfo.amount[0]) {
        appendQueryList({
          param: 'object.amount',
          type: 'ge',
          value: [queryInfo.amount[0]],
        });
      }
      if (queryInfo.amount && !!queryInfo.amount[1]) {
        appendQueryList({
          param: 'object.amount',
          type: 'le',
          value: [queryInfo.amount[1]],
        });
      }
      return getSqlQueryDto();
    },
    useSearchForm: true,
    formConfig: {
      labelWidth: 130,
      schemas: myBusinessFormSchema(),
      autoSubmitOnEnter: true,
    },
    pagination: true,
    canResize: false,
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-my-business-dialog';

  .@{prefix-cls} {
  }
</style>
