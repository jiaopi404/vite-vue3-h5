<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    title="添加报名供应商"
    width="30%"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicTable, TableAction } from '/@/components/Table';
  import { formSchema } from '../enterTheRegisteredSupplier.data';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  // 接口调用
  import { saveRegisteredSupplier } from '/@/api/inProcurement/inProcurementApi';
  import { queryAllSelect } from '/@/api/inProcurement/inProcurementApi';

  export default defineComponent({
    name: 'setUpEnterTheRegisteredSupplier',
    components: { BasicDrawer, BasicForm, BasicTable, TableAction },
    emits: ['success', 'register'],
    setup(_, { emit }) {
      let bidSectionId = ref(0);
      const userInfo = useUserStore().getUserInfo;
      const { createMessage } = useMessage();
      const [registerForm, { resetFields, getFieldsValue, validate, updateSchema }] = useForm({
        labelWidth: 100,
        schemas: formSchema(),
        showActionButtonGroup: false,
        baseColProps: { span: 22 },
      });

      const [registerDrawer, { changeLoading, setDrawerProps, closeDrawer }] = useDrawerInner(
        async (data) => {
          try {
            resetFields(); //重置
            setDrawerProps({ confirmLoading: false });
            changeLoading(true);
            bidSectionId = data.id;
            updateSchema({
              field: 'successfulSupplier.id',
              componentProps: ({ formActionType }) => ({
                // api: queryAllSelect,
                api: async (bidSectionId) => {
                  const res = await queryAllSelect(bidSectionId);
                  const list = data.selectId.map((item) => item);
                  const arr = res.filter((item) => !list.includes(item.id));
                  return arr;
                },
                params: bidSectionId,
                // resultField: 'data', //接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
                labelField: 'name',
                valueField: 'id',
                // immediate: false, // 是否立即请求接口，否则将在第一次点击时候触发请求
                showSearch: true,
                optionFilterProp: 'label',
                placeholder: '请选择报名供应商',
                onChange: (value, Options) => {
                  console.log('select change:', value, Options);
                  const { setFieldsValue } = formActionType;
                  console.log(Options, 'OptionsOptions');
                  setFieldsValue({
                    perName: Options?.user?.perName,
                    mobile: Options.user?.mobile,
                    citId: Options.user?.citId,
                  });
                }, // 是否立即请求接口，否则将在第一次点击时候触发请求
              }),
            });
          } finally {
            changeLoading(false);
          }
        },
      );
      async function handleSubmit() {
        try {
          await validate();
          setDrawerProps({ confirmLoading: true });
          const formData = getFieldsValue();
          let params = {
            bidSectionId: bidSectionId,
            addUser: {
              id: userInfo.id,
            },
          };
          let _data = Object.assign({}, formData, params);
          await saveRegisteredSupplier(_data);
          closeDrawer();
          createMessage.success('添加成功');
          emit('success');
        } finally {
          setDrawerProps({ confirmLoading: false });
        }
      }
      return {
        registerDrawer,
        registerForm,
        handleSubmit,
      };
    },
  });
</script>
