<template>
  <div>
    <BasicTable @register="registerTable">
      <template #toolbar> </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  // 按需引入
  import { Popconfirm } from 'ant-design-vue';
  // 配置数据
  import { useConfigStore } from '/@/store/modules/config';
  import { columns, searchFormSchema } from './processed.data';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { getProjectPage, getDepartmentStringById } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    name: 'processed',
    components: {
      BasicTable,
      Popconfirm,
    },
    setup() {
      // 引入字典
      const configStore = useConfigStore();
      // 组织查询参数
      const { appendQueryList, getHqlQueryDto, resetHqlQueryDto, setPage, setSorts } =
        useHqlQueryDto({
          hqlPageAndSortSumDto: {
            page: { pageNum: 1, pageSize: 10 },
            queryList: [
              { param: 'project.ifDelete', type: 'equal', value: [0] },
              { param: 'project.projectAdditionPhase', type: 'in', value: [1] },
            ],
            dataFieldList: ['project', 'project.id'],
            sorts: [
              {
                dir: 'desc',
                prop: 'project.updateDateTime',
              },
              {
                dir: 'desc',
                prop: 'project.id',
              },
            ],
          },
        });
      // 请求之前对参数进行处理
      const beforeFetch = (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        if (queryInfo.page && queryInfo.pageSize) {
          setPage({ pageNum: queryInfo.page, pageSize: queryInfo.pageSize });
        }
        if (configStore.GET_CONFIG_MODULE.ifProjectEstablishment) {
          appendQueryList({
            param: 'project.status.code',
            type: 'in',
            value: [
              4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            ],
          });
        } else {
          appendQueryList({
            param: 'project.status.code',
            type: 'in',
            value: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
          });
        }
        if (queryInfo.proName) {
          appendQueryList({
            param: 'project.proName',
            type: 'like',
            value: [queryInfo.proName],
          });
        }
        if (queryInfo.planUseTime) {
          queryInfo.planUseTime = queryInfo.planUseTime.slice(0, 10) + ' ' + '23:59:59';
          appendQueryList({
            param: 'project.planUseTime',
            type: 'le',
            value: [queryInfo.planUseTime],
          });
        }
        if (queryInfo.declareDept) {
          appendQueryList({
            param: 'project.declareDept',
            type: 'in',
            value: [queryInfo.declareDept],
          });
        }
        if (queryInfo.field == 'planUseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `project.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'planPurchaseTime') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          console.log(queryInfo.order, 'queryInfo.order');
          setSorts({
            prop: `project.${queryInfo.field}`,
            dir: queryInfo.order,
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
        const tableData: any[] = [];
        data.forEach((item) => {
          tableData.push(item.project);
        });
        return tableData;
      };
      const [registerTable] = useTable({
        title: '已处理列表',
        api: async (params) => {
          try {
            const queryItem = params.hqlPageAndSortSumDto.queryList.find(
              (item) => item.param === 'project.declareDept',
            );
            if (queryItem) {
              let res = await getDepartmentStringById(queryItem.value[0]);
              let msg = res.msg;
              queryItem.value[0] = msg;
            }
            return await getProjectPage(params);
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
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 1vw);
  }
</style>
