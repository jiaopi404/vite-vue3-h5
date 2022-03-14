<template>
  <div class="box">
    <iframe class="report_iframe" v-if="iframeSrc" :src="iframeSrc" frameborder="0"> </iframe>
  </div>
</template>
<script lang="ts">
  /**
   * 项目征集库报表
   * reportProjectBudget
   * reportForm/reportProjectBudget.vue
   */
  import { defineComponent, ref, unref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useConfigStore } from '/@/store/modules/config';
  import { getProBudgetById } from '/@/api/projectManagement/projectCollectionLibraryApi';

  export default defineComponent({
    components: {},
    setup(_, { attrs }) {
      const route = useRoute();
      const iframeSrc = ref<String>(''); // url 地址
      const configInfo = useConfigStore().GET_CONFIG_BASEINFO;
      const moduleInfo = useConfigStore().GET_CONFIG_MODULE;

      const proBudgetId = ref<Number>(-999); // 项目征集库id
      const ifDialog = ref<Boolean | unknown>(false);
      proBudgetId.value = attrs.biddingCompanyId
        ? attrs.biddingCompanyId
        : Number(route.query.proBudgetId);
      ifDialog.value = attrs.ifDialog ? attrs.ifDialog : Number(route.query.ifDialog);

      const getIframeSrc = (exportName) => {
        iframeSrc.value =
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.projectBudgetUrl +
          '&ids=' +
          unref(proBudgetId.value) +
          '&_nameReport=' +
          exportName;
      };

      onMounted(async () => {
        const resData = await getProBudgetById(unref(proBudgetId));
        getIframeSrc(resData.proName);
      });

      return {
        iframeSrc,
      };
    },
  });
</script>
<style scoped>
  .box {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .report_iframe {
    height: 100%;
    width: 100%;
  }
</style>
