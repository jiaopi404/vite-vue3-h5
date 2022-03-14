<template>
  <div :class="prefixCls">
    <Card title="抽取条件" size="small">
      <BasicForm
        @register="registerForm"
        @submit="handleSubmit"
        @reset="handleReset"
        :disabled="ifExtracting || ifCompleted"
      >
        <template #slotKeyword="{ model, field }">
          <Input
            v-model:value="model[field]"
            placeholder="请输入关键字"
            @change="changeHandlerKeyWordDebounce"
          />
        </template>
        <template #slotCompanyCount="{ model, field }">
          <span>{{ model[field] }}</span>
        </template>
      </BasicForm>
    </Card>
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
      <template #toolbar>
        <Tooltip overlay-class-name="extract-rule_tooltip_class-name">
          <template #title>
            <ExtractCompanyRandomTooltip />
          </template>
          <AButton type="primary" color="warning"> 查看抽取规则 </AButton>
        </Tooltip>
        <AButton
          type="primary"
          :loading="doExtLoading"
          :disabled="!shallowRefExtCondList.length || ifExtracting || ifCompleted || ifHasExtracted"
          @click="doExtraction"
        >
          {{ ifExtracting ? '抽取中...' : '开始抽取' }}
        </AButton>
        <AButton
          type="primary"
          :loading="reviewLoading"
          @click="doReviewRandom(reviewNode)"
          :disabled="!shallowRefExtCondList.length || ifWaitExtracting || ifExtracting"
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
              disabled: record.proExtraction.sendFrequency !== 0 || ifExtracting || ifCompleted,
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts" setup>
  import { computed, onMounted, reactive, ref, shallowRef, unref, watch } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicTable, useTable, TableAction } from '/@/components/Table';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useHqlQueryDto } from '/@/hooks/web/useHqlQueryDto';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { ProExtConditionI, ReviewNodeI } from '/@/views/library-management/review-node/typing';
  import { Tooltip, Input, Card } from 'ant-design-vue';
  import ExtractCompanyRandomTooltip from '/@/views/library-management/review-node/components/extractTooltip/ExtractCompanyRandomTooltip.vue';
  import { useExpertExtractionMixin } from '/@/views/library-management/review-node/components/expert-extraction.mixin';
  import { DEFAULT_TABLE_SETTING_GETTER } from '/@/settings/componentSetting';
  import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
  import {
    doProExtractionById,
    getProExtractionAndBiddingCompanyListByPageAndSortSumDto,
    getProExtractionListByPageAndSortSumDto,
  } from '/@/api/review-node/proExtraction';
  import {
    deleteProExtractionConditionsByIdAndReviewId,
    getProExtractionConditionsListByPageAndSortSumDto,
    getUserCountByExpertType,
    saveProExtractionConditionsAndProExtraction,
  } from '/@/api/review-node/proExtractionConditions';
  import {
    companyExtCondFormSchema,
    companyProExtListRandomSchema,
    extractCompanyRandomExtractConditionTableSchema,
  } from './extractCompanyRandom.data';
  import { useReviewNodeComputed } from '../useReviewNodeComputed';
  import { useUserStore } from '/@/store/modules/user';
  import { useDebounceFn } from '@vueuse/core';
  import { waitForPromise } from '/@/utils/commonServe';
  // import { getBiddingCompanyPageByQueryDto } from '/@/api/review-node/biddingCompany';

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
  const doExtLoading = ref<boolean>(false); // 开始抽取的 loading
  const shallowRefExtCondList = shallowRef([]); // 抽取条件 ref
  const shallowRefProExtList = shallowRef([]); // 抽取详情 ref

  const proExtCondition = ref<Nullable<ProExtConditionI>>(null);

  const loading = reactive({
    proExtCondForm: false,
  });

  // BLOCK: 关键字抽取条件
  const [registerForm, { getFieldsValue, setFieldsValue, setProps, resetFields, updateSchema }] =
    useForm({
      schemas: companyExtCondFormSchema(),
      labelWidth: 115,
      resetButtonOptions: {
        onClick: () => {
          resetHandler();
        },
      },
      submitButtonOptions: {
        text: '保存',
      },
      // showActionButtonGroup: false,
    });
  // 计算 company count，用于验证规则
  const getCompanyCount = async (kw): Promise<number> => {
    // const { getHqlQueryDto } = useHqlQueryDto({
    //   hqlPageAndSortSumDto: {
    //     queryList: [
    //       { param: 'biddingCompany.ifDelete', type: 'equal', value: [0] },
    //       { param: 'biddingCompany.useMark', type: 'equal', value: [1] },
    //       { param: 'biddingCompany.majorScope', type: 'like', value: [kw] },
    //     ],
    //     page: {
    //       pageNum: 1,
    //       pageSize: 10,
    //     },
    //     dataFieldList: ['biddingCompany.id', 'biddingCompany.name'],
    //     sorts: [{ dir: 'asc', prop: 'biddingCompany.id' }],
    //   },
    // });
    // const res = await getBiddingCompanyPageByQueryDto(getHqlQueryDto());
    // return res.page.totalElements as number;
    const count = await getUserCountByExpertType(
      null,
      null,
      props?.reviewNode?.id,
      proExtCondition.value?.id ?? null,
      kw,
    );
    return count ?? 0;
  };
  let initListFlag = false; // 用于标识是不是已经获取过列表
  // 设置初始的 company count
  const setInitCompanyCount = async () => {
    await waitForPromise(() => initListFlag, 3000);
    if (shallowRefExtCondList.value.length) {
      // 如果已经有查询条件了, 就不调用接口了
      return;
    }
    const count = await getCompanyCount('');
    setFieldsValue({ companyCount: count });
  };
  // 更新验证规则
  onMounted(async () => {
    await updateSchema({
      field: 'companyCount',
      rules: [
        {
          validator: async () => {
            const formData = getFieldsValue();
            const count = await getCompanyCount(formData.keyword || '');
            if (count === 0) {
              return Promise.reject(new Error('无可抽取公司！'));
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
    });
    setInitCompanyCount();
  });
  const submitDisabledComputed = computed(() => {
    const bool = shallowRefExtCondList.value?.length ? !ifEditProExtCond.value : false;
    return bool;
  });
  watch(
    () => submitDisabledComputed.value,
    (nv) => {
      setProps({
        submitButtonOptions: {
          text: ifEditProExtCond.value ? '保存' : '添加',
          disabled: nv,
        },
      });
    },
  );
  const changeHandlerKeyWordDebounce = useDebounceFn(async function (e) {
    const kw = e.target.value;
    // if (!kw) {
    //   setFieldsValue({ companyCount: 0 });
    //   return;
    // }
    const count = await getCompanyCount(kw);
    setFieldsValue({ companyCount: count });
  }, 800);

  const handleReset = async () => {
    setInitCompanyCount();
  };
  const handleSubmit = async () => {
    loading.proExtCondForm = true;
    try {
      const _proExtCond = savePrevProcess();
      await saveProExtractionConditionsAndProExtraction(_proExtCond);
      createMessage.success('保存成功');
      reloadExtCondList();
      noNullableRefreshExtractHandler(); // 刷新节点
      resetHandler();
      // emit('save-success'); // 保存成功
      emit('refresh:review-node');
    } finally {
      loading.proExtCondForm = false;
    }
  };
  function savePrevProcess() {
    const userStore = useUserStore();
    const formData = getFieldsValue();
    // researchAreaId 字段，数据库设计，varChar；备注：向下递归查找所有子专业，存储到此字段中
    const _proExtCondition: ProExtConditionI = {
      reviewId: props.reviewNode?.id,
      addUserId: userStore.getUserInfo.id,
      status: unref(ifEditProExtCond) ? unref(proExtCondition)?.status : 1, // extraction status, 1: waiting for extraction 2: extracting 3: extract failed 4: extract succeed
      keyWord: formData.keyword,
      userNumber: 1,
    };
    if (unref(ifEditProExtCond)) {
      _proExtCondition.id = unref(proExtCondition)?.id;
    }
    return _proExtCondition as ProExtConditionI;
  }

  const resetHandler = () => {
    resetFields();
    proExtCondition.value = null;
  };

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
    columns: extractCompanyRandomExtractConditionTableSchema(),
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
      initListFlag = true;
      return data;
    },
    pagination: false,
    canResize: false,
  });
  /**
   * 编辑 抽取条件
   */
  const editProExtCondition = async (record) => {
    const proExtCond = record?.proExtractionConditions;
    proExtCondition.value = proExtCond;
    setFieldsValue({ keyword: unref(proExtCondition)?.keyWord });
    const count = await getCompanyCount(proExtCond?.keyWord); // 回填 count
    setFieldsValue({ companyCount: count });
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
    if (record.proExtractionConditions.id === unref(proExtCondition)?.id) {
      resetHandler();
    }
    noNullableRefreshExtractHandler();
    // 刷新
    initListFlag = false;
    refreshExtractHandler.value?.();
    resetFields();
  };

  // BLOCK: ======================== [抽取详情列表] ===========================
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
    columns: companyProExtListRandomSchema(),
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

  // BLOCK: 混入
  const {
    reviewLoading, // 评审 loading
    refreshExtractHandler,
    doReview: doReviewRandom,
    setTakePartInExtDetail,
    delProExtDetail,
    getReviewBtnName,
  } = useExpertExtractionMixin(props.reviewNode);

  refreshExtractHandler.value = async () => {
    emit('refresh:review-node');
    reloadExtCondList();
    reloadProExtList();
  };

  const noNullableRefreshExtractHandler = () => {
    refreshExtractHandler.value?.();
  };

  const reviewNodeComputed = computed(() => {
    return props.reviewNode;
  });
  const { ifEditProExtCond, ifWaitExtracting, ifCompleted, ifExtracting, ifHasExtracted } =
    useReviewNodeComputed(reviewNodeComputed, proExtCondition);

  // BLOCK: ======================== [随机抽取方法，开始抽取，抽取完成] ===========================
  const doExtraction = async () => {
    try {
      doExtLoading.value = true;
      // 抽取接口
      await doProExtractionById(props.reviewNode?.id);
      setTimeout(async () => {
        // 重置抽取条件的选择项
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
