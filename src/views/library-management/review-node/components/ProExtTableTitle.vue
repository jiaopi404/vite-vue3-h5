<template>
  <div :class="prefixCls">
    <span :class="`${prefixCls}-title`">{{ title }}</span>
    <span v-if="ifShowSubTitle" :class="`${prefixCls}-sub-title`">采购代理人：{{ subTitle }}</span>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { ReviewNodeI } from '../typing';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';

  const props = defineProps({
    reviewNode: {
      type: Object as PropType<ReviewNodeI>,
    },
    title: {
      type: String as PropType<string>,
      default: '',
    },
  });

  const { prefixCls } = useDesign('pro-ext-table-title');
  console.log('pre fix cls is: ', prefixCls);

  const ifShowSubTitle = computed(() => {
    return !!props.reviewNode?.purchaseAgent;
  });

  const formatter = getPersonNameFormatter();
  const subTitle = computed(() => {
    return formatter(props.reviewNode?.purchaseAgent);
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-pro-ext-table-title';

  .@{prefix-cls} {
    &-title {
      padding-left: 5px;
      font-size: 16px;
    }
    &-sub-title {
      padding-left: 15px;
    }
  }
</style>
