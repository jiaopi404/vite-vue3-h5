import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { ReviewNodeI } from '/@/views/library-management/review-node/typing';
import { useRouter } from 'vue-router';

// fooKey.ts
import { EventBusListener, useDebounceFn } from '@vueuse/core';
import { deleteProExtractionById, updateReplyStatus } from '/@/api/review-node/proExtraction';
import { CustomMsgEnum, getCusConfirmTip } from '/@/enums/messageEnum';
import { refreshExtractEventBus } from './extraction.eventBus';
import { checkInitiateReview, initiateReview } from '/@/api/review-node/proExtractionConditions';
import { useTabs } from '/@/hooks/web/useTabs';

const { createMessage, createConfirmPromise } = useMessage();

let router;

/**
 * 专家抽取，手动，随机的 mixins
 * @param reviewNode
 */
export function useExpertExtractionMixin(reviewNode?: ReviewNodeI) {
  router = useRouter();
  const reviewLoading = ref<boolean>(false);
  // const hasReviewedTimeout = ref<boolean>(false); // 评审完成之后，提示，之后跳转
  const refreshExtractHandler = ref<Nullable<Function>>(null); // 刷新抽取的 listener 函数

  let unsubscribe: any = null;

  // 监听 event bus 事件
  onMounted(() => {
    const _listener: EventBusListener = useDebounceFn(() => {
      refreshExtractHandler.value?.();
    }, 200);
    unsubscribe = refreshExtractEventBus.on(_listener);
  });

  // 取消监听事件
  onBeforeUnmount(() => {
    unsubscribe?.();
  });

  /**
   * 发起评审
   * @param reviewNodeId 评审结点 id
   * @param reviewNode 评审结点
   */
  const { closeCurrent } = useTabs(router);
  const doReview = async (reviewNode: ReviewNodeI | undefined, callback?: any) => {
    reviewLoading.value = true;
    try {
      let _msgMap = await checkInitiateReview(reviewNode?.id);
      if (_msgMap) {
        const msgList = Object.values(_msgMap);
        if (msgList.length) {
          createMessage.error(msgList[0] + '！');
          throw new Error(msgList[0] + '！');
        }
      } else {
        createMessage.error(getReviewBtnName.value + '失败！');
        throw new Error(getReviewBtnName.value + '失败！');
      }
      await createConfirmPromise({
        title: getCusConfirmTip(getReviewBtnName.value),
      });
      const resOfInitiateReview: any = await initiateReview(reviewNode?.id);
      _msgMap = resOfInitiateReview.data;
      if (_msgMap) {
        if (_msgMap['msg']) {
          // 发起成功
          // 代表发起评审成功
          // hasReviewedTimeout.value = true;
          if (callback) {
            callback();
            reviewLoading.value = true;
            // 刷新一下
            refreshExtractHandler.value?.();
            return;
          }
          const msg =
            getReviewBtnName.value === '抽取完成'
              ? `${getReviewBtnName.value}！正在跳转...`
              : `${getReviewBtnName.value}成功！正在跳转...`;
          createMessage.success(msg);
          closeCurrent();
          router.back(); // 回退 还是替换呢
        } else {
          const msgList = Object.values(_msgMap);
          if (msgList.length) {
            createMessage.error(msgList[0] + '！');
            throw new Error(msgList[0] + '！');
          }
        }
      } else {
        createMessage.error(getReviewBtnName.value + '失败！');
        throw new Error(getReviewBtnName.value + '失败！');
      }
    } finally {
      reviewLoading.value = false;
    }
  };

  // 设为参与
  const setTakePartInExtDetail = async (record) => {
    // let status = record.proExtraction.status;
    await updateReplyStatus(record.proExtraction.id, 2);
    createMessage.success('设置成功');
    refreshExtractHandler.value?.(); // 刷新
  };
  // 删除抽取详情
  const delProExtDetail = async (record) => {
    await createConfirmPromise({
      title: CustomMsgEnum.DEL_CONFIRM_TIP,
    });
    await deleteProExtractionById(record.proExtraction.id);
    createMessage.success(CustomMsgEnum.DEL_SUCCESS);
    refreshExtractHandler.value?.(); // 刷新
  };

  /**
   * 计算属性，获取 评审按钮的名称
   */
  const getReviewBtnName = computed(() => {
    const node = reviewNode?.node;
    let btnName;
    switch (node) {
      case 1:
        btnName = '抽取完成';
        break;
      case 2:
        btnName = '抽取完成';
        break;
      case 3:
        btnName = '发起评审';
        break;
      case 4:
        btnName = '抽取完成';
        break;
      default:
        break;
    }
    return btnName;
  });
  return {
    reviewLoading,
    // hasReviewedTimeout,
    refreshExtractHandler,
    doReview,
    setTakePartInExtDetail,
    delProExtDetail,
    getReviewBtnName,
  };
}
