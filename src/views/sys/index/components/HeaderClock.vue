<template>
  <div :class="prefixCls" class="flex rounded shadow overflow-hidden items-center">
    <div :class="`${prefixCls}-left p-1`">
      <div :class="`${prefixCls}-day`">{{ dateComputedRef.day }}</div>
      <div :class="`${prefixCls}-date`">{{ dateComputedRef.date }}</div>
    </div>
    <div :class="`${prefixCls}-right p-1`" class="text-base font-bold">{{
      dateComputedRef.time
    }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useIntervalFn } from '@vueuse/core';
  import { computed, onUnmounted, ref } from 'vue';
  import { dateUtil, getDayCN } from '/@/utils/dateUtil';

  interface DateObj {
    day: string;
    date: string;
    time: string;
  }

  const { prefixCls } = useDesign('HeaderClock');

  const currentTime = ref<number>(+new Date());

  const dateComputedRef = computed<DateObj>(() => {
    const currentMoment = dateUtil(currentTime.value);
    return {
      day: getDayCN(currentMoment.day()),
      date: currentMoment.format('YYYY年M月D日'),
      time: currentMoment.format('HH:mm'),
    };
  });

  const { pause, isActive } = useIntervalFn(() => {
    currentTime.value += 1000;
  }, 1000);

  onUnmounted(() => {
    isActive.value && pause();
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-HeaderClock';

  .@{prefix-cls} {
    background-color: white;
    &-left {
      background-color: #0084f4;
      color: white;
    }
    &-right {
      color: #0084f4;
    }
  }
</style>
