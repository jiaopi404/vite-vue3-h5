<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" :show-footer="true" @ok="handleSubmit">
    <BasicForm @register="registerContractForm"> </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, toRaw } from 'vue';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useUserStore } from '/@/store/modules/user';
  import { conContractDeclare } from '/@/api/auditMangement/auditMangement';
  import { useBusinessStore } from '/@/store/modules/business';
  import { getDictionaryByParentId } from '/@/api/noticeManagement/noticeManagement';
  import { useConfigStore } from '/@/store/modules/config';
  import { saveConContract } from '/@/api/contractManagement/waitImprove';

  export default defineComponent({
    name: 'ReviewInfoDrawer',
    components: {
      BasicDrawer,
      BasicForm,
    },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      const conTractContent = ref();
      let _list = [];
      const contractTemplate: FormSchema[] = [
        {
          field: 'ifReview',
          label: '是否评审',
          component: 'RadioGroup',
          defaultValue: 0,
          colProps: { span: 22 },
          componentProps: {
            options: [
              {
                label: '是',
                value: 1,
              },
              {
                label: '否',
                value: 0,
              },
            ],
          },
          required: true,
        },
      ];
      const [registerContractForm, { resetFields, validate }] = useForm({
        labelWidth: 80,
        schemas: contractTemplate,
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const configStore = useConfigStore();
      const contractId: any = ref();
      const bidSectionId: any = ref();
      const contract: any = ref();
      //   选否时可用这个状态
      // const statusId: any = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({
          confirmLoading: false,
          closable: false,
        });
        contractId.value = toRaw(data.record).conContract.id;
        contract.value = toRaw(data.record).conContract;
        // 合同状态
        // const status = await getDictionaryByParentId(
        //   configStore.GET_CONFIG.configInfo?.configDictionary?.contractStatusId,
        // );
        // status.forEach((item) => {
        //   if (item.code === '4') {
        //     statusId.value = item.id;
        //   }
        // });
        // console.log(status);
      });
      const { createMessage, createConfirmPromise } = useMessage();
      const businessStore = useBusinessStore();

      // 确认按钮
      async function handleSubmit() {
        try {
          setDrawerProps({ confirmLoading: true });
          const result = await validate();
          //   await createConfirmPromise({
          //     content: '确认提交吗？',
          //   });
          if (!result.ifReview) {
            await saveConContract({
              id: contractId.value,
              ifPendingReview: 0,
            });
            emit('success');
            closeDrawer();
            return;
          }
          const res = await conContractDeclare({
            objectId: contractId.value,
            code: '8',
            tagModuleId: businessStore.GET_TAG_MODULE_INFO?.id ?? -1,
            account: userInfo.account,
          });
          if (res) {
            createMessage.success('提交成功！');
          }
          emit('success');
          setDrawerProps({ confirmLoading: false });
          closeDrawer();
        } catch (error) {
          console.log('error', error);
          setDrawerProps({ confirmLoading: false });
        }
        setDrawerProps({ confirmLoading: false });
      }
      const userInfo = useUserStore().getUserInfo;
      return {
        registerDrawer,
        handleSubmit,
        _list,
        registerContractForm,
        bidSectionId,
        conTractContent,
      };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
  .save-review-info-btn {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .pd-20 {
    margin-bottom: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 30%);
  }
</style>
