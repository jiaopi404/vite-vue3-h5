import { FormSchema } from '/@/components/Form';
export const editPurchasePlanForBidSectionDrawer = (): FormSchema[] => {
  return [
    {
      field: 'planOrganizationalForm',
      label: '计划采购形式',
      component: 'Select',
      slot: 'planOrganizationalForm',
      colProps: { span: 24 },
      rules: [{ type: 'number' }],
    },
    {
      field: 'organizationalForm',
      label: '审批采购形式',
      component: 'Select',
      slot: 'organizationalForm',
      colProps: { span: 24 },
      rules: [{ required: true, message: '请选择审批采购形式', trigger: 'change', type: 'number' }],
    },
    {
      field: 'planProcurementMethod',
      label: '计划采购方式',
      component: 'Select',
      slot: 'planProcurementMethod',
      colProps: { span: 24 },
      rules: [{ type: 'number' }],
    },
    {
      field: 'procurementMethod',
      label: '审批采购方式',
      component: 'Select',
      slot: 'procurementMethod',
      colProps: { span: 24 },
      rules: [{ required: true, message: '请选择审批采购方式', trigger: 'change', type: 'number' }],
    },
  ];
};
