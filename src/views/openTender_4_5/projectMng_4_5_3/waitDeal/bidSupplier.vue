<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="确定供应商"
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
  import { bidSupplierFormSchema } from './waitDeal.data';
  import { saveBidWinner } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { renderTime } from '/@/components/Time';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { copyPurchaseToBidwinningList } from '/@/api/purchase/supplierApi';

  export default defineComponent({
    name: 'BidSupplierDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      let _list = [];
      const [registerForm, { resetFields, validate, setFieldsValue, updateSchema }] = useForm({
        labelWidth: 120,
        schemas: bidSupplierFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const bidSupplier = ref();
      const othersSupplierQuotationIds = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        updateSchema({
          field: 'bidWinningAmount',
          label: `中标金额（${
            toRaw(data.record).returnBidSection.bidSection.project.currencyType.code === '1'
              ? '元'
              : toRaw(data.record).returnBidSection.bidSection.project.currencyType.name
          }）`,
        });
        bidSupplier.value = toRaw(data.record).returnBidSection;
        othersSupplierQuotationIds.value = toRaw(data.noIds).join(',');
        const bidWinningAmount = toRaw(data.record).returnBidSection.quotedAmount;
        setFieldsValue({
          bidWinningAmount,
        });
      });

      const { createMessage } = useMessage();
      const router = useRouter();
      const userInfo = useUserStore().getUserInfo;
      // 确认按钮
      async function handleSubmit() {
        setDrawerProps({ confirmLoading: true });
        try {
          const values = await validate();
          values.successfulSupplierId = bidSupplier.value.registeredSupplier.successfulSupplier.id;
          values.bidSectionId = bidSupplier.value.bidSectionId;
          values.bidWinningAmount = Number(values.bidWinningAmount);
          values.perName = bidSupplier.value.registeredSupplier.perName;
          values.mobile = bidSupplier.value.registeredSupplier.mobile;
          values.othersSupplierQuotationIds = othersSupplierQuotationIds.value;
          values.wonTheBidId = bidSupplier.value.id;
          // values.bidWinningDate = renderTime(values.bidWinningDate);
          await saveBidWinner(values);
          if (bidSupplier.value.bidSection.project.procurementMethod.node === null) {
            const params = {
              userId: bidSupplier.value.registeredSupplier.successfulSupplier.user.id,
              bidSectionId: bidSupplier.value.bidSectionId,
              projectId: bidSupplier.value.bidSection.project.id,
            };
            await copyPurchaseToBidwinningList(params);
          }
          createMessage.success('保存成功！');
          await closeDrawer();
          router.push('/proMng/proMngWaitDeal');
          // emit('success');
        } catch (error) {
          console.log('error', error);
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
