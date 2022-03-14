<template>
  <BasicDrawer
    v-bind="$attrs"
    title="查看审核流"
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
  import { formSchema } from '../InReview.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { pendingReview } from '/@/api/purchaseDeclare/pendingProjectApi';

  export default defineComponent({
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();

      const projectId = ref<number>(-999);

      const [registerForm, { getFieldsValue, setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 95,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });
      const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
        projectId.value = data.projectId;
      });

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          const formData = getFieldsValue();
          const userInfo = useUserStore().getUserInfo;
          console.log('formData:', formData);

          const auditRecords = {
            result: formData.result,
            auditOpinion: formData.auditOpinion,
            userId: userInfo.id,
            reviewer: userInfo.perName,
            depId: userInfo?.department?.id,
            depName: userInfo?.department?.name,
          };

          changeOkLoading(true);
          await pendingReview(_data);
          changeOkLoading(false);
          createMessage.success('处理项目成功');
          closeDrawer();
          resetFields();
          projectId.value = -999;
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      const handleCancel = () => {
        resetFields();
        projectId.value = -999;
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
