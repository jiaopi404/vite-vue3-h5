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
  import { changeBiddingCompanyStatus } from '/@/api/review-node/biddingCompany';
  import { biddingCompanyI } from '/@/api/review-node/model/biddingCompanyModel';
  // state
  const recordId = ref<number>(); // 是否更新
  const emit = defineEmits(['success']);
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
      // submit formData
      await changeBiddingCompanyStatus(formData as biddingCompanyI);
      closeDrawer();
      emit('success');
    } finally {
      changeOkLoading(false);
    }
  };
</script>
