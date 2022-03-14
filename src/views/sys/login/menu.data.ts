import { FormSchema } from '/@/components/Table';
import {
  getNamePatternRule,
  getAccountPatternRule,
  getPasswordPatternRule,
} from '/@/utils/helper/validateRuleHelper';
import { getDepTreeList } from '/@/api/demo/system';
// 抽屉数据
export const formSchema = (): FormSchema[] => [
  {
    field: 'role',
    component: 'Select',
    label: '用户类型',
    required: true,
    componentProps: {
      options: [],
      showSearch: true,
      optionFilterProp: 'label',
      placeholder: '请选择用户类型',
    },
  },
  {
    field: 'orgName',
    label: '单位名称',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '请输入单位名称',
    },
    rules: [
      {
        required: true,
        message: '请输入单位名称',
        trigger: 'blur',
      },
      getNamePatternRule(50),
    ],
    ifShow: ({ values }) => {
      if (values.role === '3') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'orgId',
    component: 'Select',
    label: '单位名称',
    required: true,
    defaultValue: 1,
    componentProps: {
      options: [],
      showSearch: true,
      optionFilterProp: 'label',
      placeholder: '请选择单位名称',
    },
    ifShow: ({ values }) => {
      if (values.role === '2') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'ifSupplier',
    label: '是否供应商',
    component: 'RadioGroup',
    required: true,
    defaultValue: 1,
    colProps: { span: 12 },
    componentProps: {
      options: [
        {
          label: '是',
          value: 1,
        },
        {
          label: '否',
          value: 0,
        },
      ],
    },
    ifShow: ({ values }) => {
      if (values.role === '1') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'ifRepairer',
    label: '是否维修商',
    component: 'RadioGroup',
    required: true,
    defaultValue: 0,
    colProps: { span: 12 },
    componentProps: {
      options: [
        {
          label: '是',
          value: 1,
        },
        {
          label: '否',
          value: 0,
        },
      ],
    },
    ifShow: ({ values }) => {
      if (values.role === '1') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'department',
    label: '部门名称', // 外键
    component: 'ApiTreeSelect',
    componentProps: {
      api: getDepTreeList,
      params: 1,
      options: [],
      placeholder: '请选择部门名称',
    },
    required: true,
    colProps: { span: 22 },
    ifShow: ({ values }) => {
      if (values.role === '2') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'companyName',
    label: '公司名称',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '请输入公司名称',
    },
    rules: [
      {
        required: true,
        message: '请输入公司名称',
        trigger: 'blur',
      },
      getNamePatternRule(50),
    ],
    ifShow: ({ values }) => {
      if (values.role === '1' || values.role === '5') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'account',
    label: '账号',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '请输入账号',
    },
    rules: [
      {
        required: true,
        message: '请输入账号',
        trigger: 'blur',
      },
      getAccountPatternRule(20),
    ],
  },
  {
    field: 'password',
    label: '密码',
    required: true,
    component: 'InputPassword',
    componentProps: {
      placeholder: '请输入密码',
    },
    rules: [
      {
        required: true,
        message: '请输入密码',
        trigger: 'blur',
      },
      getPasswordPatternRule(20),
    ],
  },
  {
    field: 'confirmPassword',
    label: '确认密码',
    required: true,
    component: 'InputPassword',
    componentProps: {
      placeholder: '请输入确认密码',
    },
    rules: [
      {
        required: true,
        message: '请输入确认密码',
        trigger: 'blur',
      },
    ],
  },
  {
    field: 'perName',
    label: '姓名',
    required: true,
    component: 'Input',
    componentProps: {
      placeholder: '请输入姓名',
    },
    rules: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      {
        validator: (_, value) => {
          const RegExp = /^(?!\s)(?!.*\s$).{2,25}$/;
          if (value) {
            if (RegExp.test(value)) {
              return Promise.resolve();
            } else {
              return Promise.reject(`请输入2至25位汉字、符号、字母或数字`);
            }
          } else {
            return Promise.resolve();
          }
        },
      },
    ],
  },
  {
    field: 'sexCode',
    label: '性别',
    component: 'RadioGroup',
    required: true,
    defaultValue: 1,
    componentProps: {
      options: [
        {
          label: '男',
          value: 1,
        },
        {
          label: '女',
          value: 0,
        },
      ],
    },
  },
  {
    field: 'citId',
    label: '身份证号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入身份证号',
    },
    ifShow: ({ values }) => {
      if (values.role !== '2') {
        return true;
      } else {
        return false;
      }
    },
    rules: [
      {
        validator: async (rule, value) => {
          let regExp =
            /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|30|31)|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}([0-9]|x|X)$/;
          if (regExp.test(value) === false && value) {
            return Promise.reject('请输入正确的身份证号');
          }
          return Promise.resolve();
        },
      },
    ],
  },
  {
    field: 'mobile',
    label: '手机号',
    component: 'Input',
    required: true,
    componentProps: ({ formModel, formActionType }) => ({
      placeholder: '请输入手机号',
      onChange: (value) => {
        const { updateSchema } = formActionType;
        updateSchema({
          field: 'sms',
          componentProps: () => ({
            mobile: formModel.mobile,
          }),
        });
      },
    }),
    rules: [
      {
        required: true,
        validator: async (rule, value) => {
          let regExp = /^1\d{10}$/;
          if (regExp.test(value) === false) {
            return Promise.reject('请输入11位手机号码');
          }
          return Promise.resolve();
        },
      },
    ],
  },
  {
    field: 'sms',
    label: '验证码',
    component: 'InputCountDown',
    componentProps: ({ formModel, formActionType }) => ({
      placeholder: '请输入验证码',
      onChange: (value) => {
        const { updateSchema } = formActionType;
        updateSchema({
          field: 'sms',
          componentProps: () => ({
            mobile: formModel.mobile,
          }),
        });
      },
    }),
  },
];
