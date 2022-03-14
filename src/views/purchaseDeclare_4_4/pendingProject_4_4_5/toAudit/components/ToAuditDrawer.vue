<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    width="500px"
    @ok="handleSubmit"
    @close="handleCancel"
  >
    <template #title>
      <div>
        处理项目：<span>{{ projectName }}</span>
      </div>
    </template>
    <BasicForm @register="registerForm"></BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { formSchema } from '../ToAudit.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useBusinessStore } from '/@/store/modules/business';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { pendingReview } from '/@/api/purchaseDeclare/pendingProjectApi';
  import { projectDeclare } from '/@/api/auditMangement/auditMangement';
  import { getProjectById } from '/@/api/purchaseDeclare/pendingProjectApi';

  export default defineComponent({
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const { createMessage } = useMessage();
      const projectId = ref<number>(-999);
      const projectName = ref<string>('');
      const isOnlineAuction = ref<Boolean>(false); // 判断是否为 电子竞价和询价
      const isSectionProjectMsg = ref<String>(''); // 判断是否为 多标段项目 node === 1 || node === 2
      const businessStore = useBusinessStore();
      const [registerForm, { getFieldsValue, setFieldsValue, resetFields, validate }] = useForm({
        labelWidth: 95,
        schemas: formSchema(),
        showActionButtonGroup: false,
      });
      const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
        projectId.value = data.projectId;
        projectName.value = data.projectName;

        // 判断是否为电子竞价|| 询价
        const resData = await getProjectById(unref(projectId));
        if (resData.procurementMethod.node === '1') {
          isOnlineAuction.value = true;
        } else {
          isOnlineAuction.value = false;
        }
        if (
          (resData.procurementMethod.node === '1' || resData.procurementMethod.node === '2') &&
          resData.ifMultiBidSection === 1
        ) {
          isSectionProjectMsg.value = resData.procurementMethod.name;
        } else {
          isSectionProjectMsg.value = '';
        }
      });

      // 提交
      const handleSubmit = async () => {
        try {
          await validate();
          changeOkLoading(true);
          const formData = getFieldsValue();
          const userInfo = useUserStore().getUserInfo;

          const _data: any = {
            approveUserId: userInfo.id,
            projectId: unref(projectId),
            result: formData.result,
            option: formData.option,
          };
          if (formData.result === 1) {
            _data.ifReview = formData.ifReview;
          } else if (formData.result === 2) {
            _data.ifReview = 0;
          }

          if (formData.result === 1 && unref(isSectionProjectMsg)) {
            createMessage.success(
              `您选的采购方式: ${unref(isSectionProjectMsg)} 不支持多标段，请退回修改。`,
            );
            return;
          }

          // 是否审核 === 1 调用接口
          if (_data.ifReview === 1) {
            await projectDeclare({
              objectId: unref(projectId),
              code: '5',
              tagModuleId: businessStore.GET_TAG_MODULE_INFO?.id ?? -1,
              account: userInfo.account,
            });
          }

          await pendingReview(_data);
          if (unref(isOnlineAuction)) {
            if (_data.result === 1 && _data.ifReview === 0) {
              createMessage.success('设为待招标成功！同时生成采购公告！');
            } else {
              createMessage.success('处理项目成功！');
            }
          } else {
            createMessage.success('处理项目成功！');
          }
          changeOkLoading(false);
          closeDrawer();
          resetFields();
          projectId.value = -999;
          projectName.value = '';
          isOnlineAuction.value = false;
          isSectionProjectMsg.value = '';
          emit('success');
        } catch (err) {
          changeOkLoading(false);
          console.log(err);
        }
      };

      const handleCancel = () => {
        resetFields();
        projectId.value = -999;
        projectName.value = '';
        isOnlineAuction.value = false;
        isSectionProjectMsg.value = '';
      };

      return {
        projectName,
        registerDrawer,
        registerForm,
        handleSubmit,
        handleCancel,
      };
    },
  });
</script>
