<template>
  <IndexCardVue
    :class="prefixCls"
    title="系统模块"
    :loading="loadingRef"
    :is-extra="false"
    :bodyStyle="{ padding: '12px' }"
    v-if="ifIndexDefault"
  >
    <Card.Grid
      :class="`${prefixCls}-tag-module`"
      class="flex flex-col items-center justify-center p-1 m-1 cursor-pointer"
      v-for="tagModule in tagModuleListRef"
      :key="tagModule.id"
      @click="clickHandlerTagModule(tagModule)"
    >
      <div
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
      <div :class="`${prefixCls}-tag-module__name`">{{ tagModule.name }}</div>
    </Card.Grid>
  </IndexCardVue>
  <IndexCardVue
    :class="prefixCls"
    title="系统模块"
    :loading="loadingRef"
    :is-extra="false"
    :bodyStyle="{ padding: '12px' }"
    v-else
  >
    <Card.Grid
      :class="styleTarget"
      class="flex flex-col items-center justify-center p-1 m-1 cursor-pointer"
      v-for="tagModule in tagModuleListRef"
      :key="tagModule.id"
      @click="clickHandlerTagModule(tagModule)"
    >
      <div
        :class="containerStyel"
        class="flex items-center justify-center mb-3"
        :style="{
          backgroundColor: tagModule.meta.color,
        }"
      >
        <Icon
          :class="`${prefixCls}-tag-module__icon`"
          :icon="tagModule.meta.icon"
          color="#fff"
          :size="userInfo.ifDepHead ? 40 : 25"
        />
      </div>
      <div :class="`${prefixCls}-tag-module__name`">{{ tagModule.name }}</div>
    </Card.Grid>
  </IndexCardVue>
</template>

<script lang="ts" setup>
  import { onMounted, ref, nextTick } from 'vue';
  import { DictionaryI } from '/#/business';
  import { getAuthorityTagModule } from '/@/api/sys/menu';
  import { useDesign } from '/@/hooks/web/useDesign';
  import IndexCardVue from './IndexCard.vue';
  import { Card } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { useBusinessStore } from '/@/store/modules/business';
  import { useRouter } from 'vue-router';
  import {
    useToPurchaseCalenderEventBusHandler,
    useTmpSaveTagModuleEventBusHandler,
  } from './indexHelper';
  import { MenuFullPathEnum, TagModuleNameEnum } from '/@/enums/menuFullPathEnum';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import { useUserStore } from '/@/store/modules/user';
  import { useConfigStoreWithOut } from '/@/store/modules/config';
  const { prefixCls } = useDesign('tag-module-card');
  const businessStore = useBusinessStore();
  const router = useRouter();

  const tagModuleListRef = ref<DictionaryI[]>([]);
  const loadingRef = ref<boolean>(false);
  const userInfo = useUserStore().getUserInfo;

  onMounted(async () => {
    businessStore.RESET_TAG_MODULE_INFO(); // 重置模块信息
    loadingRef.value = true;
    try {
      const res = await getAuthorityTagModule({ menuType: 1 });
      tagModuleListRef.value = [];
      if (userInfo.approveStatus === 0) {
        res.map((item) => {
          if (item.name === '个人中心') {
            try {
              item.meta = JSON.parse(item.code);
            } catch (err) {
              console.log('json.parse 错误', item);
              item.meta = {};
            }
            tagModuleListRef.value.push(item);
          }
        });
      } else {
        tagModuleListRef.value = res.map((item) => {
          try {
            item.meta = JSON.parse(item.code);
          } catch (err) {
            console.log('json.parse 错误', item);
            item.meta = {};
          }
          return item;
        });
      }
    } finally {
      loadingRef.value = false;
    }
  });
  const tabStore = useMultipleTabStore();
  const clickHandlerTagModule = (tagModule: DictionaryI) => {
    businessStore.SET_TAG_MODULE_INFO(tagModule);
    router.push({
      path: tagModule.meta.redirect,
    });
    tabStore.resetState();
  };

  // event bus 1
  useToPurchaseCalenderEventBusHandler(() => {
    // 找到采购计划, 设为模块, 跳转到采购日历
    // 1. 是否没有采购计划
    const purchasePlanModule = tagModuleListRef.value.find((tagModule) => {
      return tagModule.meta.name === TagModuleNameEnum.PURCHASE_PLAN;
    });
    if (!purchasePlanModule) {
      throw new Error('没有此模块的权限');
    }
    businessStore.SET_TAG_MODULE_INFO(purchasePlanModule); // 设置模块为采购计划
    // 2. 是否没有采购日历的菜单; 如果没有菜单权限, 会跳转 404
    router.push({
      // 跳转到采购日历
      path: MenuFullPathEnum.PURCHASE_PLAN_PURCHASE_CALENDER,
    });
  });

  // event bus 3
  useTmpSaveTagModuleEventBusHandler((tagModuleId) => {
    const tagModule = tagModuleListRef.value.find((tagModule) => {
      return tagModule.id === tagModuleId;
    });
    if (!tagModule) {
      throw new Error('没有此模块的权限');
    }
    businessStore.SET_TAG_MODULE_INFO(tagModule); // 设置模块
  });
  const ifIndexDefault = useConfigStoreWithOut().GET_CONFIG_BASEINFO.ifIndexDefault;
  // 根据admin的角色是否为组织部门主管样式切换
  const styleTarget = userInfo.ifDepHead
    ? `${prefixCls}-tag-moduleRoleStyle`
    : `${prefixCls}-tag-moduleRole`;
  const containerStyel = userInfo.ifDepHead
    ? `${prefixCls}-tag-module__icon-containerStyel`
    : `${prefixCls}-tag-module__icon-container_Switch`;
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-tag-module-card';
  @tagModuleIconContainerLength: 45px;
  @borserTagModuleIconContainerLength: 10vh;
  @borserTagModuleIconContainerSwitch: 58px;

  .@{prefix-cls} {
    &-tag-module {
      width: calc((100% - 48px) / 6);
      text-align: center;
      padding: 12px;
    }
    &-tag-moduleRoleStyle {
      width: calc((100% - 48px) / 4);
      text-align: center;
      height: 23vh;
    }
    &-tag-moduleRole {
      width: calc((100% - 48px) / 6);
      text-align: center;
    }
    &-tag-module__icon-container {
      height: @tagModuleIconContainerLength;
      width: @tagModuleIconContainerLength;
      overflow: hidden;
      border-radius: 50%;
    }
    &-tag-module__icon-containerStyel {
      height: @borserTagModuleIconContainerLength;
      width: @borserTagModuleIconContainerLength;
      overflow: hidden;
      border-radius: 50%;
    }
    &-tag-module__icon-container_Switch {
      height: @borserTagModuleIconContainerSwitch;
      width: @borserTagModuleIconContainerSwitch;
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
