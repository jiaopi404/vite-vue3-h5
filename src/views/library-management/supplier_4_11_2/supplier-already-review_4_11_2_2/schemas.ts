import { getNamePatternRule, getAccountPatternRule } from '/@/utils/helper/validateRuleHelper';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useRouter } from 'vue-router';
import { unref } from 'vue';
import { dateUtil } from '/@/utils/dateUtil';
export const roleListTableSchema: BasicColumn[] = [
  {
    title: '公司名称',
    dataIndex: 'biddingCompany.name',
    slots: { customRender: 'name' },
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
    title: '公司营业执照注册号',
    dataIndex: 'biddingCompany.comlicCode',
    width: 150,
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
    title: '公司联系人姓名',
    dataIndex: 'biddingCompany.user.perName',
    width: 120,
  },
  {
    title: '是否供应商',
    dataIndex: 'biddingCompany.ifSupplier',
    width: 120,
    format: (text) => {
      if (text) {
        return '是';
      } else {
        return '否';
      }
    },
  },
  {
    title: '是否维修商',
    dataIndex: 'biddingCompany.ifRepairer',
    width: 120,
    format: (text) => {
      if (text) {
        return '是';
      } else {
        return '否';
      }
    },
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
    dataIndex: 'biddingCompany.user.addDateTime',
    width: 120,
    customRender: ({ record }) => {
      return renderTime(record.biddingCompany.user.addDateTime);
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
    field: 'comlicCode',
    label: '公司营业执照注册号',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入公司账号',
    },
  },
  {
    field: 'regdate',
    component: 'RangePicker',
    label: '公司注册日期',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'legalperName',
    label: '公司法人姓名',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入公司法人姓名',
    },
  },
  {
    field: 'perName',
    label: '公司联系人姓名',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入公司联系人姓名',
    },
  },
  {
    field: 'addDateTime',
    component: 'RangePicker',
    label: '联系人注册日期',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'ifSupplier',
    label: '是否供应商',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否供应商',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
    },
    colProps: { span: 8 },
  },
  {
    field: 'ifRepairer',
    label: '是否维修商',
    component: 'Select',
    componentProps: {
      placeholder: '请选择是否维修商',
      options: [
        { label: '是', value: '1' },
        { label: '否', value: '0' },
      ],
    },
    colProps: { span: 8 },
  },
];

