<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="register"
    showFooter
    title="修改账户密码"
    width="500px"
    @ok="handelSubmit"
    @visible-change="handleVisibleChange"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { passwordFormSchema } from '../schemas';
  import { encryptByMd5 } from '/@/utils/cipher';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { updatePassword } from '/@/api/libraryManager/libExpert';
  import { useDrawerInner, BasicDrawer } from '/@/components/Drawer';
  const { createMessage } = useMessage();
  const userInfo = useUserStore().getUserInfo;
  const [registerForm, { getFieldsValue, validate, resetFields }] = useForm({
    schemas: passwordFormSchema(),
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
        password: encryptByMd5(formData.password),
      };
      await updatePassword(passwordForm);
      createMessage.success('密码修改成功,请重新登录！');
      const userStore = useUserStoreWithOut();
      userStore.setToken(undefined);
      userStore.logout(true);
      closeDrawer();
    } finally {
      changeOkLoading(false);
    }
  };
</script>
