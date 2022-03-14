<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerDrawer"
    title="实际技术参数"
    @ok="handleSubmit"
    class="box"
  >
    <div class="actualSpecBox">
      {{ actualSpec }}
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  export default defineComponent({
    components: { BasicModal },
    // emits: ['register'],
    setup() {
      const actualSpec = ref<String>('');

      const [registerDrawer, { closeModal, setModalProps }] = useModalInner((data) => {
        console.log('data model：', data);
        actualSpec.value = data.actualSpec;
        setModalProps({
          canFullscreen: false,
          showCancelBtn: false,
        });
      });

      const handleSubmit = async () => {
        closeModal();
      };

      return {
        actualSpec,
        registerDrawer,
        closeModal,
        handleSubmit,
      };
    },
  });
</script>
<style scoped>
  /* .actualSpecBox {
    border: 1px solid black;
    height: 100%;
    margin: 0 10px;
    padding: 15px;
  } */
  /* .box .scrollbar__view {
    border: 1px solid black;
    height: 100%;
    margin: 0 10px;
    padding: 15px;
  } */
</style>
