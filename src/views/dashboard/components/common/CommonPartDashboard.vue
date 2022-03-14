<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}-sub-container`" class="flex">
      <NoticeAnnouncementCardDashboard class="flex-1" style="margin: 15px" />
      <CommonDownloadCardDashboard class="flex-1" style="margin: 15px 15px 15px 0" />
    </div>
    <div :class="`${prefixCls}-sub-container`">
      <TodoTasksCardDashboard style="margin: 0 15px 15px 15px" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import CommonDownloadCardDashboard from './CommonDownloadCardDashboard.vue';
  import NoticeAnnouncementCardDashboard from './NoticeAnnouncementCardDashboard.vue';
  import TodoTasksCardDashboard from './TodoTasksCardDashboard.vue';

  const { prefixCls } = useDesign('common-part-dashboard');
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-common-part-dashboard';
</style>
