<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="填写项目编号，开标日期"
    width="576px"
    @ok="handleSubmit"
    @close="closeHandler"
  >
    <BasicForm @register="registerForm">
      <template #proNumber="{ model, field }">
        <Input v-model:value="model[field]" placeholder="请填写项目编号" />
      </template>
      <template #quoteEndTime="{ model, field }">
        <DatePicker
          style="width: 100%"
          v-model:value="model[field]"
          show-time
          placeholder="请选择开标时间"
        />
      </template>
      <template #quoteLocation="{ model, field }">
        <Input v-model:value="model[field]" placeholder="请填写开标地点" />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  // import { useRouter } from 'vue-router';
  import { Input, DatePicker } from 'ant-design-vue';
  import { ref } from 'vue';
  import {
    checkBidSectionRepeat,
    getBidSectionById,
    saveBidSection,
  } from '/@/api/purchase/plan-purchase';
  import { debouncePromise } from '/@/utils/commonServe';
  import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';

  const { prefixCls } = useDesign('complete-bid-section-drawer');
  // const router = useRouter();

  const emit = defineEmits(['save-success']);

  // BLOCK: state
  const bidSectionId = ref<Nullable<number>>(null);
  const bidSectionRef = ref<any>(null);

  const completeBidSectionDrawerFormSchema: FormSchema[] = [
    {
      field: 'proNumber',
      component: 'Input',
      label: '项目编号',
      slot: 'proNumber',
      colProps: {
        span: 24,
      },
      rules: [
        { required: true, message: '请填写项目编号', trigger: 'change', type: 'string' },
        getNamePatternNoSpaceRule(30, 'change', 1),
        {
          trigger: 'change',
          validator: debouncePromise(async (_, value) => {
            const params = {
              id: bidSectionId.value,
              proNumber: value,
            };
            const bool = await checkBidSectionRepeat(params);
            console.log('bool', bool);
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
        span: 24,
      },
      rules: [{ required: true, message: '请选择开标时间', trigger: 'change', type: 'date' }],
    },
    {
      field: 'quoteLocation',
      component: 'Input',
      label: '开标地点',
      slot: 'quoteLocation',
      colProps: {
        span: 24,
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
  const [registerForm, { setFieldsValue, getFieldsValue, resetFields, clearValidate, validate }] =
    useForm({
      schemas: completeBidSectionDrawerFormSchema,
      labelWidth: 115,
      showActionButtonGroup: false,
    });

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading, changeLoading }] = useDrawerInner(
    async (data) => {
      changeLoading(true);
      try {
        bidSectionId.value = data.id;
        bidSectionRef.value = await getBidSectionById(data.id);
        // 回显
        setFieldsValue(bidSectionRef.value);
        clearValidate();
      } finally {
        changeLoading(false);
      }
    },
  );

  const handleSubmit = async () => {
    changeOkLoading(true);
    try {
      const formData = getFieldsValue();
      // TODO: 调用保存接口
      console.log('form data is: ', formData);
      formData.id = bidSectionId.value;
      // formData.quoteEndTime = +new Date(formData.quoteEndTime);
      await validate();
      await saveBidSection(formData);
      closeDrawer();
      emit('save-success');
    } finally {
      changeOkLoading(false);
    }
  };

  const closeHandler = () => {
    bidSectionId.value = null;
    bidSectionRef.value = null;
    resetFields();
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-complete-bid-section-drawer';
</style>
