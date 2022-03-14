<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <div class="flex items-center justify-start">
          <ExtractPopover
            :id="record.bidSection.id"
            :node="4"
            popoverTitle="抽取专家"
            :objectName="`pro_bidSection`"
            :ifShow="
              ifCurrentUser === record.bidSection.project.biddingUserId &&
              record.bidSection.ifBeforeAcceptance == 1
            "
            @extract-complete="reload"
          />
          <TableAction
            :actions="[
              {
                noPadding: true,
                label: '',
                onClick: extractExperts.bind(null, record),
                ifShow: () => {
                  return (
                    ifCurrentUser === record.bidSection.project.biddingUserId &&
                    record.bidSection.ifBeforeAcceptance == 1
                  );
                },
              },
              {
                label: '发起验收',
                onClick: initiateAcceptance.bind(null, record),
              },
              {
                label: '查看验收单',
                onClick: seeAcceptanceRecord.bind(null, record),
              },
            ]"
          />
        </div>
      </template>
    </BasicTable>
    <!-- 发起验收 -->
    <InitiateAcceptance @register="registerDrawer" @success="handleSuccess"></InitiateAcceptance>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { columns, searchFormSchema, pageAndSort } from './toBeAccepted.data';
  import { useDrawer } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import InitiateAcceptance from './components/initiateAcceptance.vue';
  import ExtractPopover from '/@/views/openTender_4_5/projectMng_4_5_3/inProcurement/ExtractPopover.vue';
  import { useUserStore } from '/@/store/modules/user';
  import { getReviewNodeByProjectNode } from '/@/api/review-node/proReviewNode';
  import { getBidSectionAndProAcceptanceByQueryDto } from '/@/api/acceptanceManagement/acceptanceManagementApi';
  export default defineComponent({
    name: 'toBeAccepted',
    components: {
      BasicTable,
      TableAction,
      InitiateAcceptance,
      ExtractPopover,
    },
    setup() {
      const router = useRouter();
      const [registerDrawer, { openDrawer }] = useDrawer();
      const { createConfirmPromise } = useMessage();
      const userInfo = useUserStore().getUserInfo;
      // 组织查询参数
      const {
        resetHqlQueryDto,
        setPageByQueryInfo,
        appendQueryListByQueryInfoValuePlain,
        setSorts,
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
          queryInfo.projectType,
        );
        appendQueryListByQueryInfoValuePlain(
          'bidSection.procurementMethod',
          'in',
          queryInfo.procurementMethod,
        );
        if (queryInfo.field == 'budgetAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidSection.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'bidWinningAmount') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `bidWinner.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'accDate') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `proAcceptance.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        if (queryInfo.field == 'accDate') {
          queryInfo.order = queryInfo.order.substring(0, queryInfo.order.length - 3);
          setSorts({
            prop: `proAcceptance.${queryInfo.field}`,
            dir: queryInfo.order,
          });
        }
        const queryDto = getHqlQueryDto();
        return queryDto;
      };
      const afterFetch = (data) => {
        return data;
      };

      const [registerTable, { reload }] = useTable({
        title: '待验收列表',
        api: getBidSectionAndProAcceptanceByQueryDto,
        beforeFetch,
        afterFetch,
        columns: columns(), // 表单列信息
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
        actionColumn: {
          // 表格右侧操作列配置 BasicColumn
          width: 260,
          title: '操作',
          dataIndex: 'action',
          slots: {
            customRender: 'action',
          },
          fixed: 'right',
        },
        bordered: true,
        showIndexColumn: true,
      });
      // 是否是采购处理人
      const ifCurrentUser = computed(() => {
        return userInfo.id;
      });
      // 抽取专家
      function extractExperts(record: Recordable) {
        console.log(record, 'record');
      }
      // 发起验收
      async function initiateAcceptance(record: Recordable) {
        const reviewNode = await getReviewNodeByProjectNode({
          objectId: record.bidSection.id,
          objectName: 'pro_bidSection',
          node: 4,
        });
        if (reviewNode && reviewNode.ifReview && reviewNode.statusId !== 3) {
          // 说明抽取结点未完成
          await createConfirmPromise({
            content: '抽取未完成，确定继续？',
          });
        }
        openDrawer(true, {
          record,
        });
      }
      // 保存成功回调
      function handleSuccess() {
        reload();
      }
      // 查看验收记录
      function seeAcceptanceRecord(record: Recordable) {
        router.push({
          path: '/reportForm/reportAcceptanceRecord',
          query: { bidSectionId: record.bidSection.id, acceptanceId: record.proAcceptance.id },
        });
      }
      return {
        registerTable,
        extractExperts,
        initiateAcceptance,
        seeAcceptanceRecord,
        registerDrawer,
        handleSuccess,
        ifCurrentUser,
        reload,
      };
    },
  });
</script>

<style lang="less" scoped>
  .pop {
    display: block;
  }
</style>
