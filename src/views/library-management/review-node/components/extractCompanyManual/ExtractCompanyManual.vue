<template>
  <div :class="prefixCls">
    <BasicTable @register="registerTable" :loading="!!tableLoading.list.length">
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              icon: '',
              label: '抽取',
              color: 'success',
              onClick: handleExtract.bind(null, record),
              disabled:
                loading.extRowIdList.indexOf(record?.biddingCompany?.user?.id) !== -1 ||
                getBtnDisabled(record),
            },
          ]"
        />
      </template>
    </BasicTable>
    <BasicTable @register="registerExtractDetailTable">
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
          :disabled="!proExtList.length || ifExtracting || ifWaitExtracting || ifCompleted"
          @click="doReviewManual(reviewNode)"
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
                record.proExtraction.sendFrequency !== 0 ||
                record.proExtraction.status === 2 ||
                ifExtracting ||
                ifCompleted,
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts" setup>
  import { computed, reactive, ref, toRaw } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import {
    companyListTableSchema,
    companyListQueryFormSchema,
    companyProExtListSchema,
  } from '/@/views/library-management/review-node/components/extractCompanyManual/extractCompanyManual.data';
  import { Tooltip } from 'ant-design-vue';
  import ExtractExpertManualTooltip from '../extractTooltip/ExtractExpertManualTooltip.vue';
  import { ReviewNodeI } from '/@/views/library-management/review-node/typing';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { removeItemFromArr } from '/@/utils/commonServe';
  import {
    doProExtractionMessageById,
    extractionExpertsById,
    getProExtractionAndBiddingCompanyListByPageAndSortSumDto,
    getProExtractionListByPageAndSortSumDto,
  } from '/@/api/review-node/proExtraction';
  import { useExpertExtractionMixin } from '../expert-extraction.mixin';
  import { getBiddingCompanyPageByQueryDto } from '/@/api/review-node/biddingCompany';
  import { useReviewNodeComputed } from '../useReviewNodeComputed';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';

  // BLOCK: props emit
  const props = defineProps({
    reviewNode: {
      type: Object as PropType<ReviewNodeI>,
    },
    projectInfo: {
      type: Object as PropType<Recordable | undefined>,
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
    list: [] as number[],
    proExtList: [],
  });
  // 以下两个的暂存不需要响应式应该
  let proExtList = ref<any[]>([]); // 抽取详情列表
  const { createMessage } = useMessage();

  // BLOCK: 待抽取公司列表  and query
  const companyListHqlQueryDtoActionType = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'biddingCompany.ifDelete', type: 'equal', value: [0] },
        { param: 'biddingCompany.useMark', type: 'equal', value: [1] },
        { param: 'biddingCompany.user.approveStatus', type: 'equal', value: [1] },
        { param: 'biddingCompany.user.ifDelete', type: 'equal', value: [0] },
        { param: 'biddingCompany.user.useMark', type: 'equal', value: [1] },
        { param: 'biddingCompany.user.role', type: 'equal', value: [5] },
        {
          param: '',
          type: 'or',
          value: [
            orParamsFormatter(
              `(FIND_IN_SET(${props.projectInfo?.projectType.id}, biddingCompany.businessType) > 0)`,
            ),
          ],
        },
      ],
      dataFieldList: ['biddingCompany', 'biddingCompany.id'],
      sorts: [{ dir: 'asc', prop: 'biddingCompany.id' }],
    },
  });
  const [registerTable, { reload: reloadCompanyList }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER('待抽取招标公司', 120),
    api: getBiddingCompanyPageByQueryDto, // api
    rowKey: 'biddingCompany_id',
    columns: companyListTableSchema(),
    useSearchForm: true,
    formConfig: {
      labelWidth: 130,
      schemas: companyListQueryFormSchema,
      autoSubmitOnEnter: true,
    },
    beforeFetch: (queryInfo: any) => {
      companyListHqlQueryDtoActionType.resetHqlQueryDto(); // 先重置
      if (queryInfo.page && queryInfo.pageSize) {
        companyListHqlQueryDtoActionType.setPage({
          pageNum: queryInfo.page,
          pageSize: queryInfo.pageSize,
        });
      }
      if (queryInfo.name) {
        companyListHqlQueryDtoActionType.appendQueryList({
          param: 'biddingCompany.name',
          type: 'like',
          value: [queryInfo.name],
        });
      }
      if (queryInfo.perName) {
        companyListHqlQueryDtoActionType.appendQueryList({
          param: 'biddingCompany.user.perName',
          type: 'like',
          value: [queryInfo.perName],
        });
      }
      const queryDto = companyListHqlQueryDtoActionType.getHqlQueryDto();
      return queryDto;
    },
    // afterFetch: (data) => {
    //   console.log('招标公司：data is: ', data);
    //   // 处理禁用 (需要保证 招标公司 和 负责人 一一对应)
    //   const userIdList = proExtList.map((item: any) => item.user?.id);
    //   data.forEach((item: any) => {
    //     console.log('item is: item', item);
    //     item.disabled = userIdList.indexOf(item.biddingCompany.user.id) > -1;
    //   });
    //   console.log('user id list is: ', )
    //   return data;
    // },
    canResize: false,
  });
  const getBtnDisabled = (record) => {
    const _userId = record?.biddingCompany?.user?.id;
    return (
      proExtList.value.findIndex((item) => item?.proExtraction.userId === _userId) > -1 ||
      ifExtracting.value ||
      ifCompleted.value ||
      // 分析 proExtList, 未回复 或 已参与的 数量 > 1 则禁用
      proExtList.value.filter(
        (item) => item?.proExtraction.status === 1 || item?.proExtraction.status === 2,
      ).length >= 1
    );
  };
  /**
   * 抽取招标公司
   */
  const handleExtract = async (record) => {
    tableLoading.list.push(1);
    loading.extRowIdList.push(record.biddingCompany.user.id); // 正在抽取的专家 id
    try {
      await extractionExpertsById(record.biddingCompany?.user.id, props.reviewNode?.id);
      createMessage.success('抽取成功！');
      refreshExtractHandler.value?.();
    } finally {
      removeItemFromArr(loading.extRowIdList, record.biddingCompany.user.id); // 移除正在抽取的专家
      tableLoading.list.pop();
    }
  };

  // BLOCK: ======================== [抽取详情表格] ===========================
  const proExtractionHqlQueryDtoActionType = useHqlQueryDto({
    hqlPageAndSortSumDto: {
      queryList: [
        { param: 'proExtraction.ifDelete', type: 'equal', value: [0] },
        { param: 'proExtraction.reviewId', type: 'equal', value: [props.reviewNode?.id + ''] },
        { param: 'proExtraction.ifShow', type: 'equal', value: [1] },
        { param: 'biddingCompany.ifDelete', type: 'equal', value: [0] },
      ],
      dataFieldList: ['proExtraction', 'biddingCompany'],
      sorts: [{ dir: 'desc', prop: 'proExtraction.addDateTime' }],
      page: null,
    },
  });
  const [registerExtractDetailTable, { reload: reloadProExtList }] = useTable({
    ...DEFAULT_TABLE_SETTING_GETTER('抽取记录列表', 120),
    api: getProExtractionAndBiddingCompanyListByPageAndSortSumDto, // api
    columns: companyProExtListSchema(),
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
    await reloadCompanyList();
  };

  const reviewNodeComputed = computed(() => {
    return props.reviewNode;
  });
  const { ifWaitExtracting, ifCompleted, ifExtracting, ifHasExtracted } =
    useReviewNodeComputed(reviewNodeComputed);

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
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-extract-expert-manual';
</style>
