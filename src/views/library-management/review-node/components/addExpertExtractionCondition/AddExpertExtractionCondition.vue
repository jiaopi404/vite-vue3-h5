<template>
  <div class="p-5" :class="prefixCls">
    <BasicForm @register="registerForm" :disabled="ifExtracting || ifCompleted">
      <template #researchAreaCategory="{ model, field }">
        <Select
          placeholder="请选择专家类型"
          :allowClear="true"
          :show-search="true"
          option-label-prop="label"
          v-model:value="model[field]"
          :options="optionsResearchAreaCategory"
          :disabled="!!proExtCondition?.id"
          @change="changeHandlerResearchAreaCategory"
        />
      </template>
      <template #researchArea="{ model, field }">
        <TreeSelect
          placeholder="请选择专业类别"
          :treeCheckable="true"
          v-model:value="model[field]"
          :tree-data="optionsResearchArea"
          :disabled="!!proExtCondition?.id || !model['researchAreaCategoryId']"
          @change="changeHandlerResearchArea"
        />
      </template>
      <template #userNumber="{ model, field }">
        <InputNumber
          v-model:value="model[field]"
          :max="model['currentPerCount'] || 1000000000"
          :precision="0"
          :min="0"
          placeholder="请输入抽取人数"
          :disabled="!model['researchAreaCategoryId'] || !model['researchAreaId']"
          @change="changeHandlerUserNumber(model, field)"
        />
      </template>
      <template #currentPerCount="{ model, field }">
        <span>{{ model[field] ? model[field] : 0 }}人</span>
      </template>
    </BasicForm>
    <div :class="`${prefixCls}-submit-btn`" class="flex justify-center align-center">
      <AButton @click="resetHandler" :disabled="ifExtracting || ifCompleted">重置</AButton>
      <AButton
        class="ml-5"
        @click="saveHandler"
        :loading="loading.saveBtn"
        type="primary"
        :disabled="ifExtracting || ifCompleted"
      >
        <span v-if="ifAddProExtCond">添加</span>
        <span v-if="ifEditProExtCond">保存</span>
      </AButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, ref, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useDesign } from '/@/hooks/web/useDesign';
  import AButton from '/@/components/Button/src/BasicButton.vue';
  import { TreeSelect, Select, InputNumber } from 'ant-design-vue';
  import {
    addExpertExtractionConditionFormSchema,
    // researchAreaIdComponentsPropsGetter,
  } from '/@/views/library-management/review-node/components/addExpertExtractionCondition/addExpertExtractionCondition.data';
  import { ProExtConditionI, ReviewNodeI } from '/@/views/library-management/review-node/typing';
  import { useUserStore } from '/@/store/modules/user';
  import { useReviewNodeComputed } from '../useReviewNodeComputed';
  import {
    getUserCountByExpertType,
    saveProExtractionConditionsAndProExtraction,
  } from '/@/api/review-node/proExtractionConditions';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useConfigStore } from '/@/store/modules/config';
  import { getDictionaryByParentId, getDictionaryTreeByParentId } from '/@/api/demo/system';
  import * as TreeHelper from '/@/utils/helper/treeHelper';

  // BLOCK: props emit
  const props = defineProps({
    // 抽取条件列表，用于处理树的禁用
    proExtConditionList: {
      type: [Array, Object] as PropType<null | any[]>,
      default: () => [],
    },
    // 评审节点信息
    reviewNode: {
      type: Object as PropType<ReviewNodeI>,
    },
  });

  const emit = defineEmits(['save-success', 'refresh:review-node']);

  const { prefixCls } = useDesign('add-expert-extraction-condition');

  const { createMessage } = useMessage();

  const configStore = useConfigStore();

  // BLOCK: state, mixin 的数据
  const reviewNodeRef = computed(() => {
    return props.reviewNode;
  });
  const proExtCondition = ref<Nullable<ProExtConditionI>>(null);
  const { ifCompleted, ifExtracting, ifHasExtracted, ifAddProExtCond, ifEditProExtCond } =
    useReviewNodeComputed(reviewNodeRef, proExtCondition);

  // BLOCK: state
  const [registerForm, { resetFields, setFieldsValue, getFieldsValue, validate, clearValidate }] =
    useForm({
      // schemas: addExpertExtractionConditionFormSchema(props.reviewNode, proExtCondition),
      schemas: addExpertExtractionConditionFormSchema(ifAddProExtCond, ifEditProExtCond),
      labelWidth: 115,
      showActionButtonGroup: false,
    });
  const loading = reactive({
    saveBtn: false, // 保存按钮
  });
  // added research area id list, for researchAreaTree's leaf disabled
  const addedResearchAreaIdList = computed(() => {
    const proExtConditionList = props.proExtConditionList?.map(
      (item) => item.proExtractionConditions,
    );
    if (proExtConditionList && proExtConditionList.length) {
      return proExtConditionList
        .reduce((prev, item) => {
          if (item.researchAreaIds) {
            prev.push(item.researchAreaIds);
          }
          return prev;
        }, [])
        .join(',')
        .split(',')
        .map(Number);
    } else {
      return [];
    }
  });

  // 监听添加过的专业的 id 列表，设置禁用性
  watch([() => addedResearchAreaIdList.value], () => {
    // console.log('有没有监听到呢？', JSON.parse(JSON.stringify(toRaw(unref(optionsResearchArea)))));
    // const _opt = toRaw(unref(optionsResearchArea));
    // optionsResearchArea.value = setResearchAreaOptionsDisabled(_opt);
    const _formData = getFieldsValue();
    if (_formData['researchAreaCategoryId']) {
      reloadResearchArea(_formData['researchAreaCategoryId']);
    }
  });

  // BLOCK: 组件的 各种方法， api 等
  // 专业类别
  const optionsResearchAreaCategory = ref([]);
  const reloadResearchAreaCategory = async () => {
    const _opts = await getDictionaryByParentId(configStore.GET_CONFIG_DICTIONRY?.expertTypeId);
    optionsResearchAreaCategory.value = _opts.map((item) => ({
      ...item,
      value: item.id,
      label: item.name,
    }));
  };
  onMounted(() => {
    reloadResearchAreaCategory(); // 拉取类型
  });
  const changeHandlerResearchAreaCategory = async (e) => {
    // changehandler
    setFieldsValue({ researchAreaId: undefined }); // 置空 树状下拉
    nextTick(() => {
      clearValidate('researchAreaId');
    });
    // 如果有值，重新拉取专业
    if (e) {
      reloadResearchArea(e);
    }
  };

  // 专业
  const optionsResearchArea = ref([]);
  // 计算专业下拉列表的禁用
  const setResearchAreaOptionsDisabled = (options) => {
    TreeHelper.forEach(options, (item) => {
      item.value = item.id;
      item.label = item.name;
      const _disabled = addedResearchAreaIdList.value.indexOf(item.id) > -1;
      item.disabled = _disabled;
      item.disableCheckbox = _disabled;
      item.selectable = false;
    });
    return options;
  };
  const reloadResearchArea = async (dicParentId) => {
    const _opt = await getDictionaryTreeByParentId(dicParentId);
    optionsResearchArea.value = setResearchAreaOptionsDisabled(_opt);
  };
  const changeHandlerResearchArea = async (e) => {
    if (e && e.length) {
      reloadCurrentPerCount(e);
    } else {
      setFieldsValue({ currentPerCount: 0 }); // 置空 树状下拉
    }
  };

  // 抽取人数userNumber
  const changeHandlerUserNumber = (model, field) => {
    model[field] = Math.min(model['currentPerCount'], model[field]);
  };

  // 可抽取人数 userCount
  // const currentPerCount = ref<Nullable<number>>(0);
  const reloadCurrentPerCount = async (researchAreaArr) => {
    const _formData = getFieldsValue();
    const currentPerCount = await getUserCountByExpertType(
      _formData['researchAreaCategoryId'],
      researchAreaArr.join(','),
      props.reviewNode?.id,
      proExtCondition.value?.id,
    );
    setFieldsValue({ currentPerCount });
  };

  // BLOCK: 前处理 后处理
  function editPrevProcess(proExtCondition) {
    // proExtCondition.value = proExtCondition;
    return {
      researchAreaCategoryId: proExtCondition.expertCategoryId,
      researchAreaId: proExtCondition.researchAreaIds.split(',').map((item) => Number(item)),
      userNumber: proExtCondition.userNumber,
      currentPerCount: 0,
    };
  }
  function savePrevProcess() {
    const userStore = useUserStore();
    const formData = getFieldsValue();
    // researchAreaId 字段，数据库设计，varChar；备注：向下递归查找所有子专业，存储到此字段中
    const _proExtCondition: ProExtConditionI = {
      reviewId: props.reviewNode?.id,
      expertCategoryId: formData.researchAreaCategoryId,
      researchAreaIds: formData.researchAreaId.join(','), // List, joined by ','
      userNumber: formData.userNumber,
      addUserId: userStore.getUserInfo.id,
      status: unref(ifEditProExtCond) ? unref(proExtCondition)?.status : 1, // extraction status, 1: waiting for extraction 2: extracting 3: extract failed 4: extract succeed
      userCount: unref(ifEditProExtCond) ? unref(proExtCondition)?.userCount : 0, // user count for extract succeed
    };
    if (unref(ifEditProExtCond)) {
      _proExtCondition.id = unref(proExtCondition)?.id;
    }
    return _proExtCondition as ProExtConditionI;
  }

  // BLOCK: 保存的 handler
  const saveHandler = async () => {
    loading.saveBtn = true;
    try {
      await validate();
      const _proExtCond = savePrevProcess();
      await saveProExtractionConditionsAndProExtraction(_proExtCond);
      createMessage.success('保存成功');
      resetHandler();
      // emit('save-success'); // 保存成功
      emit('refresh:review-node');
    } catch (err) {
      console.log('validate error: ', err);
    } finally {
      loading.saveBtn = false;
    }
  };

  // BLOCK: expose 的方法
  const resetHandler = () => {
    resetFields();
    setFieldsValue({
      currentPerCount: 0,
    });
    if (unref(proExtCondition)) {
      proExtCondition.value = null;
    }
  };

  const editProExtCondition = async (_proExtCondition) => {
    console.log('edit .....', _proExtCondition);
    proExtCondition.value = _proExtCondition.proExtractionConditions;
    const _formData = editPrevProcess(_proExtCondition.proExtractionConditions);
    // nextTick 更新 schema
    const _count = await getUserCountByExpertType(
      _formData['researchAreaCategoryId'],
      _formData['researchAreaId'].join(','),
      props.reviewNode?.id,
      proExtCondition.value?.id,
    );
    setFieldsValue({
      ...editPrevProcess(_proExtCondition.proExtractionConditions),
      userNumber: Math.min(_count ?? 0, _formData.userNumber),
      currentPerCount: _count || 0,
    }); // 设置值
    reloadResearchArea(_formData['researchAreaCategoryId']);
  };
  const resetEditing = (id) => {
    if (unref(proExtCondition)?.id === id) {
      resetHandler();
    }
  };
  defineExpose({
    editProExtCondition,
    resetEditing,
    resetHandler,
  });
</script>
<script lang="ts">
  import { computed, defineComponent, nextTick, onMounted, reactive, toRaw, watch } from 'vue';

  export default defineComponent({
    name: 'AddExpertExtractionCondition',
  });
</script>

<style lang="less" scoped></style>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-add-expert-extraction-condition';
</style>
