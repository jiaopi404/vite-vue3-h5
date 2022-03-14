<template>
  <BasicDrawer
    v-bind="$attrs"
    title="出库"
    @register="registerDrawer"
    showFooter
    width="500px"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <BasicForm @register="registerForm"></BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from '../materialLibrary.data'; // 数据
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveOutboundRecord } from '/@/api/assetManagement/assetManagementApi';

  export default defineComponent({
    name: 'userAuditedDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const contractListId = ref<number>(); // 合同清单id
      const maxNumber = ref<number>();

      const [
        registerForm,
        { validate, resetFields, getFieldsValue, setFieldsValue, updateSchema },
      ] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });

      const [registerDrawer, { changeLoading, changeOkLoading, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            resetFields(); // 重置表单值
            changeLoading(true);
            contractListId.value = data.contractListId;
            maxNumber.value = data.maxNumber;

            updateSchema({
              field: 'number',
              componentProps: {
                min: 0,
                max: unref(maxNumber),
                placeholder: '请输入数量',
                precision: 0,
              },
            });
            changeLoading(false);
          } catch (err) {
            console.log(err);
          }
        },
      );

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          changeOkLoading(true);
          const formData = getFieldsValue();
          const otherData = {
            id: null,
            contractListId: unref(contractListId),
          };
          Object.assign(formData, otherData);
          console.log('formData', formData);

          await saveOutboundRecord(formData);

          changeOkLoading(false);
          closeDrawer();
          resetFields(); // 重置表单值
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      // 点击取消按钮的 callback (包括右上角的 X)
      const handleCancel = () => {
        console.log('取消');
        resetFields(); // 重置表单值
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
  :deep(.ant-input-number) {
    width: 100% !important;
  }
</style>
