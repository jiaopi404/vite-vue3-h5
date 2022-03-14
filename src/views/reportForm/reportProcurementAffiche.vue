<template>
  <div class="box">
    <iframe class="report_iframe" v-if="iframeSrc" :src="iframeSrc" frameborder="0"> </iframe>
    <a-button type="primary" @click="toReport" class="middleBtn" :disabled="btnDisabled">
      我要报价
    </a-button>
  </div>
</template>
<script lang="ts">
  /**
   * 采购公告
   * reportProcurementAffiche
   * reportForm/reportProcurementAffiche.vue
   */
  import { defineComponent, ref, unref, onMounted } from 'vue';

  import { useMessage } from '/@/hooks/web/useMessage';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { checkSupplier } from '/@/api/purchase/supplierApi';
  import { ReportUrlEnum } from '/@/enums/reportUrlEnum';
  import { TagModuleNameEnum } from '/@/enums/menuFullPathEnum';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useBusinessStore } from '/@/store/modules/business';
  import { getTagModuleByTagModuleName } from '/@/utils/commonServe/businessUtil';
  import { getBidSectionById } from '/@/api/purchase/plan-purchase';

  export default defineComponent({
    components: {},
    setup(_, { attrs }) {
      const route = useRoute();
      const router = useRouter();
      const userStore = useUserStore();
      const userInfo = userStore.getUserInfo;
      const token = userStore.getToken; // 判断是否登录

      const configInfo = useConfigStore().GET_CONFIG_BASEINFO;
      const moduleInfo = useConfigStore().GET_CONFIG_MODULE;
      const permissionStore = usePermissionStore();
      const businessStore = useBusinessStore();
      const { createConfirm } = useMessage();

      const iframeSrc = ref<String>(''); // url 地址
      const btnDisabled = ref<boolean>(false);
      const bidSectionId = ref<Number | unknown>(-999);
      const ifDialog = ref<Boolean | unknown>(false);

      bidSectionId.value = attrs.bidSectionId
        ? attrs.bidSectionId
        : Number(route.query.bidSectionId);
      ifDialog.value = attrs.ifDialog ? attrs.ifDialog : Number(route.query.ifDialog);

      const getIframeSrc = (nameReport) => {
        // 报表路径
        iframeSrc.value =
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.procurementNoticeUrl +
          '&ids=' +
          unref(bidSectionId) +
          '&_nameReport=' +
          `${nameReport}采购公告`;
        console.log('iframeSrc.value:', iframeSrc.value);
      };

      onMounted(async () => {
        const resData = await getBidSectionById(bidSectionId.value);
        getIframeSrc(resData.proName);
        btnPermissions(resData);
      });

      // 我要报价按钮
      // 按钮权限 1.先时间 2.后登陆 3.在是否为供应商
      const btnPermissions = (resData) => {
        if (
          resData.project.quoteStartTime > Date.now() ||
          resData.project.quoteEndTime < Date.now()
        ) {
          btnDisabled.value = true;
        } else {
          if (!token) {
            btnDisabled.value = false;
          } else {
            if (userInfo.role === 1) {
              btnDisabled.value = false;
            } else {
              btnDisabled.value = true;
            }
          }
        }
      };

      const toReport = async () => {
        // 无登录权限时的跳转
        if (!token) {
          // 无权限
          router.push({
            path: ReportUrlEnum.PROCUREMENT_REPORT_URL,
            query: {
              tagModuleName: TagModuleNameEnum.OPEN_TENDER,
              bidSectionId: +unref(bidSectionId),
            },
          });
          return;
        }
        // 有登录权限时的跳转
        const resData = await checkSupplier({
          userId: userInfo.id,
          bidSectionId: unref(bidSectionId),
        });
        // 判断有无构建动态路由, 如果构建了动态路由, 则不需要加模块的信息
        const tagModuleInfo: any = {};
        if (!permissionStore.getIsDynamicAddedRoute) {
          tagModuleInfo.tagModuleName = TagModuleNameEnum.OPEN_TENDER;
          const tagModule = getTagModuleByTagModuleName(TagModuleNameEnum.OPEN_TENDER);
          businessStore.SET_TAG_MODULE_INFO(tagModule);
        }
        if (resData.ifSuccess) {
          // 跳转招标详情
          router.push({
            path: '/supplier/tenderDetails',
            query: {
              bidSectionId: +unref(bidSectionId),
              ...tagModuleInfo,
            },
          });
        } else {
          message(resData.error);
        }
      };

      const message = (msg) => {
        createConfirm({
          iconType: 'info',
          title: '提示',
          content: msg,
          okCancel: false,
          okText: '确定',
        });
      };

      return {
        iframeSrc,
        btnDisabled,
        toReport,
        message,
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
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
  }

  .report_iframe {
    height: 100%;
    width: 100%;
  }
</style>
