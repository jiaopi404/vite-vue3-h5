<template>
  <Card :class="prefixCls" size="small" v-bind="$attrs">
    <template #extra>
      <div class="flex justify-start items-center">
        <slot name="extraPrefix"></slot>
        <Icon
          v-if="isExtra"
          title="查看更多"
          icon="ant-design:ellipsis-outlined"
          class="cursor-pointer"
          @click="viewMore"
        />
      </div>
    </template>
    <template #title>
      <div :class="`${prefixCls}-title-container`" class="flex justify-start items-center">
        <span
          :class="`${prefixCls}-icon-container`"
          class="flex justify-center items-center"
          :style="{ backgroundColor: titleIconColor }"
        >
          <Icon :class="`${prefixCls}-icon`" :icon="titleIcon" color="white" />
        </span>
        <span :class="`${prefixCls}-title`">{{ title }}</span>
      </div>
    </template>
    <slot></slot>
  </Card>
</template>

<script lang="ts" setup>
  import { Card } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import Icon from '/@/components/Icon';
  import { ThemeColorEnum } from '/@/enums/themeColorEnum';

  const { prefixCls } = useDesign('index-card');

  const emit = defineEmits(['view-more']);

  defineProps({
    title: {
      type: String as PropType<string>,
      default: '标题',
    },
    titleIcon: {
      type: String as PropType<string>,
      default: 'ant-design:appstore-outlined',
    },
    titleIconColor: {
      type: String as PropType<ThemeColorEnum>,
      default: '#0960bd',
    },
    isExtra: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  });

  const viewMore = () => {
    emit('view-more');
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-index-card';

  .@{prefix-cls} {
    // width: 100%;
    &-title {
      font-size: 14px;
      font-weight: bold;
      margin-left: 5px;
    }
    &-icon-container {
      height: 22px;
      width: 22px;
      border-radius: 50%;
      overflow: hidden;
    }
  }
</style>
