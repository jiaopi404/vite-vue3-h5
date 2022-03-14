<template>
  <div>
    <BasicTable @register="registerTable">
      <!-- <template #toolbar>
        <a-button @click="fun">fun</a-button>
      </template> -->
      <!-- 倒计时组件 -->
      <template #surplusTime="{ record }">
        <p v-if="record.bidSection.project.quoteStartTime > Date.now()">暂未开始</p>
        <StatisticCountdown
          v-else
          :value="Date.now() + (record.bidSection.project.quoteEndTime - Date.now())"
          format="D 天 H 时 m 分 s 秒"
          :value-style="{ color: 'black', fontSize: '14px' }"
        />
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              label: '取消报价',
              color: 'success',
              onClick: handleCancel.bind(null, record),
              disabled:
                record.bidSection.project.quoteEndTime / 1000 < dateUtil().unix() ||
                record.supplierQuotation.ifCancelQuotation === 1,
            },
            {
              label: '编辑报价',
              color: 'success',
              onClick: handleEditor.bind(null, record),
              disabled:
                record.bidSection.project.quoteEndTime / 1000 < dateUtil().unix() ||
                record.supplierQuotation.ifCancelQuotation === 0,
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  /**
   * 已报价(项目管理)
   * alreadyquote
   * openTender_6_1/projectManagement_6_1_3/alreadyquote/index.vue
   */
  import { defineComponent } from 'vue';
  import { Statistic } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { dateUtil } from '/@/utils/dateUtil';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { columns, searchFormSchema, pageAndSort } from './alreadyquote.data';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';

  import {
    getQuotedBidSectionPageByQueryDto,
    saveSupplierQuotation,
  } from '/@/api/purchase/supplierApi';

  export default defineComponent({
    components: {
      BasicTable,
      TableAction,
      StatisticCountdown: Statistic.Countdown,
    },
    setup() {
      const { createMessage } = useMessage();
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
        return data;
      };

      const [registerTable, { reload }] = useTable({
        title: '已报价列表',
        api: getQuotedBidSectionPageByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
        rowKey: 'bidSection.id',
        useSearchForm: true,
        formConfig: {
          labelWidth: 120,
          schemas: searchFormSchema(),
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
          width: 160,
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          slots: {
            customRender: 'action',
          },
        },
        pagination: {
          pageSizeOptions: ['10', '20', '50', '100', '300', '500'],
        },
      });

      // 取消报价
      // ifCancelQuotation 是否取消报价 1是 0否
      const handleCancel = async (record) => {
        try {
          await saveSupplierQuotation({
            id: record.supplierQuotation.id,
            ifCancelQuotation: 1,
          });
          reload(); // 刷新表格
          createMessage.success('取消报价成功');
        } catch (err) {
          createMessage.error('取消报价失败!');
        }
      };

      // 编辑报价
      const handleEditor = async (record: any) => {
        router.push({
          path: '/supplier/tenderDetails',
          query: {
            bidSectionId: record.bidSection.id,
            projectId: record.bidSection.project.id,
            // supplierQuotation_id: record.supplierQuotation_id,
          },
        });
      };

      function handleSuccess() {
        reload(); // 刷新表格
      }

      return {
        registerTable,
        handleCancel,
        handleEditor,
        handleSuccess,
        dateUtil,
      };
    },
  });
</script>
