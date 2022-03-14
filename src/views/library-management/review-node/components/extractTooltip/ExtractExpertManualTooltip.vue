<template>
  <div :class="prefixCls">
    <p :class="`${prefixCls}-paragraph`"
      >1、定向手动抽取：手动选择需要抽取的专家/招标公司，选择完成后点击“发送短信”进行抽取。抽取过程中需等待抽取记录中被抽取的人全部回复短信“参与/不参与”后，方可继续抽取或者设为抽取完成。（注：抽取的专家，需为单数；招标公司只允许抽取一家）；</p
    >
    <p :class="`${prefixCls}-paragraph`"
      >2、抽取人回复“参与/不参与”则不再发送短信；抽取人“未回复”则在{{
        sysTemplate.replyEffectiveTime
      }}分钟后再次给抽取人继续发送短信通知，发送{{
        sysTemplate.sendFrequency
      }}次短信仍未回复，系统视为“不参与”；</p
    >
    <p :class="`${prefixCls}-paragraph`"
      >3、若第一次抽取的人数等于实际参与人数时可设为抽取完成；若抽取的人数小于第一次抽取的人数则继续抽取。</p
    >
    <!-- 4、若第一次抽取的人数等于实际参与人数时可发起评审；若抽取的人数小于第一次抽取的人数则继续抽取； -->
    <!-- <p :class="`${prefixCls}-paragraph`">4、若设为待论证后，不可修改抽取的招标公司。</p> -->
  </div>
</template>

<script lang="ts" setup>
  // 专家 / 公司 共用
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useConfigStore } from '/@/store/modules/config';

  const { prefixCls } = useDesign('extract-expert-manual-tooltip');

  const configStore = useConfigStore();

  const sysTemplate = configStore.GET_SYS_TEMPLATE;
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-extract-expert-manual-tooltip';
</style>
