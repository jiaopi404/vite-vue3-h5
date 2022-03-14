<template>
  <div class="box">
    <iframe class="report_iframe" v-if="iframeSrc" :src="iframeSrc" frameborder="0"> </iframe>
  </div>
</template>
<script lang="ts">
  /**
   * 供应商报表
   * reportSupplier
   * reportForm/reportSupplier.vue
   */
  import { defineComponent, ref, unref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useConfigStore } from '/@/store/modules/config';
  import { getBiddingCompanyById } from '/@/api/review-node/biddingCompany';

  export default defineComponent({
    components: {},
    setup(_, { attrs }) {
      const route = useRoute();
      const iframeSrc = ref<String>(''); // url 地址
      const configInfo = useConfigStore().GET_CONFIG_BASEINFO;
      const moduleInfo = useConfigStore().GET_CONFIG_MODULE;

      const supplierId = ref<Number | unknown>(-999);
      const ifDialog = ref<Boolean | unknown>(false);
      supplierId.value = attrs.biddingCompanyId
        ? attrs.biddingCompanyId
        : Number(route.query.supplierId);
      ifDialog.value = attrs.ifDialog ? attrs.ifDialog : Number(route.query.ifDialog);

      const getIframeSrc = (exportName) => {
        iframeSrc.value =
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.biddingCompanyUrl +
          '&ids=' +
          unref(supplierId.value) +
          '&_nameReport=' +
          exportName;
      };

      onMounted(async () => {
        const resData = await getBiddingCompanyById(unref(supplierId));
        getIframeSrc(resData.name);
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
  .middleBtn {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
  }
  .report_iframe {
    height: 100%;
    width: 100%;
  }
</style>
