<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="录入其他参会评审人员"
    width="33%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 配置数据
  import { formSchema } from '../inProcurement.data';
  // 接口调用
  import { saveBidSection } from '/@/api/purchaseManagement/purchaseManagementApi';
  export default defineComponent({
    name: 'InformationEntry',
    components: { BasicDrawer, BasicForm, BasicTable },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      let id = ref(0);
      let statusId = ref(0);
      const { createMessage } = useMessage();
      const [registerForm, { resetFields, validate, getFieldsValue }] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const [registerDrawer, { changeLoading, setDrawerProps, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            resetFields();
            setDrawerProps({ confirmLoading: false });
            changeLoading(true);
            console.log(data?.waitDealStatus, 'datadata');
            id.value = data?.record?.id;
            statusId.value = data?.waitDealStatus;
          } finally {
            changeLoading(false);
          }
        },
      );

      // 保存
      async function handleSubmit() {
        try {
          await validate();
          setDrawerProps({ confirmLoading: true });
          const formData = getFieldsValue();
          let param = {
            id: id.value,
            status: {
              id: statusId.value,
            },
            ifGenerateAuditRecord: 1,
          };
          let _data = Object.assign({}, param, formData);
          await saveBidSection(_data);
          setDrawerProps({ confirmLoading: true });
          closeDrawer();
          createMessage.success('保存成功');
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return {
        registerForm,
        registerDrawer,
        handleSubmit,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.tox .tox-tbtn--select) {
    width: 65px;
  }
  :deep(.lx-collapse-container__header) {
    display: none;
  }
</style>
