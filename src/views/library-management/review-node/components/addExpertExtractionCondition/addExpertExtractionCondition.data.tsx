import { ComputedRef } from 'vue';
import { FormSchema } from '/@/components/Form';

export const addExpertExtractionConditionFormSchema = (
  ifAddProExtCond: ComputedRef<boolean>,
  ifEditProExtCond: ComputedRef<boolean>,
): FormSchema[] => [
  {
    field: 'researchAreaCategoryId',
    component: 'Select',
    label: '专家类型',
    slot: 'researchAreaCategory',
    colProps: {
      span: 6,
    },
    rules: [{ required: true, message: '请选择专家类型', trigger: 'change', type: 'number' }],
  },
  {
    field: 'researchAreaId',
    component: 'TreeSelect',
    label: '专业类别',
    slot: 'researchArea',
    colProps: {
      span: 8,
    },
    rules: [
      {
        required: true,
        trigger: 'change',
        type: 'array',
        message: '请选择专业类别',
      },
    ],
  },
  {
    field: 'currentPerCount',
    label: '当前人数',
    component: 'Input',
    colProps: { span: 4 },
    slot: 'currentPerCount',
    // render: ({ field, model }) => {
    //   return <span>{model[field] ? model[field] : 0}人</span>;
    // },
  },
  {
    field: 'userNumber',
    label: '抽取人数',
    component: 'InputNumber',
    slot: 'userNumber',
    colProps: { span: 6 },
    // TODO: Del
    // componentProps: ({ formModel }) => {
    //   console.log('form model is: ', formModel);
    //   return {
    //     max: formModel.currentPerCount || 1000000000,
    //     precision: 0,
    //     min: 0,
    //     placeholder: '请输入抽取人数',
    //   };
    // },
    rules: [
      { required: true, message: '请输入抽取人数', trigger: 'blur' },
      {
        validator: async (_, value) => {
          if (ifAddProExtCond.value) {
            if (!value) {
              return Promise.reject('请输入抽取人数');
            }
          } else if (ifEditProExtCond.value) {
            if (value !== 0 && !value) {
              return Promise.reject('请输入抽取人数');
            }
          }
          return Promise.resolve();
        },
        trigger: 'blur',
      },
    ],
    // dynamicDisabled: ({ model }) => {
    //   return !model['researchAreaCategoryId'] || !model['researchAreaId'];
    // },
  },
];
