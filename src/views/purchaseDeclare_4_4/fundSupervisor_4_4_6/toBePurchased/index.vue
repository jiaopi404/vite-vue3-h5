<template>
  <div>
    <BasicTable @register="registerTable" ref="refForm"> </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns, searchFormSchema } from './toBePurchased.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useUserStore } from '/@/store/modules/user';
  import { getBidSectionPage } from '/@/api/projectManagement/proMngWaitReviewApi';
  export default defineComponent({
    name: 'toBePurchased',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      const [registerDrawer, { openDrawer }] = useDrawer();
      // 组织查询参数
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            queryList: [
              { param: 'bidSection.ifDelete', type: 'equal', value: [0] },
              {
                param: 'bidSection.status.code',
                type: 'in',
                value: [
                  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                  24,
                ],
              },
              { param: 'bidSection.project.fundsUserId', type: 'equal', value: [userInfo.id] },
            ],
            dataFieldList: ['bidSection', 'bidSection.id'],
            sorts: [
              {
                dir: 'desc',
                prop: 'bidSection.updateDateTime',
              },
              {
                dir: 'desc',
                prop: 'bidSection.id',
              },
            ],
          },
        });
      // 请求之前对参数进行处理
      const beforeFetch = async (queryInfo: any) => {
        console.log('queryInfo', queryInfo);
        resetHqlQueryDto(); // 先重置
        if (queryInfo.page && queryInfo.pageSize) {
          setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
        }
        if (queryInfo.proName) {
          appendQueryList({
            param: 'bidSection.proName',
            type: 'like',
            value: [queryInfo.proName],
          });
        }
        if (queryInfo.proNumber) {
          appendQueryList({
            param: 'bidSection.proNumber',
            type: 'like',
            value: [queryInfo.proNumber],
          });
        }
        if (queryInfo.projectType) {
          appendQueryList({
            param: 'bidSection.project.projectType.id',
            type: 'equal',
            value: [queryInfo.projectType],
          });
        }
        if (queryInfo?.planUseTime) {
          queryInfo.planUseTime = queryInfo.planUseTime.slice(0, 10) + ' ' + '23:59:59';
          appendQueryList({
            param: 'bidSection.project.planUseTime',
            type: 'le',
            value: [queryInfo.planUseTime],
          });
        }
        if (queryInfo?.status) {
          appendQueryList({
            param: 'bidSection.status.code',
            type: 'equal',
            value: [queryInfo.status],
          });
        }
        // if (queryInfo?.procurementMethod) {
        //   appendQueryList({
        //     param: 'project.procurementMethod.id',
        //     type: 'equal',
        //     value: [queryInfo.procurementMethod],
        //   });
        // }
        if (queryInfo?.field == 'budgetAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo?.field == 'planUseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.project.${queryInfo.field}`,
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
        const queryDto: any = getHqlQueryDto();
        if (queryDto?.hqlPageAndSortSumDto?.sumList) {
          delete queryDto?.hqlPageAndSortSumDto?.sumList;
        }
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        const tableData = data.map((item) => item.bidSection);
        return tableData;
      };
      const [registerTable, { reload }] = useTable({
        title: '待采购列表',
        api: getBidSectionPage,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        useSearchForm: true, // 使用搜索表单
        rowKey: 'id',
        formConfig: {
          // 表单配置，参考表单组件的 Props
          labelWidth: 120,
          schemas: searchFormSchema(),
          autoSubmitOnEnter: true,
        },
        handleSearchInfoFn: (data) => {
          console.log('搜索条件：', data);
        },
        showTableSetting: true, // 显示表格设置工具
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
      });
      return {
        registerTable,
        registerDrawer,
      };
    },
  });
</script>
