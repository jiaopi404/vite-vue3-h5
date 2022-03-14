<template>
  <div
    :class="prefixCls"
    class="flex items-center justify-between mt-1 mb-1 line-with-little-point"
  >
    <div
      :class="`${prefixCls}-download-item_name`"
      class="flex-1 truncate cursor-pointer content-text"
      :title="commonFile.name"
      @click="previewFile({ name: commonFile.name, url: commonFile.attach })"
      >{{ commonFile.name }}</div
    >
    <div :class="`${prefixCls}-download-item_time`" class="flex-none"
      >【{{ formatToDate(commonFile.addDateTime) }}】</div
    >
  </div>
</template>

<script lang="ts" setup>
  import { CommonFileI } from '/#/business';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { formatToDate } from '/@/utils/dateUtil';
  import { previewFile } from '/@/utils/commonServe/businessUtil';

  const { prefixCls } = useDesign('download-item-dashboard');

  defineProps({
    commonFile: {
      type: Object as PropType<CommonFileI>,
      required: true,
    },
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-download-item-dashboard';

  @import './common.less';
</style>
