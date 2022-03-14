<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="register"
    showFooter
    title="修改手机号"
    width="500px"
    @ok="handelSubmit"
    @visible-change="handleVisibleChange"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { mobileFormSchema } from '../schemas';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form';
  import { updateMobile } from '/@/api/libraryManager/libExpert';
  import { useDrawerInner, BasicDrawer } from '/@/components/Drawer';
  const emit = defineEmits(['success']);
  const { createMessage } = useMessage();
  const userInfo = useUserStore().getUserInfo;
  const [registerForm, { getFieldsValue, validate, resetFields }] = useForm({
    schemas: mobileFormSchema(),
    labelWidth: 115,
    showActionButtonGroup: false,
  });
  const [register, { changeLoading, changeOkLoading, closeDrawer }] = useDrawerInner(async () => {
    try {
      resetFields(); // 重置表单
      changeLoading(true);
    } finally {
      changeLoading(false);
    }
  });
  function handleVisibleChange(v) {
    if (!v) {
      resetFields();
    }
  }
  const handelSubmit = async () => {
    try {
      changeOkLoading(true);
      await validate(); // 验证
      const formData = getFieldsValue();
      const passwordForm = {
        id: userInfo.id,
        mobile: formData.mobile,
        code: formData.sms,
      };
      await updateMobile(passwordForm);
      createMessage.success('手机号修改成功！');
      closeDrawer();
      emit('success');
    } finally {
      changeOkLoading(false);
    }
  };
</script>
