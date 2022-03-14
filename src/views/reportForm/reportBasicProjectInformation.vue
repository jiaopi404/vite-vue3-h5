<template>
  <div class="box">
    <Tabs v-model:activeKey="activeKey" class="h-1/1" size="small">
      <TabPane :key="1" tab="项目报表" style="height: calc(100% - 46px)">
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
        <LxAuditRecord objectName="pro_project" :objectId="projectId" />
      </TabPane>
    </Tabs>
  </div>
</template>
<script lang="ts">
  /**
   * 【项目】 报表
   * reportBasicProjectInformation
   * reportForm/reportBasicProjectInformation.vue
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
  // api
  import { getProjectById } from '/@/api/purchase/plan-purchase';
  import { getActRuTaskByProcessId } from '/@/api/auditMangement/auditMangement';

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

      const iframeSrc = ref<String>(''); // url 地址
      const projectId = ref<Number>(-999);
      const projectInfo = ref();
      const ifShow = ref(false);
      const ifShowBtn = ref<Boolean | unknown>(false);
      const loadingBtn = ref(false);
      const activeKey = ref(1); // 当前激活 tab 面板的 key
      // ifShowBtn.value = attrs.ifShow ? attrs.ifShow : route.query.ifShow;

      if (attrs.ifShow === true || route.query.ifShow === 'true') {
        ifShowBtn.value = true;
      } else {
        ifShowBtn.value = false;
      }
      projectId.value = attrs.projectId ? attrs.projectId : Number(route.query.projectId);
      const ifDialog = ref<Boolean | unknown>(false);
      ifDialog.value = attrs.ifDialog ? attrs.ifDialog : Number(route.query.ifDialog);

      // 报表路径
      const getIframeSrc = () => {
        iframeSrc.value =
          //   configInfo.pcReportPrefix + '?' + moduleInfo.projectBasicUrl + '&ids=' + unref(projectId);
          configInfo.pcReportPrefix +
          '?' +
          moduleInfo.projectBasicUrl +
          '&ids=' +
          unref(projectId) +
          '&userId=' +
          userInfo.id +
          '&_nameReport=' +
          projectInfo.value?.proName;
        console.log('iframeSrc.value===', iframeSrc.value);
      };

      onMounted(async () => {
        if (!ifDialog.value) {
          projectInfo.value = await getProjectById(projectId.value);
          if (['2', '5', '7', '9', '14', '17', '19'].includes(projectInfo.value.status.code)) {
            ifShow.value = true;
          }
        }
        projectInfo.value = await getProjectById(projectId.value);
        getIframeSrc();
      });
      const [registerDrawer, { openDrawer }] = useDrawer();

      async function toExamine() {
        loadingBtn.value = true;
        const res = await getActRuTaskByProcessId(projectInfo.value.processId);
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
        projectId,
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
