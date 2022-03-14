<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    showFooter
    :wrapClassName="prefixCls"
    title="抽取专家"
    width="440"
    @ok="handleSubmit"
    @close="closeHandler"
  >
    <AddReviewNode ref="reviewNodeRef" />
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import AddReviewNode from '/@/views/library-management/review-node/components/addReviewNode/AddReviewNode.vue';
  import { useReviewNode } from '/@/views/purchaseDeclare_4_4/pendingProject_4_4_5/toProcessed/components/reviewNode.mixin';
  import { ref, unref } from 'vue';
  import { useRouter } from 'vue-router';

  const { prefixCls } = useDesign('ext-expert-drawer');
  const router = useRouter();

  const emit = defineEmits(['extract-complete']);

  // BLOCK: state
  const bidSectionId = ref<Nullable<number>>(null); // 节点3 为 专家抽取

  const { reviewNode, reviewNodeConfirm, reviewNodeInit, reviewNodeRef, reviewNodeReset } =
    useReviewNode(bidSectionId, 3, 'pro_bidSection');

  // BLOCK: drawer inner
  const [registerDrawer, { closeDrawer, changeOkLoading, changeLoading }] = useDrawerInner(
    async (data) => {
      bidSectionId.value = data.id;
      changeLoading(true);
      await reviewNodeInit();
      changeLoading(false);
    },
  );

  const handleSubmit = async () => {
    changeOkLoading(true);
    try {
      // 同意
      // 更新评审节点 （新创建，或者回显的）
      await reviewNodeConfirm();
      if (unref(reviewNode) && unref(reviewNode)?.ifReview) {
        // 是评审，则会建立 或 拉取评审节点
        // 1 保存上面修改的信息
        // 2. 跳转到抽取页面
        const reviewNodeId = unref(reviewNode)?.id;
        router.push({
          path: '/review-node',
          query: {
            id: reviewNodeId,
          },
        });

        changeOkLoading(false);
        return;
      }
      closeDrawer();
      emit('extract-complete');
    } finally {
      changeOkLoading(false);
    }
  };

  const closeHandler = () => {
    reviewNodeReset();
    bidSectionId.value = null;
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-ext-expert-drawer';
</style>
