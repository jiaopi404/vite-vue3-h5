<template>
  <IndexCardVue
    :class="prefixCls"
    title="我的业务"
    title-icon="ant-design:check-circle-outlined"
    :title-icon-color="titleIconColor"
    @view-more="viewMoreHandler"
    :is-extra="totalRef > MAX_LENGTH"
  >
    <BasicTable @register="register">
      <!-- <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '设为参与',
            },
            {
              icon: '',
              label: '删除',
              color: 'error',
            },
          ]"
        />
      </template> -->
    </BasicTable>
    <MyBusinessDialog @register="registerModal" />
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import IndexCardVue from './IndexCard.vue';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';
  import { ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useSqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { myBusinessTableColumns } from './index.data';
  import { getMyBusinessTask } from '/@/api/projectManagement/projectManagementApi';
  import { useModal } from '/@/components/Modal';
  import MyBusinessDialog from './viewMoreDialogs/MyBusinessDialog.vue';

  const { prefixCls } = useDesign('my-business-card');
  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.nine);
  const userStore = useUserStore();

  const [registerModal, { openModal }] = useModal();

  const totalRef = ref<number>(0);
  const MAX_LENGTH = 5;

  const [register, { reload }] = useTable({
    title: '',
    showTableSetting: false,
    bordered: true,
    showIndexColumn: true,
    api: async (params) => {
      const res = await getMyBusinessTask(params);
      totalRef.value = res.page.totalElements;
      return res;
    }, // api
    columns: myBusinessTableColumns,
    beforeFetch: () => {
      const { getSqlQueryDto } = useSqlQueryDto({
        sqlPageAndSortSumDto: {
          page: { pageNum: 1, pageSize: MAX_LENGTH },
          queryList: [],
        },
      });
      return getSqlQueryDto();
    },
    pagination: false,
    canResize: false,
  });

  const viewMoreHandler = () => {
    openModal(true);
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-my-business-card';

  .@{prefix-cls} {
  }
</style>
