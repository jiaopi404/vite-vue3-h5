<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="我的项目"
    :class="prefixCls"
    width="900px"
    :z-index="999"
  >
    <BasicTable @register="registerTable" />
  </BasicModal>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { ref, nextTick } from 'vue';
  import { BasicTable, TableAction, useTable } from '/@/components/Table';
  import { useModalInner, BasicModal } from '/@/components/Modal';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getProjectPage } from '/@/api/purchase/plan-purchase';
  import { myProjectFormSchema, myProjectTableColumns } from '../index.data';
  import { useUserStore } from '/@/store/modules/user';
  import { tryOnUnmounted } from '@vueuse/shared';

  const { prefixCls } = useDesign('todo-tasks-dialog');
  const userStore = useUserStore();

  const [register] = useModalInner(async () => {
    nextTick(async () => {
      await reload();
    });
  });

  const {
    getHqlQueryDto,
    setPageByQueryInfo,
    appendQueryListByQueryInfoValuePlain,
    resetHqlQueryDto,
  } = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      page: { pageNum: 1, pageSize: 10 },
      sorts: [
        { dir: 'desc', prop: 'project.updateDateTime' },
        { dir: 'desc', prop: 'project.id' },
      ],
      queryList: [
        // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
        { param: 'project.ifDelete', type: 'equal', value: [0] },
        { param: 'project.addUser', type: 'equal', value: [userStore.getUserInfo.id] },
      ],
      dataFieldList: ['project', 'project.id', 'biddingCompany'],
    },
  });

  const [registerTable, { reload }] = useTable({
    title: '',
    size: 'small',
    showTableSetting: false,
    bordered: true,
    showIndexColumn: true,
    api: getProjectPage, // api
    columns: myProjectTableColumns,
    beforeFetch: (queryInfo) => {
      resetHqlQueryDto();
      setPageByQueryInfo(queryInfo);
      appendQueryListByQueryInfoValuePlain('project.proName', 'like', queryInfo.proName);
      appendQueryListByQueryInfoValuePlain(
        'project.purchaseNumber',
        'like',
        queryInfo.purchaseNumber,
      );
      appendQueryListByQueryInfoValuePlain(
        'project.projectType.id',
        'equal',
        queryInfo.purchaseType,
      );
      return getHqlQueryDto();
    },
    useSearchForm: true,
    formConfig: {
      labelWidth: 130,
      schemas: myProjectFormSchema(),
      autoSubmitOnEnter: true,
    },
    pagination: true,
    canResize: false,
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-todo-tasks-dialog';

  .@{prefix-cls} {
  }
</style>
