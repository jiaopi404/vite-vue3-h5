<template>
  <PageWrapper :class="prefixCls" title="" :contentFullHeight="true" v-loading="loading">
    <template #default>
      <ContractTemplatePreview
        :id="bidSectionId"
        :type="2"
        :difference="true"
      ></ContractTemplatePreview>
    </template>
    <template #rightFooter>
      <Button class="mr-3" @click="clickHandleCancel">返回</Button>
    </template>
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useRoute, useRouter } from 'vue-router';
  import { PageWrapper } from '/@/components/Page';
  import { Button } from 'ant-design-vue';
  import { useTabs } from '/@/hooks/web/useTabs';

  import ContractTemplatePreview from '/@/components/LxComponents/LxTemplatePreview/ContractTemplatePreview.vue';
  export default defineComponent({
    components: {
      PageWrapper,
      Button,
      ContractTemplatePreview,
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      let bidSectionId = Number(route.query.id);
      const loading = ref<boolean>(false);
      let formData = ref<any>({});
      const { closeCurrent } = useTabs(router);
      const { prefixCls } = useDesign('purchase-template');

      //返回上一页面
      async function clickHandleCancel() {
        closeCurrent();
        router.go(-1);
      }
      return {
        bidSectionId,
        prefixCls,
        loading,
        clickHandleCancel,
        formData,
      };
    },
  });
</script>

<style lang="less" scoped>
  .leafLevel1 {
    margin: 10px auto;
    text-align: center;
    font-size: 32px;
  }
  .leafLevel2 {
    margin: 10px auto;
    font-size: 28px;
  }
  :deep(.tox-tinymce) {
    margin-top: 20px;
  }
</style>
