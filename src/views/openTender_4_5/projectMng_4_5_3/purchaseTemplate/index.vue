<template>
  <PageWrapper :class="prefixCls" title="" :contentFullHeight="true" v-loading="loading">
    <template #default>
      <div class="lx-pt_form">
        <LxPurchaseTemplatePreview :id="bidSectionIdRef" :difference="false">
          <BasicForm @register="register" ref="basicFormRef">
            <template #proNameSlot="{ model, field }">
              <Input v-model:value="model[field]" :disabled="true" />
            </template>
            <template #proNumber="{ model, field }">
              <Input v-model:value="model[field]" placeholder="请填写项目编号" />
            </template>
            <template #quoteEndTime="{ model, field }">
              <DatePicker
                style="width: 100%"
                v-model:value="model[field]"
                show-time
                placeholder="请选择开标时间"
                @ok="clearcheck"
              />
            </template>
            <template #quoteLocation="{ model, field }">
              <Input v-model:value="model[field]" placeholder="请填写开标地点" />
            </template>
          </BasicForm>
        </LxPurchaseTemplatePreview>
      </div>
    </template>
    <template #rightFooter>
      <Button class="mr-3" @click="clickHandlePreview" color="primary">预览</Button>
      <Button type="info" class="mr-3" @click="clickHandleCancel">返回</Button>
      <Button @click="clickHandleSave" color="primary">保存</Button>
    </template>
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { PageWrapper } from '/@/components/Page';
  import { Button } from '/@/components/Button';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { Input, DatePicker } from 'ant-design-vue';

  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRoute, useRouter } from 'vue-router';
  import { onMounted, ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import LxPurchaseTemplatePreview from '/@/components/LxComponents/LxTemplatePreview/LxPurchaseTemplatePreview.vue';
  import {
    checkBidSectionRepeat,
    getBidSectionById,
    saveBidSection,
  } from '/@/api/purchase/plan-purchase';
  import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';
  import { debouncePromise, waitForPromise } from '/@/utils/commonServe';
  import { CustomMsgEnum } from '/@/enums/messageEnum';
  import { useTabs } from '/@/hooks/web/useTabs';

  // BLOCK: hooks
  const { prefixCls } = useDesign('purchase-template');
  const route = useRoute();
  const router = useRouter();
  const { createMessage } = useMessage();

  const basicFormRef = ref<any>(null);

  // BLOCK: common state
  const bidSectionRef = ref<Nullable<any>>(null);
  let bidSectionIdRef = ref<any>(null);

  const loading = ref<boolean>(false);

  const purchaseTemplateFormSchema: FormSchema[] = [
    {
      field: 'proName',
      component: 'Input',
      label: '项目名称',
      slot: 'proNameSlot',
      colProps: {
        span: 8,
      },
      required: false,
    },
    {
      field: 'proNumber',
      component: 'Input',
      label: '项目编号',
      slot: 'proNumber',
      colProps: {
        span: 8,
      },
      rules: [
        { required: true, message: '请填写项目编号', trigger: 'change', type: 'string' },
        getNamePatternNoSpaceRule(30, 'change', 1),
        {
          trigger: 'change',
          validator: debouncePromise(async (_, value) => {
            const params = {
              id: bidSectionRef.value?.id,
              proNumber: value,
            };
            const bool = await checkBidSectionRepeat(params);
            if (bool) {
              return Promise.resolve();
              // return;
            } else {
              return Promise.reject('标段名称重复！');
            }
          }),
        },
      ],
    },
    {
      field: 'quoteEndTime',
      component: 'DatePicker',
      label: '开标时间',
      slot: 'quoteEndTime',
      colProps: {
        span: 8,
      },
      rules: [{ required: true, message: '请选择开标时间', trigger: 'change', type: 'date' }],
    },
    {
      field: 'quoteLocation',
      component: 'Input',
      label: '开标地点',
      slot: 'quoteLocation',
      colProps: {
        span: 12,
      },
      rules: [
        { required: true, message: '请填写开标地点', trigger: 'blur' },
        {
          validator: (_, value) => {
            const RegExp = /^(?!\s)(?!.*\s$).{1,100}$/;
            if (value) {
              if (RegExp.test(value)) {
                return Promise.resolve();
              } else {
                return Promise.reject(`最大可输入100个字符`);
              }
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
    },
  ];
  const [register, { setFieldsValue, getFieldsValue, validate, clearValidate }] = useForm({
    schemas: purchaseTemplateFormSchema,
    labelWidth: 115,
    showActionButtonGroup: false,
  });
  bidSectionIdRef.value = Number(route.query.id);
  onMounted(async () => {
    loading.value = true;
    // bidSectionIdRef.value = Number(bidSectionId)
    bidSectionRef.value = await getBidSectionById(bidSectionIdRef.value);
    // 回填数据
    await waitForPromise(() => basicFormRef.value);
    setFieldsValue({
      proName: bidSectionRef.value?.proName,
      proNumber: bidSectionRef.value?.proNumber,
      quoteEndTime: bidSectionRef.value?.quoteEndTime,
      quoteLocation: bidSectionRef.value?.quoteLocation,
    });
    try {
      const bidSectionId = route.query.id;
      if (!bidSectionId || !Number(bidSectionId)) {
        console.error('缺少标段 id');
        loading.value = false;
        return;
      }
    } finally {
      loading.value = false;
    }
  });

  // const blurHandler = async (itemLevel3, value) => {
  //   if (value === itemLevel3.cacheContent) {
  //     return;
  //   }
  //   const purchaseTemplate = {
  //     id: itemLevel3.id,
  //     content: value,
  //   };
  //   await savePurchaseTemplate(purchaseTemplate);
  //   itemLevel3.cacheContent = value;
  //   createMessage.success(CustomMsgEnum.SAVE_SUCCESS);
  // };

  // const changeHandler = async (itemLevel3, value) => {
  //   itemLevel3.content = value;
  // };
  const clearcheck = () => {
    clearValidate('quoteEndTime');
  };
  const clickHandlePreview = () => {
    // TODO: 预览的弹窗
  };
  const { closeCurrent } = useTabs(router);
  const clickHandleCancel = () => {
    router.back();
    closeCurrent();
  };

  const clickHandleSave = async () => {
    loading.value = true;
    try {
      await validate();
      const formData = getFieldsValue();
      formData.id = bidSectionIdRef.value;
      await saveBidSection(formData);
      createMessage.success(CustomMsgEnum.SAVE_SUCCESS);
    } finally {
      loading.value = false;
    }
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-purchase-template';
</style>
