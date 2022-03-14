<template>
  <Card :class="prefixCls" size="small" :loading="loadingRef">
    <div :class="`${prefixCls}-content-container`" class="flex justify-between items-center">
      <div :class="`${prefixCls}-left`">
        <div :class="`${prefixCls}-left-container`">
          <div :class="`${prefixCls}-per-name`" class="text-xl">Hi, {{ perName }}</div>
          <div :class="`${prefixCls}-purchase-plan`" v-if="ifShowPurchasePlan">
            <span :class="`${prefixCls}-pro-length`" class="lx-color--danger"
              >今日计划采购{{ proLengthRef }}个项目</span
            >
            <span
              :class="`${prefixCls}-pro-length`"
              class="lx-color--primary cursor-pointer ml-2"
              @click="toPurchaseCalender"
            >
              <span>查看采购项目</span>
              <Icon icon="ant-design:link-outlined" size="14" />
            </span>
          </div>
        </div>
      </div>
      <!-- 封装组件 -->
      <div :class="`${prefixCls}-right`">
        <HeaderClockVue />
      </div>
    </div>
  </Card>
</template>

<script lang="ts" setup>
  import { useIntervalFn } from '@vueuse/core';
  import { Card } from 'ant-design-vue';
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import HeaderClockVue from './HeaderClock.vue';
  import { useToPurchaseCalenderEventBusEmitter } from './indexHelper';
  import { getYearMonthDayProCount } from '/@/api/purchase/purchaseCalendar';
  import Icon from '/@/components/Icon';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useUserStore } from '/@/store/modules/user';

  const { prefixCls } = useDesign('greeting-header-card');
  const userStore = useUserStore();
  const { emitToPurchaseCalenderEventBus } = useToPurchaseCalenderEventBusEmitter();

  const perName = computed(() => {
    return userStore.getUserInfo?.perName ?? '用户';
  });

  const currentTime = ref<number>(+new Date());
  const loadingRef = ref<boolean>(false);
  const proLengthRef = ref<number>(0);

  const { pause, isActive } = useIntervalFn(() => {
    currentTime.value += 1000;
  }, 1000);

  const ifShowPurchasePlan = computed(() => {
    // 1。 当前登陆人是主管  且 所在部门是采购组织部门
    const userInfo = userStore.getUserInfo;
    return userInfo.ifDepHead && userInfo.department?.ifPurOrg;
  });

  onMounted(async () => {
    loadingRef.value = true;
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const payload = {
        year: year,
        month: month,
      };
      const res = await getYearMonthDayProCount(payload);
      // 找到当前日期的采购计划
      const todayPlan = res.find((item) => item.day === day + '');
      if (todayPlan) {
        proLengthRef.value = todayPlan.count; // 计数
      }
    } finally {
      loadingRef.value = false;
    }
  });

  onUnmounted(() => {
    isActive.value && pause();
  });

  const toPurchaseCalender = () => {
    emitToPurchaseCalenderEventBus();
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-greeting-header-card';

  .@{prefix-cls} {
  }
</style>
