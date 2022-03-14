import { getDictionaryByParentId } from '/@/api/noticeManagement/noticeManagement';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
const configStore = useConfigStoreWithOut();
export const paymentTableColumns = (): BasicColumn[] => [
  {
    title: '付款方式',
    dataIndex: 'conPaymentMethod.paymentMethod.name',
    width: 150,
    align: 'left',
  },
  {
    title: '付款说明',
    dataIndex: 'conPaymentMethod.paymentExplain',
    width: 150,
    align: 'left',
  },
  {
    title: '付款比例（%）',
    dataIndex: 'conPaymentMethod.proportion',
    width: 150,
    align: 'left',
    format: (_text, record) => {
      return record.conPaymentMethod.proportion + ' %';
    },
  },
  {
    title: '金额',
    dataIndex: 'conPaymentMethod.amount',
    width: 150,
    align: 'left',
  },
];
export const paymentFormSchema = (): FormSchema[] => {
  const conPaymentMethodId =
    configStore.GET_CONFIG.configInfo?.configDictionary?.conPaymentMethodId;
  return [
    {
      field: 'paymenMethod',
      label: '付款方式',
      component: 'Select',
      colProps: { span: 11 },
      componentProps: {
        placeholder: '请选择付款方式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      required: true,
    },
    {
      field: 'proportion',
      label: '付款比例（%）',
      component: 'InputNumber',
      colProps: { span: 11 },
      componentProps: ({ formModel, formActionType }) => ({
        min: 0,
        max: 100,
        placeholder: '请输入付款比例',
        precision: 2,
      }),
      rules: [
        {
          required: true,
          message: '请输入付款比例',
          trigger: 'blur',
        },
      ],
    },
    {
      field: 'description',
      label: '付款说明',
      component: 'InputTextArea',
      colProps: { span: 22 },
      componentProps: {
        placeholder: '最大可输入100个字符',
      },
      rules: [getNamePatternRule(100)],
    },
    {
      field: 'amount',
      label: '金额',
      component: 'InputNumber',
      colProps: { span: 11 },
      defaultValue: 0,
      componentProps: {
        placeholder: '请输入付款比例',
        precision: 2,
        disabled: true,
      },
    },
  ];
};
