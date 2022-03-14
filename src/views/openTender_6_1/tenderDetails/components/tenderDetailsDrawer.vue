<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    title="编辑"
    showFooter
    width="500px"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <BasicForm @register="registerForm"></BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { formSchema } from '../tenderDetails.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { saveBidWinningList1 } from '/@/api/purchase/supplierApi';

  export default defineComponent({
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();

      const [
        registerForm,
        { getFieldsValue, setFieldsValue, resetFields, validate, updateSchema, clearValidate },
      ] = useForm({
        labelWidth: 130,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });
      const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
        console.log('抽屉 record data:', data);

        updateSchema([
          { field: 'unitPrice', label: `预算单价（${data.currencyType}）` },
          { field: 'totalUnitPrice', label: `预算总价（${data.currencyType}）` },
          { field: 'transactionUnitPrice', label: `报价单价（${data.currencyType}）` },
          { field: 'totalTransactionUnitPrice', label: `报价总价（${data.currencyType}）` },
        ]);
        setFieldsValue({
          ...data.record,
          ...{
            unItDicName: data.record.unItDic?.name,
            purchaseTypeName: data.record.purchaseType?.name,
            totalUnitPrice: Number((data.record.number * data.record.unitPrice).toFixed(2)),
            totalTransactionUnitPrice: Number(
              (data.record.number * data.record.transactionUnitPrice).toFixed(2),
            ),
          },
        });
        // clearValidate();
      });

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          const formData = getFieldsValue();
          const _data = {
            id: formData.id,
            transactionUnitPrice: formData.transactionUnitPrice,
            actualSpec: formData.actualSpec,
          };

          console.log('_data:', _data);

          changeOkLoading(true);
          await saveBidWinningList1(_data);
          changeOkLoading(false);

          createMessage.success('保存成功');
          closeDrawer();
          resetFields();
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      const handleCancel = () => {
        console.log('取消');
        resetFields();
      };

      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        handleCancel,
      };
    },
  });
</script>
<style scoped>
  :deep().ant-input-number {
    width: 100%;
  }
</style>
