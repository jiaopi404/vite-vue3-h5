<template>
  <IndexCardVue
    :class="prefixCls"
    title="我的项目"
    title-icon="ant-design:check-circle-outlined"
    :title-icon-color="titleIconColor"
    @view-more="viewMoreHandler"
    :is-extra="totalRef > MAX_LENGTH"
  >
    <BasicTable @register="register" />
    <MyProjectDialog @register="registerModal" />
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import IndexCardVue from './IndexCard.vue';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';
  import { ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getProjectPage } from '/@/api/purchase/plan-purchase';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { myProjectTableColumns } from './index.data';
  import MyProjectDialog from './viewMoreDialogs/MyProjectDialog.vue';
  import { useModal } from '/@/components/Modal';

  const { prefixCls } = useDesign('my-project-card');
  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.six);
  const userStore = useUserStore();

  const totalRef = ref<number>(0);
  const MAX_LENGTH = 5;

  const [registerModal, { openModal }] = useModal();

  const [register, { reload }] = useTable({
    title: '',
    showTableSetting: false,
    bordered: true,
    showIndexColumn: true,
    api: async (params) => {
      const res = await getProjectPage(params);
      totalRef.value = res.page.totalElements;
      return res;
    }, // api
    columns: myProjectTableColumns,
    beforeFetch: () => {
      const { getHqlQueryDto } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          page: { pageNum: 1, pageSize: MAX_LENGTH },
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
      return getHqlQueryDto();
    },
    pagination: false,
    canResize: false,
  });

  const viewMoreHandler = () => {
    openModal(true);
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-my-project-card';

  .@{prefix-cls} {
  }
</style>
