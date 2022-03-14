<template>
  <div
    :class="prefixCls"
    class="flex items-center justify-between mt-1 mb-1 line-with-little-point"
  >
    <div
      :class="`${prefixCls}-notice-item_name`"
      class="flex-1 truncate cursor-pointer content-text"
      :title="notice.title"
      @click="emit('preview-notice', notice)"
      >{{ notice.title }}</div
    >
    <div :class="`${prefixCls}-notice-item_time`" class="flex-none"
      >【{{ formatToDate(notice.updateDateTime) }}】</div
    >
  </div>
</template>

<script lang="ts" setup>
  import { NoticeI } from '/#/business';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { formatToDate } from '/@/utils/dateUtil';

  const { prefixCls } = useDesign('notice-item-dashboard');

  defineProps({
    notice: {
      type: Object as PropType<NoticeI>,
      required: true,
    },
  });

  const emit = defineEmits(['preview-notice']);
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-notice-item-dashboard';

  @import './common.less';
</style>
