<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- 倒计时组件 -->
      <template #surplusTime="{ record }">
        <div v-if="record.project.quoteStartTime > Date.now()">暂未开始</div>
        <StatisticCountdown
          v-else
          :value="Date.now() + (record.project.quoteEndTime - Date.now())"
          format="D 天 H 时 m 分 s 秒"
          :value-style="{ color: '#cf1322', fontSize: '14px', fontWeight: 600 }"
          @finish="setTimeoutReload"
        />
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '查看',
              color: 'success',
              onClick: handleEditor.bind(null, record),
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 采购公告(供应商)
   * procurementAffiche
   * openTender_6_1/procurementAffiche_6_1_1/index.vue
   */
  import { defineComponent } from 'vue';
  import { Statistic, Tooltip } from 'ant-design-vue';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';

  import { useRouter } from 'vue-router';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './procurementAffiche.data';
  import { formatToDateTime } from '/@/utils/dateUtil';
  import { getBidSectionPageByQueryDto } from '/@/api/purchase/supplierApi';
  import { timeEnd } from 'console';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      StatisticCountdown: Statistic.Countdown,
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
      // 请求之前对参数进行处理
      const beforeFetch = async (queryInfo: any) => {
        resetHqlQueryDto(); // 先重置
        setPageByQueryInfo(queryInfo);

        const nowDate = formatToDateTime();
        appendQueryListByQueryInfoValuePlain('bidSection.project.quoteStartTime', 'le', nowDate);
        appendQueryListByQueryInfoValuePlain('bidSection.project.quoteEndTime', 'ge', nowDate);

        appendQueryListByQueryInfoValuePlain('bidSection.proName', 'like', queryInfo.proName);
        appendQueryListByQueryInfoValuePlain('bidSection.proNumber', 'like', queryInfo.proNumber);
        appendQueryListByQueryInfoValuePlain(
          'bidSection.project.projectType.id',
          'equal',
          queryInfo.projectTypeId,
        );
        setSortByQueryInfo(queryInfo, 'bidSection');
        const queryDto = getHqlQueryDto();
        return queryDto;
      };

      // 请求之后对返回值进行处理
      const afterFetch = (data) => {
        return data.map((item) => item.bidSection);
      };
      const [registerTable, { reload }] = useTable({
        title: '采购公告列表',
        api: getBidSectionPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'id',
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
          width: 80,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
      });

      // 跳转 采购公告预览
      const handleEditor = async (record: any) => {
        router.push({
          path: '/reportForm/reportProcurementAffiche',
          query: {
            bidSectionId: record.id,
            projectId: record.project.id,
          },
        });
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      function setTimeoutReload() {
        setTimeout(reload, 1000);
      }

      return {
        registerTable,
        reload,
        setTimeoutReload,
        handleEditor,
        handleSuccess,
        // registerDrawer,
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
