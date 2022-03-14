<template>
  <div :class="prefixCls">
    <BasicTable
      @register="registerTable"
      :loading="!!tableLoading.expertList.length"
      :form-config="{ disabled: ifCompleted }"
    >
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '抽取',
              color: 'success',
              onClick: handleExtract.bind(null, record),
              disabled:
                loading.extRowIdList.indexOf(record.user?.id) !== -1 ||
                record.disabled ||
                ifExtracting ||
                ifCompleted,
            },
          ]"
        />
      </template>
    </BasicTable>
    <BasicTable @register="registerExtractDetailTable">
      <template #tableTitle>
        <ProExtTableTitleVue title="抽取详情" :review-node="reviewNode" />
      </template>
      <template #toolbar>
        <Tooltip overlay-class-name="extract-rule_tooltip_class-name">
          <template #title>
            <ExtractExpertManualTooltip />
          </template>
          <AButton type="primary" color="warning"> 查看抽取规则 </AButton>
        </Tooltip>
        <AButton
          type="primary"
          @click="doProExtractionAndMessage"
          :disabled="!proExtList.length || ifCompleted || ifHasExtracted || ifExtracting"
        >
          {{ ifExtracting ? '发送短信中...' : '发送短信' }}
        </AButton>
        <AButton
          type="primary"
          :loading="reviewLoading"
          :disabled="
            !proExtList.length ||
            ifExtracting ||
            ifWaitExtracting ||
            ifCompletedAndReviewNodeNotEqual3
          "
          @click="doReviewNode3(reviewNode)"
        >
          {{ getReviewBtnName }}
        </AButton>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '设为参与',
              onClick: setTakePartInExtDetail.bind(null, record),
              disabled:
                record.proExtraction.status === 2 ||
                record.proExtraction.sendFrequency !== 0 ||
                ifExtracting ||
                ifCompleted,
            },
            {
              icon: '',
              label: '删除',
              color: 'error',
              onClick: delProExtDetail.bind(null, record),
              disabled:
                record.proExtraction.status === 2 ||
                record.proExtraction.sendFrequency !== 0 ||
                ifExtracting ||
                ifCompleted,
            },
          ]"
        />
      </template>
    </BasicTable>
    <DoReviewWithPostponeDrawerVue @register="registerDrawer" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, reactive, ref, toRaw } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import {
    expertListTableSchema,
    expertListQueryFormSchema,
    extractExpertManualExtractDetailTableSchema,
  } from '/@/views/library-management/review-node/components/extractExpertManual/extractExpertManual.data';
  import { Tooltip } from 'ant-design-vue';
  import ExtractExpertManualTooltip from '../extractTooltip/ExtractExpertManualTooltip.vue';
  import { ReviewNodeI } from '/@/views/library-management/review-node/typing';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { removeItemFromArr } from '/@/utils/commonServe';
  import { getExtractionExpertsListByPageAndSortDto } from '/@/api/system/UserManagementAuditApi';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import {
    doProExtractionMessageById,
    extractionExpertsById,
    getProExtractionListByPageAndSortSumDto,
  } from '/@/api/review-node/proExtraction';
  import { useExpertExtractionMixin } from '../expert-extraction.mixin';
  import { useReviewNodeComputed } from '../useReviewNodeComputed';
  import ProExtTableTitleVue from '../ProExtTableTitle.vue';
  import DoReviewWithPostponeDrawerVue from '/@/views/openTender_4_5/projectMng_4_5_3/inProcurement/DoReviewWithPostponeDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';

  const [registerDrawer, { openDrawer }] = useDrawer();

  // BLOCK: props emit
  const props = defineProps({
    reviewNode: {
      type: Object as PropType<ReviewNodeI>,
    },
  });
  const emit = defineEmits(['refresh:review-node']); // 刷新结点信息
  // BLOCK: design
  const { prefixCls } = useDesign('extract-expert-manual');
  // BLOCK: state
  const loading = reactive({
    sendMessageBtn: false, // 发送短信的 loading
    extRowIdList: [] as any[], // 当前正在抽取的行的 id 列表
  });
  const tableLoading = reactive({
    expertList: [] as number[],
    proExtList: [],
  });
  // 以下两个的暂存不需要响应式应该
  let proExtList = ref([]); // 抽取详情列表
  const { createMessage } = useMessage();

  // BLOCK: 待抽取专家列表  and query
  const expertListHqlQueryDtoActionType = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'user.ifDelete', type: 'equal', value: [0] },
        { param: 'user.useMark', type: 'equal', value: [1] },
        { param: 'user.approveStatus', type: 'equal', value: [1] },
        {
          param: 'user.role',
          type: 'or',
          value: [orParamsFormatter('(user.role=3 or user.ifSchoolExpert=1)')],
        },
      ],
      dataFieldList: ['user', 'userExtend'],
      sorts: [{ dir: 'asc', prop: 'user.id' }],
    },
  });
  const [registerTable, { reload: reloadExpertList }] = useTable({
    immediate: false,
    ...DEFAULT_TABLE_SETTING_GETTER('待抽取专家列表', 80),
    api: getExtractionExpertsListByPageAndSortDto, // api
    columns: expertListTableSchema(),
    useSearchForm: true,
    formConfig: {
      labelWidth: 130,
      schemas: expertListQueryFormSchema(),
      autoSubmitOnEnter: true,
    },
    beforeFetch: (queryInfo: any) => {
      expertListHqlQueryDtoActionType.resetHqlQueryDto(); // 先重置
      if (queryInfo.page && queryInfo.pageSize) {
        expertListHqlQueryDtoActionType.setPage({
          pageNum: queryInfo.page,
          pageSize: queryInfo.pageSize,
        });
      }
      if (queryInfo.expertName) {
        expertListHqlQueryDtoActionType.appendQueryList({
          param: 'user.perName',
          type: 'like',
          value: [queryInfo.expertName],
        });
      }
      if (queryInfo.expertMobile) {
        expertListHqlQueryDtoActionType.appendQueryList({
          param: 'user.mobile',
          type: 'equal',
          value: [queryInfo.expertMobile],
        });
      }
      const queryDto = expertListHqlQueryDtoActionType.getHqlQueryDto();
      return queryDto;
    },
    afterFetch: (data) => {
      // 处理禁用
      const expertUserIdList = proExtList.value.map((item: any) => item.user.id);
      data.forEach((item: any) => {
        item.disabled = expertUserIdList.indexOf(item.user.id) > -1;
      });
      return data;
    },
    canResize: false,
  });
  /**
   * 抽取专家
   */
  const handleExtract = async (record) => {
    tableLoading.expertList.push(1);
    loading.extRowIdList.push(record.user.id); // 正在抽取的专家 id
    try {
      await extractionExpertsById(record.user.id, props.reviewNode?.id);
      createMessage.success('抽取成功！');
      refreshExtractHandler.value?.();
    } finally {
      removeItemFromArr(loading.extRowIdList, record.user.id); // 移除正在抽取的专家
      tableLoading.expertList.pop();
    }
  };

  // BLOCK: ======================== [抽取详情表格] ===========================
  const proExtractionHqlQueryDtoActionType = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'proExtraction.ifDelete', type: 'equal', value: [0] },
        { param: 'proExtraction.reviewId', type: 'equal', value: [props.reviewNode?.id + ''] },
        { param: 'proExtraction.ifShow', type: 'equal', value: [1] },
        {
          param: 'user.role',
          type: 'or',
          value: [orParamsFormatter('(user.role=3 or user.ifSchoolExpert=1)')],
        },
      ],
      dataFieldList: ['user', 'userExtend', 'proExtraction'],
      sorts: [{ dir: 'asc', prop: 'user.id' }],
      page: null,
    },
  });
  const [registerExtractDetailTable, { reload: reloadProExtList }] = useTable({
    immediate: false,
    ...DEFAULT_TABLE_SETTING_GETTER('抽取记录列表', 120),
    api: getProExtractionListByPageAndSortSumDto, // api
    columns: extractExpertManualExtractDetailTableSchema(),
    beforeFetch: () => {
      proExtractionHqlQueryDtoActionType.updateQueryItem({
        param: 'proExtraction.reviewId',
        value: [props.reviewNode?.id + ''],
      }); // 先重置
      const queryDto = proExtractionHqlQueryDtoActionType.getHqlQueryDto();
      return queryDto;
    },
    afterFetch: (data) => {
      proExtList.value = data;
      return data;
    },
    pagination: false,
    canResize: false,
  });

  const doReviewNode3 = (reviewNode) => {
    if (reviewNode.node === 3) {
      if (props.reviewNode?.statusId === 3) {
        openDrawer(true, {
          id: reviewNode.objectId,
          proReviewNodeId: reviewNode.id,
          scene: 2,
        });
      } else {
        doReviewManual(
          reviewNode,
          openDrawer.bind(null, true, {
            id: reviewNode.objectId,
            proReviewNodeId: reviewNode.id,
            scene: 2,
          }),
        );
      }
    } else {
      doReviewManual(reviewNode);
    }
  };

  // BLOCK: 混入
  const {
    reviewLoading,
    refreshExtractHandler,
    doReview: doReviewManual,
    setTakePartInExtDetail,
    delProExtDetail,
    getReviewBtnName,
  } = useExpertExtractionMixin(props.reviewNode);

  refreshExtractHandler.value = async () => {
    emit('refresh:review-node');
    await reloadProExtList();
    await reloadExpertList();
  };

  const reviewNodeComputed = computed(() => {
    return props.reviewNode;
  });
  const {
    ifWaitExtracting,
    ifCompleted,
    ifExtracting,
    ifHasExtracted,
    ifCompletedAndReviewNodeNotEqual3,
  } = useReviewNodeComputed(reviewNodeComputed);

  // BLOCK: ======================== [抽取 按钮： 发送短信 发起评审] ===========================
  const doProExtractionAndMessage = async () => {
    try {
      loading.sendMessageBtn = true;
      // todo 抽取接口 doProExtractionMessageById
      // await proExtractionControllerApi.doProExtractionMessageById(props.reviewNode?.id);
      await doProExtractionMessageById(props.reviewNode?.id);
      createMessage.success('发送成功！');
      setTimeout(async () => {
        refreshExtractHandler.value?.();
        loading.sendMessageBtn = false;
      }, 500);
    } finally {
      loading.sendMessageBtn = false;
    }
  };

  // BLOCK: ====================== on mounted ====================
  onMounted(async () => {
    await reloadProExtList();
    await reloadExpertList();
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-extract-expert-manual';
</style>
