import { Ref } from 'vue';
import { FormSchema } from '/@/components/Form';

const ADD_REVIEW_NODE_FORM_ITEM_COL_SPAN = 22;

/**
 * 获取 schema
 * @param ifExpertOnly 是否只抽取专家
 * @returns
 */
export const getAddReviewNodeFormSchema = (): FormSchema[] => {
  const getReviewNodeInfoIfShow = ({ model }) => {
    return !!model.ifReview;
  };
  // const getReviewNodeInfoDisabled = () => false;
  return [
    {
      field: 'ifReview',
      label: '是否论证',
      component: 'RadioGroup',
      colProps: { span: ADD_REVIEW_NODE_FORM_ITEM_COL_SPAN },
      required: true,
      componentProps: {
        options: [
          { value: 1, label: '是' },
          { value: 0, label: '否' },
        ],
      },
      defaultValue: 0,
      // dynamicDisabled: getReviewNodeInfoDisabled,
    },
    {
      field: 'extractType',
      label: '抽取类型',
      component: 'RadioGroup',
      colProps: { span: ADD_REVIEW_NODE_FORM_ITEM_COL_SPAN },
      required: true,
      componentProps: {
        options: [
          { value: 0, label: '专家' },
          { value: 1, label: '招标公司' },
        ],
      },
      defaultValue: 0,
      ifShow: getReviewNodeInfoIfShow,
      // dynamicDisabled: getReviewNodeInfoDisabled,
    },
    {
      field: 'extractMethod',
      label: '抽取方式',
      component: 'RadioGroup',
      colProps: { span: ADD_REVIEW_NODE_FORM_ITEM_COL_SPAN },
      required: true,
      componentProps: {
        options: [
          { value: 1, label: '随机自动抽取' },
          { value: 0, label: '定向手动抽取' },
        ],
      },
      defaultValue: 1,
      ifShow: getReviewNodeInfoIfShow,
      // dynamicDisabled: getReviewNodeInfoDisabled,
    },
  ];
};
