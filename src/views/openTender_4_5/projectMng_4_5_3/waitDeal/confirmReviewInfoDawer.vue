<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="确认评审信息"
    width="576px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { reviewInfoFormSchema } from './waitDeal.data';
  import { saveBidSection } from '/@/api/purchase/plan-purchase';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useConfigStore } from '/@/store/modules/config';
  import { useRouter } from 'vue-router';
  export default defineComponent({
    name: 'ConfirmReviewInfoDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      let _list = [];
      const [
        registerForm,
        { resetFields, setFieldsValue, updateSchema, validate, getFieldsValue },
      ] = useForm({
        labelWidth: 140,
        schemas: reviewInfoFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const bidSectionId: any = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        bidSectionId.value = toRaw(data.record).bidSection.id;
        setFieldsValue({
          ifAbandonedBid: toRaw(data.record).bidSection.ifAbandonedBid,
          resultNotice: toRaw(data.record).bidSection.resultNotice,
          resultNoticeUrl: toRaw(data.record).bidSection.resultNoticeUrl,
        });
      });
      const { createMessage, createConfirmPromise } = useMessage();
      const status = ref();
      const configStore = useConfigStore();
      onMounted(async () => {
        const statusList = await getDictionaryByParentId(
          configStore.GET_CONFIG_DICTIONRY.projectStatusId,
        );
        statusList.forEach((item: any) => {
          if (item.code === '21') {
            status.value = item.id;
          }
        });
      });
      const router = useRouter();
      // 确认按钮
      async function handleSubmit() {
        try {
          const values = await validate();
          setDrawerProps({ confirmLoading: true });
          console.log('确认评审信息', values);
          values.id = bidSectionId.value;
          if (!!values.ifAbandonedBid) {
            values.status = {
              id: status.value,
            };
            await saveBidSection(values);
            createMessage.success('废标成功！');
          } else {
            await saveBidSection(values);
            router.push('proMngConfirmBidSupplier?id=' + bidSectionId.value);
          }
          emit('success');
          setDrawerProps({ confirmLoading: false });
          closeDrawer();
        } catch (error) {
          console.log('error is', error);
        }
      }
      return {
        registerDrawer,
        registerForm,
        handleSubmit,
        _list,
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
</style>
