import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';

const columns = (): BasicColumn[] => [
  {
    title: '供应商名称',
    dataIndex: 'successfulSupplier',
    width: 120,
    format: (_text, record) => {
      return record.successfulSupplier;
    },
  },
  {
    title: '供应商手机号',
    dataIndex: 'mobile',
    width: 100,
    format: (_text, record) => {
      const mobile = getSecretMobile(record?.mobile);
      return mobile;
    },
  },

  {
    title: '结果',
    dataIndex: 'result',
    width: 140,
    format: (_text, record) => {
      if (record.result === 1) {
        return '推荐中标';
      } else if (record.result === 2) {
        return '第二候选人';
      } else if (record.result === 3) {
        return '第三候选人';
      } else {
        return;
      }
    },
  },
];
// 抽屉
const formSchema = (): FormSchema[] => {
  return [
    {
      field: 'reviewOpinion',
      label: '评审意见',
      component: 'InputTextArea',
      labelWidth: 120,
      componentProps: {
        placeholder: '最大可输入5000个字符',
        autoSize: { minRows: 8, maxRows: 12 },
        showCount: true,
        maxlength: 5000,
      },
      dynamicDisabled: () => {
        return true;
      },
    },
  ];
};
export { columns, formSchema };
