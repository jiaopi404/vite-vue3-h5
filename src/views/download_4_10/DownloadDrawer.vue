<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="添加常用下载"
    width="40%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { downloadAddSchemas } from './download.data';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { saveCommonFile } from '/@/api/download/download';

  export default defineComponent({
    name: 'DownloadDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();

      const [
        registerForm,
        { resetFields, validate, getFieldsValue, setFieldsValue, clearValidate },
      ] = useForm({
        labelWidth: 120,
        schemas: downloadAddSchemas(),
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
        autoSubmitOnEnter: true,
      });

      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async () => {
        resetFields();
        setFieldsValue({
          name: [],
        });
        clearValidate();
      });

      // 编辑保存
      async function handleSubmit() {
        try {
          await validate();
          setDrawerProps({ confirmLoading: true });
          const values = getFieldsValue();
          const _values = {
            role: parseInt(values.role),
            systemModule: values.systemModule,
            downloadType: { id: values.downloadType },
            useMark: values.useMark,
            name: values.name[0].name,
            attach: values.name[0].url,
          };
          await saveCommonFile(_values);
          closeDrawer();
          emit('success');
          createMessage.success('保存成功！');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return { registerDrawer, registerForm, handleSubmit };
    },
  });
</script>
