<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    title="Modal Title"
    :helpMessage="['提示1', '提示2']"
  >
    <Result title="提示">
      <template #subTitle>
        报价截止日期xxx
      </template>
      <template #extra>
        <a-button key="console" type="primary" @click="handelOk" style="width: 100px">ok</a-button>
      </template>
    </Result>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { Result } from "ant-design-vue";
  export default defineComponent({
    components: { BasicModal, Result },
    setup() {
      const [register, { closeModal }] = useModalInner();

      const handelOk = () => {
        closeModal()
      }
      return {
        register,
        closeModal,
        handelOk
      };
    },
  });
</script>