<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="生成合同"
    width="576px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    queryByBidSectionId,
    saveConContract,
  } from '/@/api/projectManagement/proMngWaitReviewApi';
  import { bidContractFormSchema } from './waitConfirm.data';
  import { useUserStore } from '/@/store/modules/user';
  import { getContractLeaderSelect } from '/@/api/demo/system';
  import { personListFormatter } from '/@/utils/commonServe/businessUtil';
  export default defineComponent({
    name: 'BidSupplierDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      let _list = [];
      const [registerForm, { resetFields, validate, setFieldsValue, updateSchema }] = useForm({
        labelWidth: 120,
        schemas: bidContractFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const bidSection = ref();
      const currencyType = ref();
      const conContractId = ref();
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        conContractId.value = undefined;
        bidSection.value = toRaw(data.record).bidSection;
        const conContract = await queryByBidSectionId(bidSection.value.id);
        console.log('contract', conContract);
        currencyType.value = toRaw(data.record).bidSection.project.currencyType;
        // const userIndex = toRaw(data.depUser).chargeUserSelect.findIndex((item) => {
        //   return item.id === toRaw(data.record).bidSection.project.proChargeUserId;
        // });
        const depIndex = toRaw(data.depUser).competentDeptSelect.findIndex((item) => {
          return item.id === toRaw(data.record).bidSection.project.proChargeDepId;
        });
        if (conContract) {
          conContractId.value = conContract.id;
          updateSchema({
            field: 'contractChargeUser',
            componentProps: {
              api: getContractLeaderSelect,
              params: conContract.competentDeptId,
              placeholder: '请选择合同负责人',
              labelField: 'label',
              valueField: 'id',
              showSearch: true,
              optionFilterProp: 'label',
              resultFormatter: (result) => {
                return personListFormatter(result);
              },
            },
          });
          setFieldsValue({
            bidWinningAmount: conContract.conAmount,
            contractDep: conContract.competentDeptId,
            contractChargeUser: conContract.chargeUser.id,
          });
        } else {
          setFieldsValue({
            bidWinningAmount: toRaw(data.record).bidSection.bidWinner.bidWinningAmount,
          });
          if (depIndex !== -1) {
            setFieldsValue({
              contractDep: toRaw(data.record).bidSection.project.proChargeDepId,
            });
            const result = await getContractLeaderSelect(
              toRaw(data.record).bidSection.project.proChargeDepId,
            );
            const userIndex = result.findIndex((item) => {
              return item.id === toRaw(data.record).bidSection.project.proChargeUserId;
            });
            if (userIndex !== -1) {
              setFieldsValue({
                contractChargeUser: toRaw(data.record).bidSection.project.proChargeUserId,
              });
            }
            updateSchema({
              field: 'contractChargeUser',
              componentProps: {
                api: getContractLeaderSelect,
                params: toRaw(data.record).bidSection.project.proChargeDepId,
                placeholder: '请选择合同负责人',
                labelField: 'label',
                valueField: 'id',
                showSearch: true,
                optionFilterProp: 'label',
                resultFormatter: (result) => {
                  console.log('1232');
                  const userIndex = result.findIndex((item) => {
                    return item.id === toRaw(data.record).bidSection.project.proChargeUserId;
                  });
                  if (userIndex !== -1) {
                    setFieldsValue({
                      contractChargeUser: toRaw(data.record).bidSection.project.proChargeUserId,
                    });
                  }
                  return personListFormatter(result);
                },
              },
            });
          }
        }
        // console.log('depuser', userIndex, depIndex);

        updateSchema({
          field: 'bidWinningAmount',
          label: `合同金额（${currencyType.value.code === '1' ? '元' : currencyType.value.name}）`,
        });
      });
      const { createMessage } = useMessage();
      const userInfo = useUserStore().getUserInfo;
      // 确认按钮
      async function handleSubmit() {
        setDrawerProps({ confirmLoading: true });
        try {
          const values = await validate();
          const params = {
            projectId: bidSection.value.project.id,
            bidSection: {
              id: bidSection.value.id,
            },
            successfulSupplier: {
              id: bidSection.value.bidWinner.biddingCompany.id,
            },
            competentDeptId: values.contractDep,
            chargeUser: {
              id: values.contractChargeUser,
            },
            conAmount: values.bidWinningAmount,
            addUserId: userInfo.id,
            ifGenerateContract: 1,
          };
          if (conContractId.value) {
            params.id = conContractId.value;
          }
          await saveConContract(params);
          createMessage.success('保存成功！');
          await closeDrawer();
          emit('success');
          conContractId.value = undefined;
        } catch (error) {
          console.log('error', error);
          setDrawerProps({ confirmLoading: false });
        }
        setDrawerProps({ confirmLoading: false });
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
