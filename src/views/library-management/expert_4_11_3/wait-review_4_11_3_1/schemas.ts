import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
export const roleListTableSchema: BasicColumn[] = [
  {
    title: '专家姓名',
    dataIndex: 'user.perName',
    width: 120,
    fixed: 'left',
  },
  {
    title: '专家性别',
    dataIndex: 'user.sexCode',
    width: 120,
    fixed: 'left',
    format: (text) => {
      if (text) {
        return '男';
      } else {
        return '女';
      }
    },
  },
  {
    title: '专家账号',
    dataIndex: 'user.account',
    width: 120,
  },
  {
    title: '单位名称',
    dataIndex: 'user.orgName',
    width: 120,
  },
  {
    title: '专家职称',
    dataIndex: 'userExtend.academicTitle.name',
    width: 120,
  },
  {
    title: '职称获得时间',
    dataIndex: 'userExtend.academicTitleGetDate',
    width: 120,
    customRender: ({ record }) => {
      return renderTime(record.userExtend.academicTitleGetDate);
    },
  },
  {
    title: '专家学历',
    dataIndex: 'userExtend.schoolingRecord.name',
    width: 120,
  },
  {
    title: '专家学位',
    dataIndex: 'userExtend.academicDegree.name',
    width: 120,
  },
  {
    title: '专家邮箱',
    dataIndex: 'userExtend.email',
    width: 120,
  },
  {
    title: '联系电话',
    dataIndex: 'user.mobile',
    width: 120,
  },
  {
    title: '专家状态',
    dataIndex: 'user.useMark',
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
    dataIndex: 'user.addDateTime',
    width: 120,
    customRender: ({ record }) => {
      return renderTime(record.user.addDateTime);
    },
  },
];

export const roleSearchFormSchema: FormSchema[] = [
  {
    field: 'perName',
    label: '专家姓名',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入专家姓名',
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
      getNamePatternNoSpaceRule(5000, ['change', 'blur'], 1),
    ],
    defaultValue: '同意',
    required: true,
  },
];
