import { FormSchema } from '/@/components/Table';
import { getPasswordPatternRule } from '/@/utils/helper/validateRuleHelper';
// 抽屉数据
export const formSchema = (): FormSchema[] => [
  {
    field: 'role',
    component: 'Select',
    label: '用户类型',
    required: true,
    colProps: { span: 24 },
    componentProps: {
      options: [],
      showSearch: true,
      optionFilterProp: 'label',
      placeholder: '请选择用户类型',
    },
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
];
