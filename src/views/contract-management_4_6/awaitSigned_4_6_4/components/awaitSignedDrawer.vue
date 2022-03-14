<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="合同签订"
    width="500px"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <BasicForm @register="registerForm"></BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref, toRaw } from 'vue';
  import { formSchema } from '../awaitSigned.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { saveConContract } from '/@/api/contractManagement/signedApi';
  import moment from 'moment';

  export default defineComponent({
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();

      const conContractId = ref<Number>(-999);
      const bidSectionId = ref<Number>(-999);

      const [
        registerForm,
        { getFieldsValue, setFieldsValue, resetFields, validate, updateSchema, clearValidate },
      ] = useForm({
        labelWidth: 120,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });
      const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
        console.log('drawer data:', data);
        conContractId.value = data.conContractId;
        bidSectionId.value = data.bidSectionId;
        setFieldsValue({
          signAddress: data.orgName,
        });
      });

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          const formData = getFieldsValue();
          const userInfo = useUserStore().getUserInfo;

          const _data = {
            id: unref(conContractId),
            bidSection: {
              id: unref(bidSectionId),
            },
            ifSignContract: 1,
            signDate: formData.signDate,
            signAddress: formData.signAddress,
          };

          console.log('===_data===', _data);

          changeOkLoading(true);
          await saveConContract(_data);
          changeOkLoading(false);

          createMessage.success('合同签订成功');
          closeDrawer();
          resetFields();
          resetData();
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      const handleCancel = () => {
        console.log('取消');
        resetFields();
        resetData();
      };

      const resetData = () => {
        conContractId.value = -999;
        bidSectionId.value = -999;
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
  :deep().ant-calendar-picker {
    width: 100%;
  }
</style>
