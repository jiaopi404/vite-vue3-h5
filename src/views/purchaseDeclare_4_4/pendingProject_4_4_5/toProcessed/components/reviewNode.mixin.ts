import { Ref, ref, unref } from 'vue';
import {
  ReviewNodeI,
  AddReviewNodeActionType,
} from '/@/views/library-management/review-node/typing';

import { useMessage } from '/@/hooks/web/useMessage';
import { getCusConfirmTip } from '/@/enums/messageEnum';
import { getReviewNodeByProjectNode, invalidateById } from '/@/api/review-node/proReviewNode';

export const useReviewNode = (proId: Ref<any>, node: number, objectName = 'pro_project') => {
  // 评审节点数据
  const reviewNode = ref<Nullable<ReviewNodeI>>(null);

  // 评审节点组件 ref
  const reviewNodeRef = ref<Nullable<AddReviewNodeActionType>>(null);

  // 初始化，打开弹窗调用
  const reviewNodeInit = async () => {
    reviewNode.value =
      (await getReviewNodeRefInstance()?.init({
        objectId: proId.value,
        objectName,
        node,
      })) ?? null;
  };

  // 确定方法，点击确定按钮，更新评审节点信息
  const reviewNodeConfirm = async () => {
    reviewNode.value = await getReviewNodeRefInstance()?.confirm();
  };

  // 重置方法，关闭弹窗之前调用
  const reviewNodeReset = () => {
    getReviewNodeRefInstance()?.reset();
    reviewNode.value = null;
  };

  function getReviewNodeRefInstance() {
    if (unref(reviewNodeRef)) {
      return unref(reviewNodeRef);
    } else {
      throw new Error('获取评审节节点实例失败');
    }
  }

  return {
    reviewNode,
    reviewNodeRef,
    reviewNodeInit,
    reviewNodeConfirm,
    reviewNodeReset,
  };
};

/**
 * 作废评审结点
 * @param reviewNodeRef 评审结点
 * @param proInfo 项目 / 标段信息
 * @returns 是否已作废
 */
export const invalidateReviewNode = async (
  reviewNodeRef: Nullable<Ref<Nullable<ReviewNodeI>>>,
  proInfo?: Nullable<{ objectId: number; objectName: string; node: number }>,
): Promise<boolean> => {
  const { createConfirmPromise, createMessage } = useMessage();
  try {
    if (reviewNodeRef) {
      await createConfirmPromise({
        content: getCusConfirmTip('作废'),
      });
      await invalidateById(reviewNodeRef.value?.id); // 作废
    }

    if (proInfo) {
      const reviewNode = await getReviewNodeByProjectNode({
        objectId: proInfo.objectId,
        objectName: proInfo.objectName,
        node: proInfo.node,
      });
      if (!reviewNode) {
        // 无节点
        createMessage.error('该项目当前阶段未抽取！');
        return Promise.resolve(false);
      } else {
        await createConfirmPromise({
          content: getCusConfirmTip('作废'),
        });
        await invalidateById(reviewNode.id); // 作废
      }
    }
  } catch (err) {
    return Promise.resolve(false);
  }

  return Promise.resolve(true);
};
