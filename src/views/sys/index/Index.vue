<template>
  <div :class="prefixCls" v-if="ifIndexDefault">
    <Row :class="`${prefixCls}-left-and-right`" class="flex justify-con">
      <Col :class="`${prefixCls}-left`" :span="16">
        <GreetingHeaderCardVue style="margin: 15px 0 0 15px" />
        <TagModuleCardVue style="margin: 15px 0 0 15px" />
        <TodoTasksCardVue style="margin: 15px 0 0 15px" />
        <FriendlyLinkCard
          v-if="configStore.GET_CONFIG_MODULE.ifShowElectronicStore"
          style="margin: 15px 0 0 15px"
        />
        <!-- <MyProjectCardVue style="margin: 15px 0 0 15px" /> -->
        <MyBusinessCardVue style="margin: 15px 0 15px 15px" />
      </Col>
      <Col :class="`${prefixCls}-right`" :span="8">
        <Affix :offset-top="49" @change="handleAffixChange">
          <ScrollContainer :class="`${prefixCls}-right-affix-container`">
            <div
              :class="`${prefixCls}-right-affix-content`"
              class="flex flex-col items-stretch justify-start"
            >
              <IndexCarouselCard class="flex-none" />
              <CommonDownloadCardVue style="margin: 15px 15px 0 15px" class="flex-1" />
              <NoticeAnnouncementCardVue style="margin: 15px 15px 15px 15px" class="flex-1" />
            </div>
          </ScrollContainer>
        </Affix>
      </Col>
    </Row>
    <IndexReportFormDialog @register="register" />
  </div>
  <!-- 首页是否默认样式:IfIndexDefault为0 -->
  <div :class="prefixCls" style="margin: auto" v-else>
    <Row :class="`${prefixCls}-left-and-right`" class="flex justify-con">
      <Col :class="`${prefixCls}-left`" :span="22">
        <TagModuleCardVue style="margin: 35px auto 0" />
      </Col>
    </Row>
    <!-- 当前登陆人不是组织部门主管则显示 -->
    <Row :class="`${prefixCls}-left-and-right`" class="flex justify-con" v-if="!userInfo.ifDepHead">
      <Col :class="`${prefixCls}-left`" class="business" :span="22">
        <TodoTasksCardVue style="margin: 15px 0 0 0; width: 50%; height: 367px" />
        <MyBusinessCardVue style="margin: 15px 0 15px 0; width: 50%; height: 367px" />
      </Col>
    </Row>
    <IndexReportFormDialog @register="register" />
  </div>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import TagModuleCardVue from './components/TagModuleCard.vue';
  import { Row, Col, Affix } from 'ant-design-vue';
  import CommonDownloadCardVue from './components/CommonDownloadCard.vue';
  import NoticeAnnouncementCardVue from './components/NoticeAnnouncementCard.vue';
  import TodoTasksCardVue from './components/TodoTasksCard.vue';
  import GreetingHeaderCardVue from './components/GreetingHeaderCard.vue';
  // import MyProjectCardVue from './components/MyProjectCard.vue';
  import MyBusinessCardVue from './components/MyBusinessCard.vue';
  import IndexCarouselCard from './components/IndexCarouselCard.vue';
  import IndexReportFormDialog from './components/reportFormDialogs/IndexReportFormDialog.vue';
  import { useModal } from '/@/components/Modal';
  import { useToIndexReportDialogEventBusHandler } from './components/indexHelper';
  import ScrollContainer from '/@/components/Container/src/ScrollContainer.vue';
  import FriendlyLinkCard from './components/FriendlyLinkCard.vue';
  import { useConfigStore, useConfigStoreWithOut } from '/@/store/modules/config';
  import { useUserStore } from '/@/store/modules/user';
  const { prefixCls } = useDesign('page-index');
  const configStore = useConfigStore();
  const ifIndexDefault = useConfigStoreWithOut().GET_CONFIG_BASEINFO.ifIndexDefault;
  const userInfo = useUserStore().getUserInfo;
  const [register, { openModal }] = useModal();

  const handleAffixChange = (...args) => {
    // console.log('args are: ', args);
  };

  useToIndexReportDialogEventBusHandler((payload) => {
    openModal(true, payload);
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-page-index';

  .@{prefix-cls} {
    &-right-affix-container {
      height: calc(100vh - 48px);
    }
    &-right-affix-content {
      min-height: calc(100vh - 48px);
    }
  }
  :deep(.ant-col.ant-col-22) {
    margin: auto;
  }
  .business {
    display: flex !important;
    margin-bottom: 10px;
  }
</style>
