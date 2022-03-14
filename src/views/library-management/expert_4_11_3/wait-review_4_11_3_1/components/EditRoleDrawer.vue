<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="register"
    showFooter
    title="审核"
    width="500px"
    @ok="handelSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { editRoleFormSchema } from '../schemas';
  import { useDrawerInner, BasicDrawer } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form';
  import { checkUserExtend } from '/@/api/libraryManager/libExpert';
  import { LibExpertI } from '/@/api/libraryManager/model/libExpertModel';
  import { useUserStore } from '/@/store/modules/user';
  // state
  const recordId = ref<number>(0); // 是否更新
  const emit = defineEmits(['success']);
  const userInfo = useUserStore().getUserInfo;
  const [registerForm, { getFieldsValue, validate, resetFields }] = useForm({
    schemas: editRoleFormSchema,
    labelWidth: 115,
    showActionButtonGroup: false,
  });
  const [register, { changeLoading, changeOkLoading, closeDrawer }] = useDrawerInner(
    async (data) => {
      try {
        resetFields(); // 重置表单
        changeLoading(true);
        recordId.value = data.record.id;
      } finally {
        changeLoading(false);
      }
    },
  );
  const handelSubmit = async () => {
    try {
      changeOkLoading(true);
      await validate(); // 验证
      const formData = getFieldsValue();
      formData.id = recordId.value;
      formData.role = 3;
      (formData.approveUserId = userInfo.id),
        // submit formData
        await checkUserExtend(formData as LibExpertI);
      closeDrawer();
      emit('success');
    } finally {
      changeOkLoading(false);
    }
  };
</script>
