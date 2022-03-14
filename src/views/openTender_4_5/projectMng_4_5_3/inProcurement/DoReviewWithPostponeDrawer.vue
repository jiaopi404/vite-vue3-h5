<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="发起评审"
    width="576px"
    @ok="handleSubmit"
    @close="closeHandler"
  >
    <BasicForm @register="registerForm">
      <template #ifPostpone="{ model, field }">
        <RadioGroup
          v-model:value="model[field]"
          :options="[
            { value: 1, label: '是' },
            { value: 0, label: '否' },
          ]"
        />
      </template>
      <template #postponeTime="{ model, field }">
        <DatePicker
          style="width: 100%"
          v-model:value="model[field]"
          :showTime="{ format: 'HH:mm' }"
          placeholder="请选择顺延报价截止时间"
          :disabled-date="disabledDateFunc"
          @ok="okHandlerPostponeTime(model, field)"
        />
      </template>
      <template #postponeReason="{ model, field }">
        <Input.TextArea
          style="width: 100%"
          v-model:value="model[field]"
          :auto-size="{ minRows: 2, maxRows: 20 }"
          showCount
          :maxlength="5000"
          placeholder="请输入顺延原因"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { ref, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { RadioGroup, DatePicker, Input } from 'ant-design-vue';
  import { dateUtil, getDaySpan } from '/@/utils/dateUtil';
  import { getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
  import { getBidSectionDetailById } from '/@/api/purchase/plan-purchase';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { purchasingDoReview } from '/@/api/purchaseManagement/purchaseManagementApi';
  import { ReviewNodeI } from '/@/views/library-management/review-node/typing';

  const { prefixCls } = useDesign('do-review-with-postpone-drawer');
  const router = useRouter();
  const { createConfirmPromise, createMessage, createInfoModal } = useMessage();

  const emit = defineEmits(['refresh-list']);

  // BLOCK: state
  const bidSectionId = ref<Nullable<number>>(null); // 节点3 为 专家抽取
  const proReviewNodeId = ref<Nullable<number>>(null);
  const proReviewNode = ref<Nullable<ReviewNodeI>>(null); // 评审结点，判断是不是 null 来确定要更新到待成交
  const scene = ref<number>(0);

  const schemas: FormSchema[] = [
    {
      field: 'ifPostpone',
      label: '是否顺延',
      component: 'RadioGroup',
      slot: 'ifPostpone',
      required: true,
      defaultValue: 0,
    },
    {
      field: 'postponeTime',
      component: 'DatePicker',
      label: '顺延报价截止时间',
      slot: 'postponeTime',
      rules: [
        { required: true, message: '请选择顺延报价截止时间', trigger: 'change', type: 'date' },
        {
          validator: async (_, value) => {
            if (+new Date(value) < Date.now()) {
              return Promise.reject('顺延报价截止时间应晚于当前时间');
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
      ifShow: ({ model }) => {
        return !!model['ifPostpone'];
      },
    },
    {
      field: 'postponeReason',
      component: 'InputTextArea',
      label: '顺延原因',
      slot: 'postponeReason',
      rules: [
        { required: true, message: '请输入顺延原因', trigger: 'change', type: 'string' },
        getNamePatternRule(5000),
      ],
      ifShow: ({ model }) => {
        return !!model['ifPostpone'];
      },
    },
  ];
  const [registerForm, { validate, getFieldsValue }] = useForm({
    schemas,
    labelWidth: 130,
    showActionButtonGroup: false,
    baseColProps: { span: 22 },
  });
  // form item config
  const disabledDateFunc = (currentDate): boolean => {
    if (currentDate < Date.now() - getDaySpan()) {
      return true;
    } else {
      return false;
    }
  };
  // const disabledTimeFunc = (date): boolean => {
  //   console.log('Time is: ', dateUtil(date).format('YYYY-MM-DD HH:mm:ss'));
  //   return date < Date.now();
  // };

  const okHandlerPostponeTime = (model, field) => {
    if (!model[field]) {
      return;
    }
    if (+new Date(model[field]) < Date.now() - 1000) {
      createInfoModal({
        content: '顺延报价截止时间应晚于当前时间',
      });
      model[field] = undefined;
    }
  };

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading, changeLoading }] = useDrawerInner(
    async (data) => {
      bidSectionId.value = data.id;
      proReviewNodeId.value = data.proReviewNodeId;
      proReviewNode.value = data.proReviewNode ?? null; // 抽取结点
      scene.value = data.scene; // 场景值，用于区分抽取页面还是列表页
      changeLoading(true);
      changeLoading(false);
    },
  );

  const handleSubmit = async () => {
    // changeOkLoading(true);
    try {
      await validate();
      const formData = getFieldsValue();
      // 查询是否有报价供应商
      const bidSection = await getBidSectionDetailById(bidSectionId.value);
      if (!bidSection.ifHaveValidaSupplierQuotation && !formData.ifPostpone) {
        await createConfirmPromise({
          content: '无有效报价供应商，确认设为待成交吗？',
        });
      }
      // 列表直接点击发起评审 scene.value === 1
      // 有 有效报价 bidSection.ifHaveValidaSupplierQuotation
      // 不顺延 !formData.ifPostpone
      // 未抽取 !proReviewNode.value
      if (
        bidSection.ifHaveValidaSupplierQuotation &&
        !formData.ifPostpone &&
        !proReviewNode.value &&
        scene.value === 1
      ) {
        await createConfirmPromise({
          content: '该项目尚未抽取，确认更新到待成交吗？',
        });
      }
      await purchasingDoReview({
        bidSectionId: bidSectionId.value,
        ifPostpone: !!formData.ifPostpone,
        postponeTime: +new Date(formData.postponeTime),
        postponeReason: formData.postponeReason,
        proReviewNodeId: proReviewNodeId.value,
      });
      createMessage.success('操作成功！');
      if (scene.value === 1) {
        emit('refresh-list');
      } else {
        // TODO: 返回
        router.back();
      }
      closeDrawer();
    } finally {
      changeOkLoading(false);
    }
  };

  const closeHandler = () => {
    bidSectionId.value = null;
    proReviewNodeId.value = null;
    scene.value = 0;
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-do-review-with-postpone-drawer';
</style>
