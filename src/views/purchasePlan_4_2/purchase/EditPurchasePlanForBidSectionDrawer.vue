<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="编辑采购计划"
    width="576px"
    @ok="handleSubmit"
    @close="closeHandler"
  >
    <BasicForm @register="registerForm">
      <template #planOrganizationalForm="{ model, field }">
        <!-- <Select
          v-model:value="model[field]"
          :showSearch="true"
          optionFilterProp="label"
          :options="selectOptions.organizationalForm"
        /> -->
        <Select
          placeholder="请选择计划采购形式"
          :allowClear="true"
          :show-search="true"
          option-label-prop="label"
          v-model:value="model[field]"
          :options="selectOptions.organizationalForm"
          disabled
        />
      </template>
      <template #organizationalForm="{ model, field }">
        <Select
          v-model:value="model[field]"
          placeholder="请选择审批采购形式"
          :allowClear="true"
          :showSearch="true"
          optionFilterProp="label"
          :options="selectOptions.organizationalForm"
        />
      </template>
      <template #planProcurementMethod="{ model, field }">
        <Select
          placeholder="请选择计划采购方式"
          disabled
          v-model:value="model[field]"
          :showSearch="true"
          optionFilterProp="label"
          :options="selectOptions.procurementMethod"
      /></template>
      <template #procurementMethod="{ model, field }">
        <Select
          v-model:value="model[field]"
          placeholder="请选择审批采购方式"
          :allowClear="true"
          :showSearch="true"
          optionFilterProp="label"
          :options="selectOptions.procurementMethod"
        />
      </template>
    </BasicForm>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useConfigStore } from '/@/store/modules/config';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { onMounted, reactive, nextTick } from 'vue';
  import { getBidSectionById, saveBidSection } from '/@/api/purchase/plan-purchase';
  import { useForm, BasicForm } from '/@/components/Form';
  import { Select } from 'ant-design-vue';
  import { editPurchasePlanForBidSectionDrawer } from './editPurchasePlanForBidSectionDrawer.data';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CustomMsgEnum } from '/@/enums/messageEnum';

  interface LocalState {
    bidSectionIdRef?: Nullable<number>; // 标段 id
    bidSectionRef?: Nullable<any>; // 标段信息
    proDataRef?: Nullable<any>; // 项目信息，从项目中拿到 计划采购形式的计划采购方式
  }

  const { prefixCls } = useDesign('edit-purchase-plan-for-bid-section-drawer');
  const { createMessage } = useMessage();

  const emit = defineEmits(['save-purchase-plan-success']);

  // BLOCK: state
  const state = reactive<LocalState>({
    bidSectionIdRef: null,
    bidSectionRef: null,
    proDataRef: null,
  });
  const selectOptions = reactive({
    organizationalForm: [],
    procurementMethod: [],
  });
  const configStore = useConfigStore();

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading }] = useDrawerInner(async (data) => {
    state.bidSectionIdRef = data.id;
    state.bidSectionRef = await getBidSectionById(data.id);
    const proData = data.proData;
    state.proDataRef = data.proData;
    // set fields value
    await setFieldsValue({
      planOrganizationalForm: proData.planOrganizationalForm?.id,
      organizationalForm: state.bidSectionRef.organizationalForm?.id,
      planProcurementMethod: proData.planProcurementMethod?.id,
      procurementMethod: state.bidSectionRef.procurementMethod?.id,
    });
    clearValidate();
  });

  // BLOCK: use form
  const [registerForm, { resetFields, setFieldsValue, validate, getFieldsValue, clearValidate }] =
    useForm({
      labelWidth: 120,
      schemas: editPurchasePlanForBidSectionDrawer(),
      showActionButtonGroup: false,
      baseColProps: { span: 22 },
    });

  // BLOCK: form items options
  onMounted(async () => {
    const organizationalFormDicParentId = configStore.GET_CONFIG_DICTIONRY?.organizationalFormId;
    const purchaseMethodDicParentId = configStore.GET_CONFIG_DICTIONRY?.purchaseMethodId;
    getDictionaryByParentId(organizationalFormDicParentId).then((res) => {
      selectOptions.organizationalForm = res.map((item) => {
        return {
          ...item,
          value: item.id,
          key: item.id,
          label: item.name,
        };
      });
      console.log('for is: ', selectOptions.organizationalForm);
    });
    getDictionaryByParentId(purchaseMethodDicParentId).then((res) => {
      selectOptions.procurementMethod = res.map((item) => {
        return {
          ...item,
          value: item.id,
          key: item.id,
          label: item.name,
        };
      });
    });
  });

  // BLOCK: submit and close
  const handleSubmit = async () => {
    changeOkLoading(true);
    try {
      await validate();
      const formData = getFieldsValue();
      const bidSection = {
        id: state.bidSectionIdRef,
        procurementMethod: { id: formData.procurementMethod },
        organizationalForm: { id: formData.organizationalForm },
      };
      console.log('form data is: ', formData, bidSection);
      await saveBidSection(bidSection);
      createMessage.success(CustomMsgEnum.SAVE_SUCCESS);
      emit('save-purchase-plan-success');
      closeDrawer();
    } finally {
      changeOkLoading(false);
    }
  };

  const closeHandler = async () => {
    resetFields();
    clearValidate();
    // closeDrawer();
    state.proDataRef = null;
    state.bidSectionRef = null;
    state.bidSectionIdRef = null;
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-edit-purchase-plan-for-bid-section-drawer';
</style>
