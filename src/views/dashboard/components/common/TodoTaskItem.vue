<template>
  <div
    :class="prefixCls"
    class="m-2 overflow-hidden border border-gray-100 rounded-lg shadow-xl border-radius"
  >
    <div :class="`${prefixCls}-header`" class="flex justify-between">
      <div
        :class="`${prefixCls}-code`"
        class="px-2 py-1 truncate rounded-br-lg bg-blue-50 lx-color--primary"
        >{{ process.processObjectCode }}</div
      >
      <div :class="`${prefixCls}-depname`" class="px-2 py-1 truncate">{{ process.addDepName }}</div>
    </div>
    <div :class="`${prefixCls}-body`" class="py-2 mx-2 text-lg font-bold border-b-1">
      <!-- <div :class="`${prefixCls}-title`">{{ process.processObjectName }}</div> -->
      <div :class="`${prefixCls}-title`" class="px-3" ref="titleRef"></div>
      <div :class="`${prefixCls}-amount`" class="px-3">{{
        getAmountWithCurencyName(process.amount, { name: process.currencyTypeName })
      }}</div>
    </div>
    <div :class="`${prefixCls}-footer`" class="flex justify-between px-3 py-2 mx-2">
      <div :class="`${prefixCls}-date`">
        <Icon icon="ant-design:calendar-twotone" />
        {{ formatToDate(process.addDateTime) }}
      </div>
      <div :class="`${prefixCls}-operation`" class="flex items-center">
        <div
          :class="`${prefixCls}-operation-postpone`"
          class="px-2 cursor-pointer lx-color--warning border-r-1"
          v-if="!ifPostpone"
          @click="$emit('click:postpone')"
          >暂缓</div
        >
        <div
          :class="`${prefixCls}-operation-audit`"
          class="px-2 cursor-pointer lx-color--primary"
          @click="$emit('click:audit')"
          >审核</div
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ProcessAlreadyDoneI, ProcessWaitDealI } from '/#/business';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { formatToDate } from '/@/utils/dateUtil';
  import { lxTableColumnIndexProcessObjectNameRender } from '/@/components/LxComponents';
  import { onMounted, ref, render, createVNode } from 'vue';
  import Icon from '/@/components/Icon/src/Icon.vue';
  import { getAmountWithCurencyName } from '/@/utils/commonServe/businessUtil';

  const { prefixCls } = useDesign('todo-task-item');

  const titleRef = ref<any>(null);

  const props = defineProps({
    process: {
      type: Object as PropType<ProcessWaitDealI | ProcessAlreadyDoneI>,
      required: true,
    },
    // 是否顺延 card
    ifPostpone: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  });

  defineEmits(['click:postpone', 'click:audit']);

  onMounted(() => {
    // 动态渲染
    const instance = createVNode(lxTableColumnIndexProcessObjectNameRender(props.process), {});
    render(instance, titleRef.value);
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-todo-task-item';

  .@{prefix-cls} {
    width: 300px;
    &-header {
    }

    &-code,
    &-depname {
      max-width: 130px;
    }
  }
</style>
