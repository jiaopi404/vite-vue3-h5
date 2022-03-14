import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';

import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
const columns = (): BasicColumn[] => [
  {
    title: '供应商名称',
    dataIndex: 'successfulSupplier.name',
    width: 240,
  },
  {
    title: '投标代表人',
    dataIndex: 'perName',
    width: 140,
  },
  {
    title: '代表人电话',
    dataIndex: 'mobile',
    width: 140,
    format: (_text, record) => {
      const mobile = getSecretMobile(record?.mobile);
      return mobile;
    },
  },
  {
    title: '代表人身份证号',
    dataIndex: 'citId',
    width: 140,
  },
  {
    title: '是否合格',
    dataIndex: 'ifQualified',
    width: 80,
    format: (_text, record) => {
      return record.ifQualified === 0 ? '否' : '是';
    },
  },
  {
    title: '报名说明',
    dataIndex: 'registrationInstructions',
    width: 140,
  },
];
// 抽屉
const formSchema = (): FormSchema[] => {
  return [
    {
      field: 'successfulSupplier.id',
      label: '报名供应商',
      component: 'ApiSelect',
      labelWidth: 120,
      required: true,
    },
    {
      field: 'perName',
      label: '投标代表人',
      component: 'Input',
      required: true,
      labelWidth: 120,
      componentProps: {
        placeholder: '请输入投标代表人姓名',
      },
      rules: [
        { required: true, message: '请输入投标代表人姓名', trigger: 'blur' },
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
      field: 'mobile',
      label: '代表人电话',
      component: 'Input',
      required: true,
      labelWidth: 120,
      componentProps: {
        placeholder: '请输入代表人电话',
      },
      rules: [
        { required: true, message: '请输入代表人电话', trigger: 'blur' },
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
      field: 'citId',
      label: '代表人身份证号',
      component: 'Input',
      required: true,
      labelWidth: 120,
      componentProps: {
        placeholder: '请输入代表人身份证号',
      },
      rules: [
        { required: true, message: '请输入代表人身份证号', trigger: 'blur' },
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
      field: 'ifQualified',
      label: '是否合格',
      component: 'RadioGroup',
      required: true,
      labelWidth: 120,
      defaultValue: 1,
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
    },
    {
      field: 'registrationInstructions',
      label: '报名说明',
      component: 'InputTextArea',
      required: true,
      labelWidth: 120,
      componentProps: {
        placeholder: '最大可输入5000个字符',
        autoSize: { minRows: 8, maxRows: 12 },
        showCount: true,
        maxlength: 5000,
      },
      ifShow: ({ values }) => {
        return !values.ifQualified;
      },
    },
  ];
};
export { columns, formSchema };
