<!--
 * @Author: Vben
 * @Description: logo component
-->
<template>
  <div class="anticon" :class="getAppLogoClass">
    <img
      :src="`${publicPath}resource/school/${configStore.GET_CONFIG_BASEINFO.imageDoc}/logo.png`"
      class="BigImage"
      v-if="!configStore.GET_CONFIG_BASEINFO.ifIndexDefault"
    />
    <img
      :src="`${publicPath}resource/school/${configStore.GET_CONFIG_BASEINFO.imageDoc}/logoMin.png`"
      class="MinImage"
      v-else
    />
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useConfigStoreWithOut } from '/@/store/modules/config';

  const props = defineProps({
    /**
     * The theme of the current parent component
     */
    theme: { type: String, validator: (v: string) => ['light', 'dark'].includes(v) },
    /**
     * Whether to show title
     */
    showTitle: { type: Boolean, default: true },
    /**
     * The title is also displayed when the menu is collapsed
     */
    alwaysShowTitle: { type: Boolean },
  });
  const publicPath = import.meta.env.VITE_PUBLIC_PATH || '/';
  //根据后端的配置：切换头部展示
  const configStore = useConfigStoreWithOut();
  const { prefixCls } = useDesign('app-logo');
  const { getCollapsedShowTitle } = useMenuSetting();

  const getAppLogoClass = computed(() => [
    prefixCls,
    props.theme,
    { 'collapsed-show-title': unref(getCollapsedShowTitle) },
  ]);
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    padding-left: 7px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.light {
      border-bottom: 1px solid @border-color-base;
    }

    &.collapsed-show-title {
      padding-left: 20px;
    }

    &.light &__title {
      color: @primary-color;
    }

    &.dark &__title {
      color: @white;
    }

    &__title {
      font-size: 16px;
      font-weight: 700;
      transition: all 0.5s;
      line-height: normal;
    }
  }
  .BigImage {
    width: 300px;
    height: 58px;
    margin-right: 2px;
    margin-left: 8px;
  }
  .MinImage {
    width: 220px;
    height: 37px;
    margin-right: 2px;
    margin-left: 8px;
  }
</style>
