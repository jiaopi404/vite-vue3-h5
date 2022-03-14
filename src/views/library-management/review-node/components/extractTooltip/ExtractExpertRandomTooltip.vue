<template>
  <div :class="prefixCls">
    <p :class="`${prefixCls}-paragraph`"
      >1、专家随机自动抽取：添加抽取条件，抽取人数需为单数，至少1人，最多为当前可抽取的人数。条件添加后点击“开始抽取”系统随机进行抽取。抽取过程中需等待抽取记录中被抽取的人全部回复短信“参与/不参与”后，方可继续抽取或者发起评审。添加条件后只允许修改“抽取人数”，一个“专业类别”只能添加一次。</p
    >
    <p :class="`${prefixCls}-paragraph`"
      >2、若添加的抽取条件中无可抽取人时可修改条件中“抽取人数”的值等于实际参与人数的值或者继续添加条件。</p
    >
    <p :class="`${prefixCls}-paragraph`"
      >3、若第一次抽取的人数等于实际参与人数时可设为抽取完成，也可以继续抽取；若抽取的人数小于第一次抽取的人数则继续抽取。</p
    >
    <p :class="`${prefixCls}-paragraph`"
      >4、抽取人回复“参与/不参与”则不再发送短信；抽取人“未回复”则在{{
        sysTemplate.replyEffectiveTime
      }}分钟后再次给抽取人继续发送短信通知，发送{{
        sysTemplate.sendFrequency
      }}次短信仍未回复，系统视为“不参与”。</p
    >
    <!-- <p :class="`${prefixCls}-paragraph`">6、若发起评审后，不可修改评审组的专家。</p> -->
  </div>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useConfigStore } from '/@/store/modules/config';

  const { prefixCls } = useDesign('extract-expert-random-tooltip');

  const configStore = useConfigStore();

  const sysTemplate = configStore.GET_SYS_TEMPLATE;
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-extract-expert-random-tooltip';
</style>
