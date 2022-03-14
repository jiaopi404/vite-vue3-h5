<template>
  <div :class="prefixCls">
    <AddExpertExtractionCondition
      :review-node="reviewNode"
      :pro-ext-condition-list="shallowRefExtCondList"
      ref="addExpertExtractionConditionRef"
      @refresh:review-node="noNullableRefreshExtractHandler"
    />
    <BasicTable @register="registerExtractConditionTable">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '编辑',
              onClick: editProExtCondition.bind(null, record),
              disabled:
                !(
                  record.proExtractionConditions.status === 1 ||
                  record.proExtractionConditions.status === 3
                ) ||
                ifExtracting ||
                ifCompleted,
            },
            {
              icon: '',
              label: '删除',
              color: 'error',
              onClick: delProExtCondition.bind(null, record),
              disabled:
                !(record.proExtractionConditions.status === 1) || ifExtracting || ifCompleted,
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
            <ExtractExpertRandomTooltip />
          </template>
          <AButton type="primary" color="warning"> 查看抽取规则 </AButton>
        </Tooltip>
        <AButton
          type="primary"
          :loading="doExtLoading"
          @click="doExtraction"
          :disabled="!shallowRefExtCondList.length || ifExtracting || ifCompleted || ifHasExtracted"
        >
          {{ ifExtracting ? '抽取中...' : '开始抽取' }}
        </AButton>
        <AButton
          type="primary"
          :loading="reviewLoading"
          @click="doReviewNode3(reviewNode)"
          :disabled="
            !shallowRefExtCondList.length ||
            ifWaitExtracting ||
            ifExtracting ||
            ifCompletedAndReviewNodeNotEqual3
          "
        >
          {{ getReviewBtnName }}
        </AButton>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
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
  import { computed, ref, shallowRef, toRaw } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import {
    extractExpertRandomExtractConditionTableSchema,
    extractExpertRandomExtractDetailTableSchema,
  } from '/@/views/library-management/review-node/components/extractExpertRandom/extractExpertRandom.data';
  import AddExpertExtractionCondition from '../addExpertExtractionCondition/AddExpertExtractionCondition.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { ReviewNodeI } from '/@/views/library-management/review-node/typing';
  import { Tooltip } from 'ant-design-vue';
  import ExtractExpertRandomTooltip from '/@/views/library-management/review-node/components/extractTooltip/ExtractExpertRandomTooltip.vue';
  import { useExpertExtractionMixin } from '/@/views/library-management/review-node/components/expert-extraction.mixin';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import {
    doProExtractionById,
    getProExtractionListByPageAndSortSumDto,
  } from '/@/api/review-node/proExtraction';
  import {
    deleteProExtractionConditionsByIdAndReviewId,
    getProExtractionConditionsListByPageAndSortSumDto,
  } from '/@/api/review-node/proExtractionConditions';
  import { useReviewNodeComputed } from '../useReviewNodeComputed';
  import ProExtTableTitleVue from '../ProExtTableTitle.vue';
  import DoReviewWithPostponeDrawerVue from '/@/views/openTender_4_5/projectMng_4_5_3/inProcurement/DoReviewWithPostponeDrawer.vue';
  import { useDrawer } from '/@/components/Drawer';

  const [registerDrawer, { openDrawer }] = useDrawer();

  // BLOCK: design
  const { prefixCls } = useDesign('extract-expert-random');
  const { createConfirmPromise, createMessage } = useMessage();

  // BLOCK: props
  const props = defineProps({
    reviewNode: {
      type: Object as PropType<ReviewNodeI>,
    },
  });
  const emit = defineEmits(['refresh:review-node']); // 刷新结点信息

  // BLOCK: state
  const addExpertExtractionConditionRef = ref<Nullable<any>>(null);
  const doExtLoading = ref<boolean>(false); // 开始抽取的 loading
  const shallowRefExtCondList = shallowRef([]); // 抽取条件 ref
  const shallowRefProExtList = shallowRef([]); // 抽取详情 ref

  // BLOCK: 抽取条件列表
  const queryDtoActionProExtCond = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'proExtractionConditions.ifDelete', type: 'equal', value: [0] },
        {
          param: 'proExtractionConditions.reviewId',
          type: 'equal',
          value: [props.reviewNode?.id ?? 0],
        },
      ],
      dataFieldList: ['proExtractionConditions', 'dictionary'],
      sorts: [
        { dir: 'desc', prop: 'proExtractionConditions.updateDateTime' },
        { dir: 'desc', prop: 'proExtractionConditions.id' },
      ],
    },
  });
  const [registerExtractConditionTable, { reload: reloadExtCondList }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER('抽取条件列表', 100),
    api: getProExtractionConditionsListByPageAndSortSumDto,
    columns: extractExpertRandomExtractConditionTableSchema(),
    beforeFetch: () => {
      queryDtoActionProExtCond.updateQueryItem({
        param: 'proExtractionConditions.reviewId',
        value: [props.reviewNode?.id + ''],
      }); // 先重置
      const queryDto = queryDtoActionProExtCond.getHqlQueryDto();
      return queryDto;
    },
    afterFetch: (data) => {
      shallowRefExtCondList.value = data;
      return data;
    },
    pagination: false,
    canResize: false,
  });
  /**
   * 编辑 抽取条件
   */
  const editProExtCondition = (record) => {
    addExpertExtractionConditionRef.value?.editProExtCondition(toRaw(record)); // 编辑
  };
  /**
   * 删除抽取条件
   */
  const delProExtCondition = async (record) => {
    await createConfirmPromise({
      title: CustomMsgEnum.DEL_CONFIRM_TIP,
    });
    const id = record.proExtractionConditions.id;
    const reviewId = record.proExtractionConditions.reviewId;
    // 调用删除接口
    await deleteProExtractionConditionsByIdAndReviewId(id, reviewId);
    createMessage.success(CustomMsgEnum.DEL_SUCCESS);
    addExpertExtractionConditionRef.value?.resetEditing(record.proExtractionConditions.id);
    // 刷新
    refreshExtractHandler.value?.();
  };

  // BLOCK: ======================== [抽取详情列表] ===========================
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
    ...DEFAULT_TABLE_SETTING_GETTER('抽取记录列表', 120),
    api: getProExtractionListByPageAndSortSumDto, // api
    columns: extractExpertRandomExtractDetailTableSchema(),
    beforeFetch: () => {
      proExtractionHqlQueryDtoActionType.updateQueryItem({
        param: 'proExtraction.reviewId',
        value: [props.reviewNode?.id + ''],
      }); // 先重置
      const queryDto = proExtractionHqlQueryDtoActionType.getHqlQueryDto();
      return queryDto;
    },
    afterFetch: (data) => {
      shallowRefProExtList.value = data;
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
        doReviewRandom(
          reviewNode,
          openDrawer.bind(null, true, {
            id: reviewNode.objectId,
            proReviewNodeId: reviewNode.id,
            scene: 2,
          }),
        );
      }
    } else {
      doReviewRandom(reviewNode);
    }
  };

  // BLOCK: 混入
  const {
    reviewLoading, // 评审 loading
    refreshExtractHandler,
    doReview: doReviewRandom,
    delProExtDetail,
    getReviewBtnName,
  } = useExpertExtractionMixin(props.reviewNode);

  refreshExtractHandler.value = async () => {
    emit('refresh:review-node');
    reloadExtCondList();
    reloadProExtList();
  };

  const noNullableRefreshExtractHandler = () => {
    console.log('skfjsdf');
    refreshExtractHandler.value?.();
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

  // BLOCK: ======================== [随机抽取方法，开始抽取，抽取完成] ===========================
  const doExtraction = async () => {
    try {
      doExtLoading.value = true;
      // 抽取接口
      await doProExtractionById(props.reviewNode?.id);
      setTimeout(async () => {
        // 重置抽取条件的选择项
        addExpertExtractionConditionRef.value?.resetHandler();
        await refreshExtractHandler.value?.();
        doExtLoading.value = false;
      }, 500);
    } finally {
      doExtLoading.value = false;
    }
  };
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-extract-expert-random';
</style>
