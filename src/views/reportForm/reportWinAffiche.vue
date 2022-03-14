<template>
  <div class="box">
    <iframe class="report_iframe" v-if="iframeSrc" :src="iframeSrc" frameborder="0"> </iframe>
    <!-- <a-button type="primary" @click="handleToReport" class="middleBtn"> 查看中标通知书 </a-button> -->
  </div>
</template>
<script lang="ts">
  /**
   * 中标公告/结果公告
   * reportWinAffiche
   * reportForm/reportWinAffiche.vue
   */
  import { defineComponent, ref, unref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useConfigStore } from '/@/store/modules/config';
  import { getBidSectionById } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    components: {},
    setup(_, { attrs }) {
      const route = useRoute();
      const router = useRouter();
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
        // 报表路径
        iframeSrc.value =
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.resultNoticeUrl +
          '&ids=' +
          unref(bidSectionId) +
          '&_nameReport=' +
          `${nameReport}中标公告`;
      };

      onMounted(async () => {
        const resData = await getBidSectionById(bidSectionId.value);
        getIframeSrc(resData.proName);
      });

      const handleToReport = (record?: any) => {
        // console.log('record:', record);
        router.push({
          path: '/reportForm/reportWinNotification', // 中标通知书
          // query: {
          //   bidSectionId: record.id,
          //   projectId: record.project.id,
          // },
        });
      };

      return {
        iframeSrc,
        handleToReport,
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
