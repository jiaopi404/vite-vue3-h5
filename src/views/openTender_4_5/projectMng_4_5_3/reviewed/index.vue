<template>
  <div>
    <BasicTable @register="registerTable" ref="refForm">
      <template #toolbar> </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns, searchFormSchema } from './reviewed.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';
  export default defineComponent({
    name: 'purchased',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      const ifCurrentUserBiddingCompanyUser = computed(() => {
        return userInfo.role === 5;
      });
      // 组织查询参数
      const {
        getHqlQueryDto,
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        appendQueryList,
        setSorts,
      } = useHqlQueryDto({
        hqlPageAndSortSumDto: {
          page: { pageNum: 1, pageSize: 10 },
          sorts: [
            { dir: 'desc', prop: 'bidSection.updateDateTime' },
            { dir: 'desc', prop: 'bidSection.id' },
          ],
          queryList: [
            // 采购方式 ！= （电子竞价/询价），状态 = 待采购，项目处理人 = 当前登陆人，未删除的项目
            { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
            { param: 'bidSection.status.code', type: 'in', value: [20, 21, 22, 23, 24, 25] }, // 待采购
          ],
          dataFieldList: ['bidSection', 'bidSection.id'],
        },
      });
      // getBidSectionPage
      const [registerTable] = useTable({
        title: '已评审列表',
        api: async (params) => {
          try {
            const queryItem = params.hqlPageAndSortSumDto.queryList.find(
              (item) => item.param === 'bidSection.project.declareDept.id',
            );
            if (queryItem) {
              let res = await getDepartmentStringById(queryItem.value[0]);
              let msg = res.msg;
              queryItem.value[0] = msg;
            }
            return await getBidSectionPage(params);
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        columns: columns(),
        rowKey: 'bidSection_id',
        beforeFetch: (queryInfo: any) => {
          resetHqlQueryDto(); // 先重置
          setPageByQueryInfo(queryInfo);
          //   当前人;
          //   是否是招标公司用户;
          if (ifCurrentUserBiddingCompanyUser.value) {
            // 招标公司
            appendQueryList({
              param: 'bidSection.biddingCompany.user.id',
              type: 'equal',
              value: [userInfo.id],
            });
          } else {
            // 组织处理人
            appendQueryList({
              param: 'bidSection.project.BiddingUserId',
              type: 'equal',
              value: [userInfo.id],
            });
          }
          appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
          appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.projectType.id',
            'equal',
            queryInfo.projectType,
          );
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.declareDept.id',
            'in',
            queryInfo.declareDept,
          );
          appendQueryListByQueryInfoValuePlain(
            'bidSection.ifAbandonedBid',
            'equal',
            queryInfo.ifAbandonedBid,
          );
          if (queryInfo?.field == 'completeDate') {
            queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
            setSorts({
              prop: `bidSection.${queryInfo.field}`,
              dir: queryInfo.order,
            });
          }
          if (queryInfo?.field == 'addDateTime') {
            queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
            setSorts({
              prop: `bidSection.${queryInfo.field}`,
              dir: queryInfo.order,
            });
          }
          return getHqlQueryDto();
        },
        afterFetch: (data) => {
          return data;
          // return data.map((item) => item.bidSection);
        },
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
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
          // placeHolder: '请输入菜单名称',
          autoSubmitOnEnter: true,
        },
        useSearchForm: true,
      });
      return {
        registerTable,
      };
    },
  });
</script>
