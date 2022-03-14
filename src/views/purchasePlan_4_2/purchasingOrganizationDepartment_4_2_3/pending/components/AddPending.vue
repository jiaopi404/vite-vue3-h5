<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="`处理项目: ${proName}`"
    width="500px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, toRaw, onUpdated } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { formSchema } from '../pending.data';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 引入接口
  import { savePurchasePlan } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    name: 'AddPending',
    components: { BasicDrawer, BasicForm, BasicTable, TableAction },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const id = ref<any>(null);
      const proName = ref<any>(null);
      const { createMessage } = useMessage();
      const [
        registerForm,
        { resetFields, setFieldsValue, validate, clearValidate, getFieldsValue },
      ] = useForm({
        labelWidth: 120,
        schemas: formSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 24 },
      });

      const [registerDrawer, { changeLoading, setDrawerProps, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            resetFields(); //重置
            setDrawerProps({ confirmLoading: false });
            changeLoading(true);
            id.value = toRaw(data.record).id;
            proName.value = toRaw(data.record).proName;
            // 回填
            setFieldsValue({
              ...data.record,
            });
            // 清除校验
            clearValidate();
          } finally {
            changeLoading(false);
          }
        },
      );
      //保存
      async function handleSubmit() {
        try {
          //校验规则
          await validate();
          setDrawerProps({ confirmLoading: true });
          const formData = getFieldsValue();
          let params = {
            id: id.value,
            planOrganizationalForm: formData.planOrganizationalForm
              ? formData.planOrganizationalForm
              : 'null',
            planProcurementMethod: formData.planProcurementMethod
              ? formData.planProcurementMethod
              : 'null',
            planPurchaseTime: formData.planPurchaseTime,
            ifHandle: 1,
          };
          await savePurchasePlan(params);
          closeDrawer();
          createMessage.success('保存成功');
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        onUpdated,
        proName,
      };
    },
  });
</script>
// //
<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 0.3vw);
  }
</style>
