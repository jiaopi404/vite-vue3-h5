import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';

const columns = (): BasicColumn[] => [
  {
    title: '供应商名称',
    dataIndex: 'registeredSupplier.successfulSupplier.name',
    width: 200,
  },
  {
    title: '供应商手机号',
    dataIndex: 'mobile',
    width: 100,
    format: (_text, record) => {
      const mobile = getSecretMobile(record?.registeredSupplier?.mobile);
      return mobile;
    },
  },
  {
    title: '报价金额',
    dataIndex: 'quotedAmount',
    width: 120,
    format: (_text, record) => {
      return (
        record?.quotedAmount +
        (record?.bidSection?.project?.currencyType?.code === '1'
          ? '元'
          : record?.bidSection?.project?.currencyType?.name)
      );
    },
  },
  {
    title: '是否无效报价',
    dataIndex: 'invalidQuotation',
    width: 100,
    format: (_text, record) => {
      return record?.invalidQuotation === 0 ? null : '是';
    },
  },
  {
    title: '推荐中标',
    dataIndex: 'registrationInstructions1',
    width: 100,
    slots: { customRender: 'registrationInstructions1' },
  },
  {
    title: '第二候选',
    dataIndex: 'registrationInstructions2',
    width: 100,
    slots: { customRender: 'registrationInstructions2' },
  },
  {
    title: '第三候选',
    dataIndex: 'registrationInstructions3',
    width: 100,
    slots: { customRender: 'registrationInstructions3' },
  },
];
// 抽屉
const formSchema = (): FormSchema[] => {
  return [
    {
      field: 'reviewOpinion',
      label: '评审意见',
      component: 'InputTextArea',
      required: true,
      labelWidth: 120,
      componentProps: {
        placeholder: '最大可输入5000个字符',
        autoSize: { minRows: 8, maxRows: 12 },
        showCount: true,
        maxlength: 5000,
      },
    },
  ];
};
export { columns, formSchema };
