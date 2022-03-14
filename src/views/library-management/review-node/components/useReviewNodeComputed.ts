import { ProExtConditionI, ReviewNodeI } from './../typing';
import { computed, ComputedRef, Ref } from 'vue';

interface ReviewNodeExtractComputedI {
  ifWaitExtracting: ComputedRef<boolean>;
  // 是否已完成状态 （状态 = 3）
  ifCompleted: ComputedRef<boolean>;
  ifCompletedAndReviewNodeNotEqual3: ComputedRef<boolean>;
  // 是否抽取中状态 1
  ifExtracting: ComputedRef<boolean>;
  // 是否已抽取状态; 2
  ifHasExtracted: ComputedRef<boolean>;
  // 是否在新增抽取条件
  ifAddProExtCond: ComputedRef<boolean>;
  // 是否在 编辑抽取条件
  ifEditProExtCond: ComputedRef<boolean>;
}

/**
 * 评审结点派生的计算属性？
 * @param reviewNode 评审结点对象
 * @param reviewNode 评审结点对象
 * @returns { reviewNodeComputed }
 */
export function useReviewNodeComputed(
  reviewNode: ComputedRef<ReviewNodeI | undefined>,
  proExtCondition?: Ref<Nullable<ProExtConditionI>>,
) {
  const ifWaitExtracting = computed<boolean>(() => {
    return reviewNode.value?.statusId === 0;
  });
  /**
   * 是否已完成状态 （状态 = 3）
   */
  const ifCompleted = computed<boolean>(() => {
    return reviewNode.value?.statusId === 3;
  });

  /**
   * 已完成 且 评审状态不等于 3
   */
  const ifCompletedAndReviewNodeNotEqual3 = computed<boolean>(() => {
    return reviewNode.value?.statusId === 3 && reviewNode.value?.node !== 3;
  });

  /**
   * 是否抽取中状态
   */
  const ifExtracting = computed<boolean>(() => {
    return reviewNode.value?.statusId === 1;
  });

  /**
   * 是否已抽取状态;
   */
  const ifHasExtracted = computed<boolean>(() => {
    return reviewNode.value?.statusId === 2;
  });

  const ifAddProExtCond = computed<boolean>(() => {
    return !proExtCondition?.value?.id;
  });

  const ifEditProExtCond = computed<boolean>(() => {
    return !ifAddProExtCond.value;
  });

  return {
    ifWaitExtracting,
    ifCompleted,
    ifExtracting,
    ifHasExtracted,
    ifAddProExtCond,
    ifEditProExtCond,
    ifCompletedAndReviewNodeNotEqual3,
  } as ReviewNodeExtractComputedI;
}
