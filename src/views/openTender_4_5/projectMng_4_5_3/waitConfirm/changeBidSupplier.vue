<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="变更供应商"
    width="576px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { bidSupplierFormSchema } from './waitConfirm.data';
  import { saveProChangeRecord } from '/@/api/purchase/plan-purchase';
  import { useUserStore } from '/@/store/modules/user';
  import { renderTime } from '/@/components/Time';

  export default defineComponent({
    name: 'BidSupplierDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      let _list = [];
      const [registerForm, { resetFields, validate, setFieldsValue }] = useForm({
        labelWidth: 100,
        schemas: bidSupplierFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const bidSection = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        bidSection.value = toRaw(data.record).bidSection;
        console.log('data', data);
        setFieldsValue({
          bidWinner: toRaw(data.record).bidSection.bidWinner.biddingCompany.name,
        });
      });
      const userInfo = useUserStore().getUserInfo;
      const { createMessage } = useMessage();
      // 确认按钮
      async function handleSubmit() {
        setDrawerProps({ confirmLoading: true });
        try {
          const values = await validate();
          const params = {
            bidSectionId: bidSection.value.id,
            originalSuccessfulSupplier: {
              id: bidSection.value.bidWinner.biddingCompany.id,
            },
            reason: values.changeReason,
            changeDate: renderTime(new Date(), true),
            addUserId: userInfo.id,
          };
          // values.bidWinningDate = renderTime(values.bidWinningDate);
          await saveProChangeRecord(params);
          createMessage.success('保存成功！');
          await closeDrawer();
          emit('success');
        } catch (error) {
          console.log('error', error);
          setDrawerProps({ confirmLoading: false });
        }
        setDrawerProps({ confirmLoading: false });
      }
      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        _list,
      };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  .save-review-info-btn {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>
