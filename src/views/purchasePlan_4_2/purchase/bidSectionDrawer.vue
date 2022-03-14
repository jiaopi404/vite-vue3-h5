<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :title="getTitle"
    width="500px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
    <!-- <template #appendFooter v-if="!isUpdate">
      <a-button @click="againSave"> 保存并继续添加 </a-button>
    </template> -->
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref, computed, unref, toRaw } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { addBDFormSchema } from './purchase.data';
  import { checkBidSectionRepeat, saveBidSection } from '/@/api/purchase/plan-purchase';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute } from 'vue-router';
  import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';
  import { debouncePromise } from '/@/utils/commonServe';

  export default defineComponent({
    name: 'BidSectionDrawer',
    components: { BasicDrawer, BasicForm },
    emits: ['success', 'register'],
    props: {
      statusId: {
        type: Number,
      },
    },
    setup(props, { emit }) {
      const isUpdate = ref(true); // 编辑标段
      const isAdd = ref(true);
      const id = ref(0);
      let _list = [];
      const router = useRoute();
      const [
        registerForm,
        { resetFields, setFieldsValue, updateSchema, validate, getFieldsValue },
      ] = useForm({
        labelWidth: 160,
        schemas: addBDFormSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });
      const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
        resetFields();
        setDrawerProps({ confirmLoading: false });
        isUpdate.value = !!data?.isUpdate;
        isAdd.value = !!data?.isAdd;
        if (unref(isUpdate)) {
          console.log(toRaw(data.record));
          id.value = toRaw(data.record).id;
          await updateSchema({
            field: 'proName',
            rules: [
              {
                required: true,
                message: '请输入标段项目名称',
                trigger: ['change', 'blur'],
              },
              getNamePatternNoSpaceRule(50, 'change'),
              {
                trigger: ['change', 'blur'],
                validator: debouncePromise(async (_, value) => {
                  console.log('getFieldsValue', getFieldsValue());
                  const params = {
                    id: id.value,
                    proName: value,
                  };
                  const bool = await checkBidSectionRepeat(params);
                  console.log('bool', bool);
                  if (bool) {
                    return Promise.resolve();
                    // return;
                  } else {
                    return Promise.reject('标段名称重复！');
                  }
                }, 800),
              },
            ],
          });
          await setFieldsValue({
            ...data.record,
          });
        } else {
          updateSchema({
            field: 'proName',
            rules: [
              {
                required: true,
                message: '请输入标段项目名称',
                trigger: ['change', 'blur'],
              },
              getNamePatternNoSpaceRule(50, 'change'),
              {
                trigger: ['change', 'blur'],
                validator: debouncePromise(async (_, value) => {
                  console.log(toRaw(data.record));
                  const params = {
                    id: null,
                    proName: value,
                  };
                  const bool = await checkBidSectionRepeat(params);
                  console.log('bool', bool);
                  if (bool) {
                    return Promise.resolve();
                    // return;
                  } else {
                    return Promise.reject('标段名称重复！');
                    // throw new Error('角色名称重复！');
                  }
                }, 800),
              },
            ],
          });
        }
        console.log('标段', toRaw(data));
        updateSchema({
          field: 'budgetAmount',
          label: `标段预算金额（${
            toRaw(data).currencyType.code === '1' ? '元' : toRaw(data).currencyType.name
          }）`,
        });
      });
      const getTitle = computed(() => (!unref(isUpdate) ? '添加标段' : '编辑标段'));
      // getDictionaryInfo()

      // async function handleSubmit() {
      //   await Submit();
      //   await resetForm();
      // }
      const { createMessage, createWarningModal } = useMessage();
      async function Submit() {
        const values = await validate();
        setDrawerProps({ confirmLoading: true });
        // TODO custom api
        if (unref(isUpdate)) {
          values.id = id.value;
        }
        values.project = {
          id: Number(router.query.id),
        };
        values.status = {
          id: props.statusId,
        };
        const { verificateeInformation, remainingAmount } = await saveBidSection(values);
        if (verificateeInformation) {
          createWarningModal({
            content:
              '您所设置的标段预算金额已超过项目剩余预算金额，点击确定将为您修改为最大允许的标段预算金额！',
            okText: '确定',
            onOk: async () => {
              values.budgetAmount = remainingAmount > 0 ? remainingAmount : 0;
              await saveBidSection(values);
              createMessage.success('添加成功！');
              emit('success');
            },
          });
        } else {
          createMessage.success('保存成功！');
          emit('success');
        }
        setDrawerProps({ confirmLoading: false });
      }
      // 确认按钮
      async function handleSubmit() {
        try {
          await validate();
          await Submit();
          await closeAndEmit();
        } catch (error) {
          console.log('error', error);
          setDrawerProps({ confirmLoading: false });
        }
      }
      // 关闭抽屉
      function closeAndEmit() {
        closeDrawer();
      }
      // // 重置抽屉
      // async function resetForm() {
      //   await resetFields();
      //   if (unref(isAdd)) {
      //     await nextTick(async () => {
      //       const parentMenuId = _parentId.value;
      //       const menuType = _menuType.value;
      //       await setFieldsValue({
      //         parentMenuId,
      //         menuType,
      //       });
      //     });
      //   }
      // }
      // // 保存并继续添加
      // async function againSave() {
      //   await Submit();
      //   await resetForm();
      // }

      return { registerDrawer, registerForm, getTitle, handleSubmit, _list, isUpdate };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.ant-input-number) {
    width: 100% !important;
  }
</style>
