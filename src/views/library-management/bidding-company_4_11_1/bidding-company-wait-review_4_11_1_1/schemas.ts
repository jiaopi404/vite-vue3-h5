import { getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
export const roleListTableSchema: BasicColumn[] = [
  {
    title: '公司名称',
    dataIndex: 'biddingCompany.name',
    width: 200,
    fixed: 'left',
  },
  {
    title: '公司账号',
    dataIndex: 'biddingCompany.user.account',
    width: 120,
    fixed: 'left',
  },
  {
    title: '公司法人姓名',
    dataIndex: 'biddingCompany.legalperName',
    width: 120,
  },
  {
    title: '公司法人身份证号',
    dataIndex: 'biddingCompany.legalperCitId',
    width: 150,
  },
  {
    title: '公司法人手机号',
    dataIndex: 'biddingCompany.legalperTel',
    width: 120,
  },
  {
    title: '业务联系人',
    dataIndex: 'biddingCompany.user.perName',
    width: 120,
  },
  {
    title: '联系人性别',
    dataIndex: 'biddingCompany.user.sexCode',
    width: 120,
    format: (text) => {
      if (text) {
        return '男';
      } else {
        return '女';
      }
    },
  },
  {
    title: '联系人身份证号',
    dataIndex: 'biddingCompany.user.citId',
    width: 150,
  },
  {
    title: '联系电话',
    dataIndex: 'biddingCompany.user.mobile',
    width: 120,
  },
  {
    title: '公司注册电话（座机）',
    dataIndex: 'biddingCompany.regtel',
    width: 180,
  },
  {
    title: '公司注册资金（万元）',
    dataIndex: 'biddingCompany.regfunAmount',
    width: 180,
  },
  {
    title: '公司注册日期',
    dataIndex: 'biddingCompany.regdate',
    width: 120,
    customRender: ({ record }) => {
      return renderTime(record.biddingCompany.regdate);
    },
  },
  {
    title: '公司注册地址',
    dataIndex: 'biddingCompany.address',
    width: 120,
  },
  {
    title: '公司开户行名称',
    dataIndex: 'biddingCompany.depositBank',
    width: 120,
  },
  {
    title: '公司账户',
    dataIndex: 'biddingCompany.bankAccount',
    width: 120,
  },
  {
    title: '公司状态',
    dataIndex: 'biddingCompany.useMark',
    width: 120,
    format: (text) => {
      if (text) {
        return '正常';
      } else {
        return '黑名单';
      }
    },
  },
  {
    title: '添加日期',
    dataIndex: 'biddingCompany.adddateTime',
    width: 120,
    customRender: ({ record }) => {
      return renderTime(record.biddingCompany.adddateTime);
    },
  },
];

export const roleSearchFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '公司名称',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入公司名称',
    },
  },
  {
    field: 'account',
    label: '公司账号',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入公司账号',
    },
  },
  {
    field: 'perName',
    label: '业务联系人',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入业务联系人',
    },
  },
  {
    field: 'mobile',
    label: '联系电话',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入联系电话',
    },
  },
];

const EDIT_ROLE_FORM_ITEM_COL_SPAN = 24;
export const editRoleFormSchema: FormSchema[] = [
  {
    field: 'approveStatus',
    label: '审核结果',
    component: 'RadioGroup',
    required: true,
    defaultValue: 1,
    colProps: { span: EDIT_ROLE_FORM_ITEM_COL_SPAN },
    componentProps: ({ formActionType }) => {
      return {
        options: [
          { label: '通过', value: 1 },
          { label: '不通过', value: 2 },
        ],
        onChange: ({ target }) => {
          const { setFieldsValue } = formActionType;
          if (target.value === 1) {
            setFieldsValue({ approveSuggestion: '同意' });
          } else if (target.value === 2) {
            setFieldsValue({ approveSuggestion: '不同意' });
          }
        },
      };
    },
  },
  {
    field: 'approveSuggestion',
    component: 'InputTextArea',
    label: '审核意见',
    componentProps: {
      placeholder: '请输入审核意见',
      rows: 4,
    },
    colProps: { span: EDIT_ROLE_FORM_ITEM_COL_SPAN },
    rules: [
      {
        required: true,
        trigger: 'blur',
      },
      getNamePatternRule(5000),
    ],
    required: true,
    defaultValue: '同意',
  },
];
