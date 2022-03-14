<template>
  <div class="box">
    <Tabs v-model:activeKey="activeKey" class="h-1/1" size="small">
      <TabPane :key="1" tab="验收记录" style="height: calc(100% - 46px)">
        <iframe class="report_iframe" v-if="iframeSrc" :src="iframeSrc" frameborder="0"> </iframe>
        <div class="save-review-info-btn">
          <a-button
            v-if="ifShowBtn"
            class="lly"
            type="primary"
            @click="toExamine"
            :loading="loadingBtn"
            style="margin-right: 10px"
            >审核
          </a-button>
        </div>
        <AuditProcessDrawer
          @register="registerDrawer"
          :minHeight="100"
          :ifTodoTask="true"
          @success="handleSuccess"
        />
      </TabPane>

      <TabPane v-if="userInfo.role === 2" :key="0" tab="审核记录" class="h-1/1">
        <LxAuditRecord objectName="pro_acceptance" :objectId="acceptanceId" />
      </TabPane>
    </Tabs>
  </div>
</template>
<script lang="ts">
  /**
   * 【验收】 报表
   * reportAcceptanceRecord
   * reportForm/reportAcceptanceRecord.vue
   */
  // 按需引入
  import { Tabs, TabPane } from 'ant-design-vue';
  import { defineComponent, ref, unref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { useDrawer } from '/@/components/Drawer';
  import { EventBus } from '/@/utils/commonServe/eventBus';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import LxAuditRecord from '/@/components/LxComponents/LxAuditRecord/LxAuditRecord.vue';
  import { getActRuTaskByProcessId, getBidSectionById } from '/@/api/purchase/plan-purchase';
  import { getProAcceptanceById } from '/@/api/acceptanceManagement/acceptanceManagementApi';

  export default defineComponent({
    components: {
      AuditProcessDrawer,
      Tabs,
      TabPane,
      LxAuditRecord, // 审核记录
    },
    setup(_, { attrs }) {
      const route = useRoute();
      const router = useRouter();
      const userStore = useUserStore();
      const userInfo = userStore.getUserInfo;
      const configInfo = useConfigStore().GET_CONFIG_BASEINFO;
      const moduleInfo = useConfigStore().GET_CONFIG_MODULE;

      const activeKey = ref(1); // 当前激活 tab 面板的 key
      const iframeSrc = ref<String>(''); // url 地址
      const bidSectionId = ref<Number | unknown>(-999); // 标段id
      const acceptanceId = ref<Number | unknown>(-999); // 验收id
      const ifDialog = ref<Boolean | unknown>(false);
      const ifShowBtn = ref<Boolean | unknown>(false);

      const bidsectionInfo = ref();
      const acceptanceInfo = ref();
      const ifShow = ref(false);
      const loadingBtn = ref(false);

      if (attrs.ifShow === true || route.query.ifShow === 'true') {
        ifShowBtn.value = true;
      } else {
        ifShowBtn.value = false;
      }
      bidSectionId.value = attrs.bidSectionId
        ? attrs.bidSectionId
        : Number(route.query.bidSectionId);
      acceptanceId.value = attrs.acceptanceId
        ? attrs.acceptanceId
        : Number(route.query.acceptanceId);

      ifDialog.value = attrs.ifDialog ? attrs.ifDialog : Number(route.query.ifDialog);

      const getIframeSrc = () => {
        // 报表路径
        iframeSrc.value =
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.projectAcceptanceUrl +
          '&ids=' +
          unref(bidSectionId) +
          '&_nameReport=' +
          `${bidsectionInfo.value?.proName}验收单`;
      };

      onMounted(async () => {
        bidsectionInfo.value = await getBidSectionById(bidSectionId.value);
        if (acceptanceId.value) {
          acceptanceInfo.value = await getProAcceptanceById(acceptanceId.value);
        }
        if (!ifDialog.value) {
          if (['2', '5', '7', '9', '14', '17', '19'].includes(bidsectionInfo.value.status.code)) {
            ifShow.value = true;
          }
        }
        getIframeSrc();
      });

      const [registerDrawer, { openDrawer }] = useDrawer();

      async function toExamine() {
        loadingBtn.value = true;
        const res = await getActRuTaskByProcessId(
          acceptanceInfo.value ? acceptanceInfo.value.processId : bidsectionInfo.value.processId,
        );
        // const res = await getActRuTaskByProcessId('9af675fb-6233-11ec-98d5-52540034b5e6');
        openDrawer(true, {
          ID_: res.data.ID_ ? res.data.ID_ : '',
          PROC_INST_ID_: res.data.PROC_INST_ID_ ? res.data.PROC_INST_ID_ : '',
          FILENAME: res.data.DGRM_RESOURCE_NAME_ ? res.data.DGRM_RESOURCE_NAME_ : '',
        });
        loadingBtn.value = false;
      }

      async function handleSuccess() {
        loadingBtn.value = false;
        if (ifDialog.value) {
          EventBus.emit('dialog-audit-success');
        } else {
          router.back();
        }
      }

      return {
        iframeSrc,
        userInfo,
        bidSectionId,
        acceptanceId,
        ifShowBtn,
        loadingBtn,
        activeKey,
        registerDrawer,
        toExamine,
        handleSuccess,
      };
    },
  });
</script>
<style scoped>
  .box {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .report_iframe {
    height: 100%;
    width: 100%;
  }
  .save-review-info-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 30px;
  }
  /* tab样式 */
  :deep().ant-tabs-bar {
    margin: 0px;
  }
  :deep().ant-tabs-content {
    height: 100%;
  }
</style>
