<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '打印中标通知书',
              color: 'success',
              onClick: handleToReport.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 结果公告(供应商)
   * resultsAffiche
   * openTender_6_1/resultsAffiche_6_1_2/index.vue
   */
  import { defineComponent } from 'vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { Tooltip } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './resultsAffiche.data';
  import { getQuotedBidSectionPageByQueryDto } from '/@/api/purchase/supplierApi';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      Tooltip,
    },
    setup() {
      const router = useRouter();
      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSortByQueryInfo,
        getHqlQueryDto,
      } = useHqlQueryDto(pageAndSort());

      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);
        appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );
        // 发布日期
        if (queryInfo.releaseDate) {
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.releaseDate',
            'ge',
            `${queryInfo.releaseDate[0]} 00:00:00`,
          );
          appendQueryListByQueryInfoValuePlain(
            'bidSection.project.releaseDate',
            'le',
            `${queryInfo.releaseDate[1]} 23:59:59`,
          );
        }
        setSortByQueryInfo(queryInfo);
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      const afterFetch = (data) => {
        // return data.map((item) => item.bidSection);
        return data;
      };

      const [registerTable, { reload }] = useTable({
        title: '结果公告列表',
        api: getQuotedBidSectionPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        // rowKey: 'id',
        rowKey: (record) => record.bidSection.id,
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
          autoSubmitOnEnter: true,
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
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 120,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      // 跳转 中标通知书
      const handleToReport = (record?: any) => {
        router.push({
          path: '/reportForm/reportWinNotification', // 中标通知书
          query: {
            bidSectionId: record.bidSection.id,
          },
        });
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }
      return {
        registerTable,
        handleToReport,
        handleSuccess,
      };
    },
  });
</script>
<style scoped>
  .linkTitle {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #0960bd;
    margin: 0;
    cursor: pointer;
  }
</style>
