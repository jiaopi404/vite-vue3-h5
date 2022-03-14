<template>
  <div>
    <BasicTable @register="registerTable" ref="refForm">
      <template #toolbar> </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '评审报价供应商',
              onClick: clickReviewQuotation.bind(null, record),
            },
          ]"
        />
      </template> </BasicTable
    >,
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useRouter } from 'vue-router';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns, searchFormSchema } from './toBeReviewed.data';
  import { useSqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getBidSectionReviewPageByQueryDto } from '/@/api/projectReview/projectReviewApi';
  import { getDepartmentStringById } from '/@/api/purchase/plan-purchase';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  export default defineComponent({
    name: 'toBeReviewed',
    components: {
      BasicTable,
      Popconfirm,
      TableAction,
    },
    setup() {
      const userInfo = useUserStore().getUserInfo;
      const configStore = useConfigStore();
      const router = useRouter();
      console.log(userInfo, 'userInfo');
      const [registerDrawer, { openDrawer }] = useDrawer();
      const { appendQueryList, getSqlQueryDto, resetSqlQueryDto, setPage, setSorts } =
        useSqlQueryDto({
          sqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            sorts: [
              { dir: 'desc', prop: 'bidSection.updateDateTime' },
              { dir: 'desc', prop: 'bidSection.id' },
            ],
            queryList: [
              { param: 'sd.code', type: 'in', value: [19] },
              {
                param: 'pr.Id',
                type: 'isNull',
                value: [''],
              },
              {
                param: 'sd.parentId',
                type: 'equal',
                value: [configStore.GET_CONFIG_DICTIONRY.projectStatusId],
              },
              { param: 'pe.userId', type: 'equal', value: [userInfo.id] },
            ],
          },
        });
      // 请求之前对参数进行处理
      const beforeFetch = (queryInfo: any) => {
        console.log('queryInfo', queryInfo);
        resetSqlQueryDto(); // 先重置
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
        if (queryInfo.projectType) {
          appendQueryList({
            param: 'pp.projectTypeId',
            type: 'equal',
            value: [queryInfo.projectType],
          });
        }
        if (queryInfo.purchaseNumber) {
          appendQueryList({
            param: 'pp.purchaseNumber',
            type: 'like',
            value: [queryInfo.purchaseNumber],
          });
        }
        if (queryInfo.declareDept) {
          appendQueryList({
            param: 'pp.declareDeptId',
            type: 'in',
            value: [queryInfo.declareDept],
          });
        }
        if (queryInfo.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        const queryDto = getSqlQueryDto();
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.returnBidSection;
      };
      const [registerTable] = useTable({
        title: '待评审列表',
        api: async (params) => {
          try {
            const queryItem = params.sqlPageAndSortSumDto.queryList.find(
              (item) => item.param === 'pp.declareDeptId',
            );
            if (queryItem) {
              let res = await getDepartmentStringById(queryItem.value[0]);
              let msg = res.msg;
              queryItem.value[0] = msg;
            }
            return await getBidSectionReviewPageByQueryDto(params);
          } catch (err) {
            console.log('error is: ', err);
          }
        },
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        useSearchForm: true, // 使用搜索表单
        rowKey: 'id',
        formConfig: {
          // 表单配置，参考表单组件的 Props
          labelWidth: 100,
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
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 220,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
        },
        bordered: true,
        showIndexColumn: true,
      });
      // 评审报价供应商
      function clickReviewQuotation(record: Recordable) {
        console.log(record);
        router.push({
          path: '/reviewQuotation',
          query: { id: record.returnBidSection.id, peId: record.peId },
        });
      }

      return {
        registerTable,
        registerDrawer,
        clickReviewQuotation,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 12vw);
  }
</style>
