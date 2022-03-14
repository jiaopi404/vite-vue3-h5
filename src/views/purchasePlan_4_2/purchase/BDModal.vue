<template>
  <BasicModal
    @register="register"
    title="所属项目标段"
    :height="400"
    @ok="saveBD"
    @cancel="cancelBD"
  >
    <BasicForm @register="registerForm" class="bd_select" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, watch, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Select } from 'ant-design-vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  export default defineComponent({
    components: { BasicModal, Select, BasicForm },
    props: {
      bidList: {
        type: Array,
      },
      proId: {
        type: Number,
      },
    },
    emits: ['success', 'cancel'],
    setup(props, { emit }) {
      const bidId = ref();
      const bidList = ref(props.bidList);
      const bodyStyle = ref();
      if (props.bidList) {
        props.bidList.forEach((item: any) => {
          item.label = item.name;
          item.value = item.id;
        });
      }
      // const BidList = computed(() => props.bidList);
      // console.log('所属标段', BidList.value);
      watch(
        () => props.bidList,
        () => {
          props.bidList?.forEach((item: any) => {
            item.label = item.name;
            item.value = item.id;
          });
        },
        {
          deep: true,
        },
      );
      const [register, { closeModal }] = useModalInner(async () => {
        await resetFields();
        nextTick(() => {
          updateSchema({
            field: 'bidSectionId',
            label: '所属项目标段',
            component: 'Select',
            colProps: { span: 24 },
            required: true,
            componentProps: {
              placeholder: '请选择所属项目标段',
              options: props.bidList,
              showSearch: true,
              optionFilterProp: 'label',
            },
          });
        });
      });
      const [registerForm, { updateSchema, validate, resetFields }] = useForm({
        labelWidth: 100,
        schemas: [
          {
            field: 'bidSectionId',
            label: '所属项目标段',
            component: 'Select',
            colProps: { span: 24 },
            required: true,
            componentProps: {
              placeholder: '请选择所属项目标段',
              options: props.bidList,
              dropdownClassName: 'bd_select',
              labelField: 'name',
              valueField: 'id',
              showSearch: true,
              optionFilterProp: 'label',
            },
          },
        ],
        baseColProps: { span: 10 },
        showActionButtonGroup: false,
        baseRowStyle: {
          // padding: '20px 200px 50px',
          padding: '20px 20px',
          height: '350px',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#F4F6F9',
        },
      });
      async function saveBD() {
        try {
          const values = await validate();
          emit('success', values);
        } catch (error) {}
      }
      function cancelBD() {
        emit('cancel');
      }
      return {
        register,
        closeModal,
        bidList,
        bidId,
        bodyStyle,
        registerForm,
        saveBD,
        cancelBD,
      };
    },
  });
</script>
<style lang="less" scoped>
  :deep(.scroll-container) {
    height: 400px !important;
    padding: 0 !important;
  }
  .bd_select {
    background-color: red;
  }
</style>
