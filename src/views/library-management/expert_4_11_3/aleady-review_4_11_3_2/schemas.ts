import { getNamePatternRule, getAccountPatternRule } from '/@/utils/helper/validateRuleHelper';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { getDictionaryByParentId, getDictionaryTreeByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { useRouter } from 'vue-router';
import { unref } from 'vue';
const configStore = useConfigStoreWithOut();
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
    width: 150,
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
export const editExpertFormSchema = (): FormSchema[] => {
  const router = useRouter();
  return [
    {
      field: 'orgName',
      label: '单位名称',
      required: true,
      component: 'Input',
      colProps: { span: 12 },
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
    },
    {
      field: 'account',
      label: '账号',
      required: true,
      component: 'Input',
      colProps: { span: 12 },
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
      field: 'perName',
      label: '姓名',
      required: true,
      component: 'Input',
      colProps: { span: 12 },
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
      field: 'citId',
      label: '身份证号',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请输入身份证号',
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
      colProps: { span: 12 },
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
      field: 'email',
      component: 'Input',
      colProps: { span: 12 },
      label: '邮箱',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      rules: [
        {
          validator: async (rule, value) => {
            let regExp =
              /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
            if (value && regExp.test(value) === false) {
              return Promise.reject('格式不正确');
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      field: 'schoolingRecord',
      label: '专家学历',
      component: 'ApiSelect',
      colProps: { span: 12 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG.configInfo.configDictionary?.schoolingRecordId,
        placeholder: '请选择专家学历',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'academicDegree',
      label: '专家学位',
      component: 'ApiSelect',
      colProps: { span: 12 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG.configInfo.configDictionary?.academicDegreeId,
        placeholder: '请选择专家学位',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'academicTitle',
      label: '专家职称',
      component: 'ApiSelect',
      colProps: { span: 12 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG.configInfo.configDictionary?.academicTitleId,
        placeholder: '请选择专家职称',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'academicTitleGetDate',
      label: '职称获得时间',
      component: 'DatePicker',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请选择职称获得时间',
      },
    },
    {
      field: 'sexCode',
      label: '性别',
      component: 'RadioGroup',
      colProps: { span: 12 },
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
      field: 'useMark',
      label: '专家状态',
      component: 'RadioGroup',
      colProps: { span: 12 },
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
      field: 'researchResult',
      component: 'InputTextArea',
      label: '研究成果',
      componentProps: {
        placeholder: '最大可输入5000个字符',
        rows: 4,
      },
      colProps: { span: EDIT_ROLE_FORM_ITEM_COL_SPAN },
      rules: [
        {
          trigger: 'blur',
        },
        getNamePatternRule(5000),
      ],
    },
  ];
};

export const bindingFormSchema = (): FormSchema[] => [
  {
    field: 'expertCategory',
    label: '专家类型',
    component: 'ApiSelect',
    colProps: { span: 12 },
    componentProps: ({ formActionType }) => ({
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG.configInfo.configDictionary?.expertTypeId,
      resultField: '', //接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
      labelField: 'name',
      valueField: 'id',
      showSearch: true, // 使单选模式可搜索
      optionFilterProp: 'label', // 搜索时过滤对应的 option 属性，不支持 children
      placeholder: '请选择专家类型',
      onChange: (value) => {
        const { updateSchema, setFieldsValue } = formActionType;
        setFieldsValue({ expertType: undefined });
        if (value) {
          // 所在单位value 存在
          updateSchema({
            field: 'expertType',
            componentProps: {
              api: getDictionaryTreeByParentId,
              params: value,
              resultField: '',
              placeholder: '请选择专家类别',
              replaceFields: {
                children: 'children',
                key: 'id',
                value: 'id',
                title: 'name',
              },
            },
          });
        }
      },
    }),
    required: true,
  },
  {
    field: 'expertType',
    label: '专家类别',
    component: 'ApiTreeSelect',
    colProps: { span: 12 },
    componentProps: {
      api: getDictionaryTreeByParentId,
      params: 0,
      immediate: false,
      placeholder: '请选择专家类别',
      treeCheckable: true, // 可多选
      resultField: 'data', // 接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
      replaceFields: {
        children: 'children',
        key: 'id',
        value: 'id',
        title: 'name',
      },
      onChange: (value) => {
        console.log('TreeSelect value:', value);
      },
    },
    dynamicDisabled: ({ model }): boolean => {
      return !model.expertCategory;
    },
  },
];
export const bindingTableSchema: BasicColumn[] = [
  {
    title: '专家类型',
    dataIndex: 'expertResearchArea.expertCategoryId.name',
    width: 120,
    fixed: 'left',
  },
  {
    title: '专家类别',
    dataIndex: 'expertResearchArea.expertType.name',
    width: 120,
  },
];
