<template>
  <div>
    <BasicTable @register="registerTable" ref="refForm">
      <template #toolbar> </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { columns, searchFormSchema } from './rejectedBid.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getBidSectionPageByQuery } from '/@/api/purchase/plan-purchase';
  import { useUserStore } from '/@/store/modules/user';
  export default defineComponent({
    name: 'rejectedBid',
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
              { param: 'bidSection.ifAbandonedBid', type: 'equal', value: [1] },
              { param: 'bidSection.project.addUser.id', type: 'equal', value: [userInfo.id] },
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
      const beforeFetch = (queryInfo: any) => {
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
        if (queryInfo.projectType) {
          appendQueryList({
            param: 'bidSection.project.projectType.id',
            type: 'equal',
            value: [queryInfo.projectType],
          });
        }
        if (queryInfo.procurementMethod) {
          appendQueryList({
            param: 'bidSection.procurementMethod.id',
            type: 'equal',
            value: [queryInfo.procurementMethod],
          });
        }
        if (queryInfo.field == 'addDateTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `project.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        const queryDto: any = getHqlQueryDto();
        if (queryDto.hqlPageAndSortSumDto.sumList) {
          delete queryDto.hqlPageAndSortSumDto.sumList;
        }
        return queryDto;
      };
      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.bidSection);
      };
      const [registerTable] = useTable({
        title: '已废标列表',
        api: getBidSectionPageByQuery,
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
        fetchSetting: {
          // The field name of the current page passed to the background
          pageField: 'page',
          // The number field name of each page displayed in the background
          sizeField: 'pageSize',
          // Field name of the form data returned by the interface
          listField: 'page.content',
          // Total number of tables returned by the interface field name
          totalField: 'page.totalResult',
        },
      });
      // 上传附件
      function handleUpload(record: Recordable) {
        openDrawer(true, {
          record,
          isUpdate: true,
        });
      }
      // 设为待成交
      function handleSetUp(record: Recordable) {
        openDrawer(true, {
          record,
          isUpdate: true,
        });
      }
      return {
        registerTable,
        registerDrawer,
        handleUpload,
        handleSetUp,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 12vw);
  }
</style>