const EDIT_ROLE_FORM_ITEM_COL_SPAN = 24;
export const editSupplierFormSchema = (supplierItself = false): FormSchema[] => {
  const router = useRouter();
  const ConfigStoreWithOut = useConfigStoreWithOut();
  return [
    {
      field: 'name',
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
      field: 'comlicCode',
      label: '公司统一社会信用代码',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司统一社会信用代码',
      },
      rules: [
        { required: true, message: '请输入公司统一社会信用代码', trigger: 'blur' },
        {
          validator: (_, value) => {
            const RegExp = /^(?:(?![IOZSV])[\dA-Z]){2}\d{6}(?:(?![IOZSV])[\dA-Z]){7,10}$/;
            if (value) {
              if (RegExp.test(value)) {
                return Promise.resolve();
              } else {
                return Promise.reject(`请输入15至18位数字或大写字母`);
              }
            } else {
              return Promise.resolve();
            }
          },
        },
      ],
    },
    {
      field: 'legalperName',
      label: '公司法人姓名',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司法人姓名',
      },
      rules: [
        { required: true, message: '请输入公司法人姓名', trigger: 'blur' },
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
      field: 'legalperCitId',
      label: '公司法人身份证号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司法人身份证号',
      },
      required: true,
      rules: [
        { required: true, message: '请输入公司法人身份证号', trigger: 'blur' },
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
      field: 'legalperTel',
      label: '公司法人手机号',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入公司法人手机号',
      },
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
      field: 'regtel',
      component: 'Input',
      label: '公司注册电话（座机）',
      componentProps: {
        placeholder: '请输入公司注册电话（座机）',
      },
      required: true,
      rules: [
        { required: true, message: '请输入公司注册电话（座机）', trigger: 'blur' },
        {
          validator: async (rule, value) => {
            let regExp = /0\d{2,3}-\d{7,8}$/;
            if (value && regExp.test(value) === false) {
              return Promise.reject('格式不正确（区号-电话号码）');
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      field: 'ifShortlistedSuppliers',
      label: '是否入围供应商',
      // required: true,
      component: 'Switch',
      colProps: { span: 10 },
      componentProps: ({ formActionType }) => ({
        checkedValue: 1,
        unCheckedValue: 0,
        onChange: (checked, event) => {
          const { setFieldsValue } = formActionType;
          setFieldsValue({ termOfValidity: null });
        },
      }),
      defaultValue: 0,
      show: !supplierItself,
    },
    {
      field: 'termOfValidity',
      label: '资质有效期',
      component: 'DatePicker',
      colProps: { span: 10 },
      required: true,
      componentProps: {
        placeholder: '请选择资质有效期',
        // format: 'YYYY-MM-DD',
        // valueFormat: 'YYYY-MM-DD 23:59:59',
        showToday: true,
        disabledDate(current) {
          return current < dateUtil().startOf('day');
        },
        // defaultPickerValue: null,
      },
      ifShow: ({ model }): boolean => {
        return model.ifShortlistedSuppliers === 1;
      },
      show: !supplierItself,
    },
    {
      field: 'useMark',
      label: '公司状态',
      component: 'RadioGroup',
      required: true,
      defaultValue: 1,
      ifShow: (value) => {
        const isShow = unref(router.currentRoute).path.includes('personal-perfect');
        if (!isShow) {
          return true;
        } else {
          return false;
        }
      },
      componentProps: {
        options: [
          {
            label: '正常',
            value: 1,
          },
          {
            label: '黑名单',
            value: 0,
          },
        ],
      },
    },
    {
      field: 'ifSupplier',
      label: '是否供应商',
      component: 'RadioGroup',
      required: true,
      defaultValue: 1,
      colProps: { span: 10 },
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
      field: 'ifRepairer',
      label: '是否维修商',
      component: 'RadioGroup',
      required: true,
      defaultValue: 0,
      colProps: { span: 10 },
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
      field: 'regfunAmount',
      component: 'InputNumber',
      label: '公司注册资金（万元）',
      required: true,
      defaultValue: 0,
      colProps: { span: 10 },
      componentProps: {
        min: 0,
        max: 10000000,
      },
    },
    {
      field: 'regdate',
      label: '公司注册日期',
      component: 'DatePicker',
      required: true,
      colProps: { span: 10 },
      componentProps: {
        placeholder: '请选择公司注册日期',
        disabledDate(current) {
          return current > Date.now();
        },
      },
    },
    {
      field: 'address',
      label: '公司注册地址',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司注册地址',
      },
      rules: [
        { required: true, message: '请输入公司注册地址', trigger: 'blur' },
        {
          validator: async (rule, value) => {
            let regExp = /^[\s\S]{1,100}$/;
            if (value && regExp.test(value) === false) {
              return Promise.reject('请输入1至100位字符');
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      field: 'officeAddress',
      label: '公司办公地址',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司办公地址',
      },
      rules: [
        { required: true, message: '请输入公司办公地址', trigger: 'blur' },
        {
          validator: async (rule, value) => {
            let regExp = /^[\s\S]{1,100}$/;
            if (value && regExp.test(value) === false) {
              return Promise.reject('请输入1至100位字符');
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      field: 'businessType',
      label: '公司业务类型',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        numberToString: true,
        api: getDictionaryByParentId,
        params: ConfigStoreWithOut.GET_CONFIG_DICTIONRY.projectTypeId,
        placeholder: '请选择公司业务类型',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        mode: 'multiple',
        optionFilterProp: 'label',
      },
    },
    {
      field: 'depositBank',
      label: '公司开户行名称',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司开户行名称',
      },
      rules: [
        {
          required: true,
          message: '请输入公司开户行名称',
          trigger: 'blur',
        },
        getAccountPatternRule(100),
      ],
    },
    {
      field: 'bankAccount',
      label: '公司账户',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入公司账户',
      },
      rules: [
        { required: true, message: '请输入公司账户', trigger: 'blur' },
        {
          validator: async (rule, value) => {
            let regExp = /^(\d{6,30})$/;
            if (value && regExp.test(value) === false) {
              return Promise.reject('请输入6至30位数字');
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      field: 'majorScope',
      component: 'InputTextArea',
      label: '公司经营范围',
      componentProps: {
        placeholder: '最大可输入5000个字符',
        rows: 4,
      },
      required: true,
      colProps: { span: EDIT_ROLE_FORM_ITEM_COL_SPAN },
      rules: [
        {
          required: true,
          trigger: 'blur',
        },
        getNamePatternRule(5000),
      ],
    },
    {
      field: 'perName',
      label: '业务联系人',
      required: true,
      component: 'Input',
      componentProps: {
        placeholder: '请输入业务联系人',
      },
      rules: [
        { required: true, message: '请输入业务联系人', trigger: 'blur' },
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
      label: '手机号',
      component: 'Input',
      required: true,
      componentProps: {
        placeholder: '请输入手机号',
      },
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
      field: 'sexCode',
      label: '联系人性别',
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
      label: '联系人身份证号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系人身份证号',
      },
      required: true,
      rules: [
        { required: true, message: '请输入联系人身份证号', trigger: 'blur' },
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
  ];
};
