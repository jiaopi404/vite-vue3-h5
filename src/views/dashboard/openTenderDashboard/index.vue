<template>
  <div :class="prefixCls">
    <CommonPartDashboard />
  </div>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import CommonPartDashboard from '../components/common/CommonPartDashboard.vue';

  const { prefixCls } = useDesign('open-tender-dashboard');
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-open-tender-dashboard';
</style>
