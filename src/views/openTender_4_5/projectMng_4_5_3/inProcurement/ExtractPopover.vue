<template>
  <Popover
    :title="popoverTitle"
    trigger="click"
    :overlayClassName="prefixCls"
    v-model:visible="visibleRef"
    @visible-change="visibleChangeHandler"
    :align="{ offset: [0, 0] }"
  >
    <template #content>
      <AddReviewNode ref="reviewNodeRef" style="width: 110px" />
      <div class="flex items-center justify-end">
        <Button
          @click="handleAbortion"
          size="small"
          class="mr-1"
          type="error"
          v-if="ifShowAbortionBtnComputed"
          >作废</Button
        >
        <Button @click="handleSubmit" size="small" type="primary">保存</Button></div
      >
    </template>
    <Button :disabled="disabled" v-show="ifShow" type="link" size="small">抽取</Button>
  </Popover>
</template>

<script lang="ts" setup>
  import { useDesign } from '/@/hooks/web/useDesign';
  import AddReviewNode from '/@/views/library-management/review-node/components/addReviewNode/AddReviewNode.vue';
  import {
    useReviewNode,
    invalidateReviewNode,
  } from '/@/views/purchaseDeclare_4_4/pendingProject_4_4_5/toProcessed/components/reviewNode.mixin';
  import { computed, nextTick, ref, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Popover } from 'ant-design-vue';
  import { Button } from '/@/components/Button';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getCusConfirmTip } from '/@/enums/messageEnum';
  import { delProReviewNodeById } from '/@/api/review-node/proReviewNode';
  import { saveProAcceptance } from '/@/api/acceptanceManagement/acceptanceManagementApi';

  const { prefixCls } = useDesign('ext-popover');
  const router = useRouter();
  const { createConfirmPromise } = useMessage();

  const emit = defineEmits(['extract-complete']);
  const props = defineProps({
    id: {
      type: Number as PropType<number>,
    },
    popoverTitle: {
      type: String as PropType<string>,
      default: '抽取招标公司',
    },
    node: {
      type: Number as PropType<2 | 4>,
    },
    objectName: {
      type: String as PropType<string>,
      default: 'pro_project',
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    ifShow: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  });

  // BLOCK: state
  const visibleRef = ref<boolean>(false);
  const idRef = ref<Nullable<number>>(null);

  const { reviewNode, reviewNodeConfirm, reviewNodeInit, reviewNodeRef, reviewNodeReset } =
    useReviewNode(idRef, props.node ?? 3, props.objectName);

  // BLOCK: popover
  const initPopover = async () => {
    idRef.value = props.id ?? null;
    // changeLoading(true);
    await reviewNodeInit();
    // changeLoading(false);
  };

  const handleSubmit = async () => {
    // changeOkLoading(true);
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

        // changeOkLoading(false);
        return;
      }
      // closeDrawer();
      closePopover();
      emit('extract-complete');
    } finally {
      // changeOkLoading(false);
    }
  };

  const visibleChangeHandler = (visible) => {
    console.log('visible changed: ', visible);
    if (!visible) {
      closeHandler();
    } else {
      nextTick(() => {
        initPopover();
      });
    }
  };

  const closePopover = () => {
    visibleRef.value = false;
  };

  const closeHandler = () => {
    setTimeout(() => {
      reviewNodeReset();
      idRef.value = null;
    }, 300);
  };

  // 废弃抽取
  const handleAbortion = async () => {
    // await createConfirmPromise({
    //   content: getCusConfirmTip('作废'),
    // });
    // await delProReviewNodeById(reviewNode.value?.id);
    const ifAborted = await invalidateReviewNode(reviewNode);
    if (ifAborted) {
      closePopover();
      emit('extract-complete');
    }
  };

  const ifShowAbortionBtnComputed = computed(() => {
    // node = 4, 只有已完成可以作废;
    return (
      reviewNode.value &&
      reviewNode.value?.ifReview &&
      reviewNode.value?.statusId === 3 &&
      reviewNode.value?.node === 4
    );
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-ext-popover';
</style>

<style lang="less">
  @prefix-cls: ~'@{namespace}-ext-popover';
  .@{prefix-cls} {
    .ant-popover-title {
      min-width: 140px;
    }
  }
</style>
