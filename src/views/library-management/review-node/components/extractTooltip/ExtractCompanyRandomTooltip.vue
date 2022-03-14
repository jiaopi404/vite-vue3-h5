<template>
  <div :class="prefixCls">
    <p :class="`${prefixCls}-paragraph`"
      >1、招标公司随机自动抽取：添加抽取条件，输入公司经营范围“关键字”，抽取公司个数为1。条件添加后点击“开始抽取”系统随机进行抽取。抽取过程中需等待抽取记录中被抽取的人回复短信“参与/不参与”。“参与”则设为抽取完成，“不参与”则继续抽取。添加条件后不允许修改。</p
    >
    <p :class="`${prefixCls}-paragraph`"
      >2、若添加的抽取条件中没有抽取到符合条件的招标公司时删除条件重新添加。</p
    >
    <p :class="`${prefixCls}-paragraph`"
      >3、抽取招标公司回复“参与/不参与”则不再发送短信；抽取人“未回复”则在{{
        sysTemplate.replyEffectiveTime
      }}分钟后再次给抽取人继续发送短信通知，发送{{
        sysTemplate.sendFrequency
      }}次短信仍未回复，系统视为“不参与”；</p
    >
    <!-- <p :class="`${prefixCls}-paragraph`">4、若设为抽取完成后，不可修改抽取的招标公司。</p> -->
    <!-- 4、若第一次抽取的人数等于实际参与人数时可发起评审；若抽取的人数小于第一次抽取的人数则继续抽取； -->
  </div>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useConfigStore } from '/@/store/modules/config';

  const { prefixCls } = useDesign('extract-company-random-tooltip');

  const configStore = useConfigStore();

  const sysTemplate = configStore.GET_SYS_TEMPLATE;
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-extract-company-random-tooltip';
</style>
