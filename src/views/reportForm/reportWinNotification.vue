<template>
  <div class="box">
    <iframe class="report_iframe" v-if="iframeSrc" :src="iframeSrc" frameborder="0"> </iframe>
  </div>
</template>
<script lang="ts">
  /**
   * 中标通知书
   * reportWinNotification
   * reportForm/reportWinNotification.vue
   */
  import { defineComponent, ref, unref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useConfigStore } from '/@/store/modules/config';
  import { getBidSectionById } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    components: {},
    setup(_, { attrs }) {
      const route = useRoute();
      const configInfo = useConfigStore().GET_CONFIG_BASEINFO;
      const moduleInfo = useConfigStore().GET_CONFIG_MODULE;

      const iframeSrc = ref<String>(''); // url 地址
      const bidSectionId = ref<Number | unknown>(-999);
      const projectId = ref<Number | unknown>(-999);
      const ifDialog = ref<Boolean | unknown>(false);
      bidSectionId.value = attrs.bidSectionId
        ? attrs.bidSectionId
        : Number(route.query.bidSectionId);
      projectId.value = attrs.projectId ? attrs.projectId : Number(route.query.projectId);
      ifDialog.value = attrs.ifDialog ? attrs.ifDialog : Number(route.query.ifDialog);

      const getIframeSrc = (nameReport) => {
        iframeSrc.value =
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.bidWinningNoticeUrl +
          '&ids=' +
          unref(bidSectionId) +
          '&_nameReport=' +
          `${nameReport}中标通知书`;
      };

      onMounted(async () => {
        const resData = await getBidSectionById(bidSectionId.value);
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
