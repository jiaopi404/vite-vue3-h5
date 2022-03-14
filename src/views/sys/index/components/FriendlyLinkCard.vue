<template>
  <IndexCardVue
    :class="prefixCls"
    title="友情链接"
    title-icon="ant-design:link-outlined"
    :title-icon-color="titleIconColor"
    :loading="loadingRef"
    :is-extra="false"
    :bodyStyle="{ padding: '12px' }"
  >
    <Card.Grid
      :class="`${prefixCls}-tag-module`"
      class="flex flex-col items-center justify-center p-1 m-1 cursor-pointer"
      v-for="friendlyLink in friendlyLinksRef"
      :key="friendlyLink.id"
      @click="clickHandler(friendlyLink)"
    >
      <!-- <div
        :class="`${prefixCls}-tag-module__icon-container`"
        class="flex items-center justify-center mb-3"
        :style="{
          backgroundColor: tagModule.meta.color,
        }"
      >
        <Icon
          :class="`${prefixCls}-tag-module__icon`"
          :icon="tagModule.meta.icon"
          color="#fff"
          size="25"
        />
      </div>
      <div :class="`${prefixCls}-tag-module__name`">{{ tagModule.name }}</div> -->
      <Image
        :alt="friendlyLink.meta.name"
        :placeholder="true"
        :preview="false"
        :src="friendlyLink.meta.logoSrc"
        :height="80"
        :width="80"
      />
    </Card.Grid>
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { DictionaryI } from '/#/business';
  import { useDesign } from '/@/hooks/web/useDesign';
  import IndexCardVue from './IndexCard.vue';
  import { Card, Image } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { useConfigStore } from '/@/store/modules/config';
  import { getDictionaryByParentId } from '/@/api/demo/system';
  import { openWindow } from '/@/utils';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';

  const titleIconColor = ref<ThemeColorEnum>(ThemeColorEnum.seven);
  const { prefixCls } = useDesign('friendly-link-card');
  const configStore = useConfigStore();

  const friendlyLinksRef = ref<DictionaryI[]>([]);
  const loadingRef = ref<boolean>(false);

  onMounted(async () => {
    loadingRef.value = true;
    try {
      const res = await getDictionaryByParentId(configStore.GET_CONFIG_DICTIONRY.friendlyLinkId);
      friendlyLinksRef.value = res.map((item) => ({
        ...item,
        meta: JSON.parse(item.code),
      }));
    } finally {
      loadingRef.value = false;
    }
  });
  const clickHandler = (friendlyLink) => {
    openWindow(friendlyLink.meta.link, { target: '_blank' });
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-friendly-link-card';
  @tagModuleIconContainerLength: 45px;

  .@{prefix-cls} {
    &-tag-module {
      width: calc((100% - 48px) / 6);
      text-align: center;
      padding: 12px;
    }
    &-tag-module__icon-container {
      height: @tagModuleIconContainerLength;
      width: @tagModuleIconContainerLength;
      overflow: hidden;
      border-radius: 50%;
    }
    &-tag-module__icon {
      display: inline-block !important;
    }
    &-tag-module__name {
      font-weight: bold;
      color: #666;
    }
  }
</style>
