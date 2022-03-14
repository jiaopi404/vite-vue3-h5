<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="发起验收"
    width="33%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm">
      <template #deliveryTime="{ model }">
        <div>{{ renderTime(model.deliveryTime) }}</div>
      </template>
    </BasicForm>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { renderTime } from '/@/components/Time';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { useBusinessStore } from '/@/store/modules/business';
  import { getSecretMobile } from '/@/utils/commonServe/businessUtil';

  // 配置数据
  import { formSchema } from '../toBeAccepted.data';
  import { acceptanceDeclare } from '/@/api/auditMangement/auditMangement';
  // 接口调用
  import {
    saveProAcceptance,
    getProAcceptanceById,
    getUserByOrgID,
    getUserByDepId,
  } from '/@/api/acceptanceManagement/acceptanceManagementApi';
  export default defineComponent({
    name: 'InformationEntry',
    components: { BasicDrawer, BasicForm, BasicTable },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      let formList = ref<any>(null);
      const proId = ref(0);
      const { createMessage, createConfirmPromise } = useMessage();
      const userInfo = useUserStore().getUserInfo;
      const configStore = useConfigStore();
      const businessStore = useBusinessStore();
      const [
        registerForm,
        { resetFields, validate, getFieldsValue, setFieldsValue, updateSchema },
      ] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const [registerDrawer, { changeLoading, setDrawerProps, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            resetFields();
            setDrawerProps({ confirmLoading: false });
            changeLoading(true);
            console.log(data, 'datadatadata');
            formList = data?.record;
            proId.value = data?.record?.bidSection?.project?.id;

            const result = await getProAcceptanceById(data.record.proAcceptance.id);
            if (result) {
              if (result.accUserIds) {
                result.accUserIds = result?.accUserIds.split(',');
                setFieldsValue({
                  deliveryTime: data?.record?.bidSection.deliveryTime,
                  ...result,
                });
              } else {
                setFieldsValue({
                  deliveryTime: data?.record?.bidSection.deliveryTime,
                });
              }
            }
            // 根据条件来区分调用的接口
            if (
              configStore?.GET_CONFIG_MODULE?.acceptanceMode == 0 ||
              (configStore?.GET_CONFIG_MODULE?.acceptanceMode == 1 &&
                data.record.bidSection.ifBeforeAcceptance == 1)
            ) {
              updateSchema({
                field: 'accUserIds',
                componentProps: () => {
                  return {
                    api: async (param) => {
                      const data = await getUserByOrgID(param);
                      data.forEach((item) => {
                        if (item.role === 3) {
                          item.perName = '专家-' + item.perName;
                        }
                        item.perName = `${item.perName}(${getSecretMobile(item.mobile)})`;
                      });
                      return data;
                    },
                    // api: getUserByOrgID,
                    params: userInfo.orgId,
                    numberToString: true, // 是否将number值转化为string
                    labelField: 'perName',
                    valueField: 'id',
                    mode: 'multiple',
                    // 'multiple' 多选 | 'tags' 多选且支持自定义标签 | 'combobox' 单选
                    showSearch: true,
                    optionFilterProp: 'label',
                    placeholder: '请选择验收人员',
                  };
                },
              });
            } else if (
              configStore?.GET_CONFIG_MODULE?.acceptanceMode == 1 &&
              data.record.bidSection.ifBeforeAcceptance == 0
            ) {
              updateSchema({
                field: 'accUserIds',
                componentProps: () => {
                  return {
                    api: async (param) => {
                      const data = await getUserByDepId(param);
                      data.forEach((item) => {
                        item.perName = `${item.perName}(${getSecretMobile(item.mobile)})`;
                      });
                      return data;
                    },
                    // api: getUserByOrgID,
                    params: userInfo?.department?.id,
                    numberToString: true, // 是否将number值转化为string
                    labelField: 'perName',
                    valueField: 'id',
                    mode: 'multiple',
                    // 'multiple' 多选 | 'tags' 多选且支持自定义标签 | 'combobox' 单选
                    showSearch: true,
                    optionFilterProp: 'label',
                    placeholder: '请选择验收人员',
                  };
                },
              });
            }
          } finally {
            changeLoading(false);
          }
        },
      );

      // 保存
      async function handleSubmit() {
        try {
          await validate();
          setDrawerProps({ confirmLoading: true });
          const formData = getFieldsValue();
          console.log(formData, 'formData');
          formData.accUserIds = formData.accUserIds.toString();
          let param = {
            proId: proId.value,
            bidSection: {
              id: formList.bidSection.id,
            },
            statusId: 3,
            result: 1,
            accUserIds: formData.accUserIds,
            accExplain: formData.accExplain,
            accDate: formData.accDate,
            addUser: {
              id: userInfo.id,
            },
            id: formList.proAcceptance.id,
            stage: 1,
          };
          if (configStore?.GET_CONFIG_MODULE?.acceptanceMethod) {
            console.log(param, 'param');
            await saveProAcceptance(param);
            closeDrawer();
            createMessage.success('保存成功');
            emit('success');
          } else {
            await createConfirmPromise({
              content: '确认发起审核流吗？',
            });
            param.statusId = 1;
            await saveProAcceptance(param);
            const res = await acceptanceDeclare({
              objectId: formList.proAcceptance.id,
              code: '10',
              tagModuleId: businessStore.GET_TAG_MODULE_INFO?.id ?? -1,
              account: userInfo.account,
              auditOpinion: formData.accExplain,
            });
            if (res) {
              closeDrawer();
              createMessage.success('发起成功！');
              emit('success');
            }
          }
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return {
        registerForm,
        registerDrawer,
        handleSubmit,
        renderTime,
      };
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-calendar-picker.ant-calendar-picker-default) {
    width: calc(100% - 0.3vw);
  }
</style>
