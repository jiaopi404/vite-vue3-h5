<template>
  <div class="box">
    <Tabs v-model:activeKey="activeKey" class="h-1/1" size="small">
      <TabPane :key="1" tab="合同报表" style="height: calc(100% - 46px)">
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
      <TabPane :key="2" tab="合同条款" style="height: calc(100% - 46px)">
        <LxPrintPreview :id="contractId" :type="1"></LxPrintPreview>
      </TabPane>
      <TabPane v-if="userInfo.role === 2" :key="0" tab="审核记录" class="h-1/1">
        <LxAuditRecord objectName="con_contract" :objectId="contractId" />
      </TabPane>
    </Tabs>
  </div>
</template>
<script lang="ts">
  /**
   * 合同报表
   * reportContract
   * reportForm/reportContract.vue
   */
  // 按需引入
  import { Tabs, TabPane } from 'ant-design-vue';
  import { defineComponent, onMounted, ref, unref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStore } from '/@/store/modules/config';
  import { useDrawer } from '/@/components/Drawer';
  import { EventBus } from '/@/utils/commonServe/eventBus';
  import LxAuditRecord from '/@/components/LxComponents/LxAuditRecord/LxAuditRecord.vue';
  import AuditProcessDrawer from '/@/components/LxComponents/LxAuditProcess/auditProcessDrawer.vue';
  import { getActRuTaskByProcessId } from '/@/api/purchase/plan-purchase';
  import { getConContractById } from '/@/api/contractManagement/waitImprove';
  import LxPrintPreview from '/@/components/LxComponents/LxPrintPreview/LxPrintPreview.vue';

  export default defineComponent({
    components: {
      AuditProcessDrawer,
      Tabs,
      TabPane,
      LxAuditRecord, // 审核记录
      LxPrintPreview, // 合同条款
    },
    setup(_, { attrs }) {
      const route = useRoute();
      const router = useRouter();
      const userStore = useUserStore();
      const userInfo = userStore.getUserInfo;
      const configInfo = useConfigStore().GET_CONFIG_BASEINFO;
      const moduleInfo = useConfigStore().GET_CONFIG_MODULE;

      const iframeSrc = ref<String>(''); // url 地址
      const contractId = ref<Number | unknown>(-999);
      const projectId = ref<Number | unknown>(-999);
      const ifDialog = ref<Boolean | unknown>(false);
      const ifShowBtn = ref<Boolean | unknown>(false);
      const ifShow = ref(false);
      const contractInfo = ref();
      const loadingBtn = ref(false);

      contractId.value = attrs.contractId ? attrs.contractId : Number(route.query.contractId);
      projectId.value = attrs.projectId ? attrs.projectId : Number(route.query.projectId);
      ifDialog.value = attrs.ifDialog ? attrs.ifDialog : Number(route.query.ifDialog);
      // ifShowBtn.value = attrs.ifShow ? attrs.ifShow : route.query.ifShow;
      const activeKey = ref(1); // 当前激活 tab 面板的 key
      if (attrs.ifShow === true || route.query.ifShow === 'true') {
        ifShowBtn.value = true;
      } else {
        ifShowBtn.value = false;
      }

      const getIframeSrc = () => {
        iframeSrc.value =
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.conContractUrl +
          '&ids=' +
          unref(contractId) +
          '&_nameReport=' +
          contractInfo.value.name;
      };

      onMounted(async () => {
        contractInfo.value = await getConContractById(contractId.value);
        getIframeSrc();
      });
      const [registerDrawer, { openDrawer }] = useDrawer();

      async function toExamine() {
        loadingBtn.value = true;
        const res = await getActRuTaskByProcessId(contractInfo.value.processId);
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
        contractId,
        ifShow,
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
