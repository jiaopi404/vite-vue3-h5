import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';

const columns = (): BasicColumn[] => {
  const personFormatter = getPersonNameFormatter();
  return [
    {
      title: '项目名称',
      dataIndex: 'proName',
      width: 180,
      fixed: 'left',
      customRender: ({ record }) => {
        return lxTableColumnProjectNameRender(record);
      },
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      width: 100,
      format: (_text, record) => {
        return (
          record.budgetAmount + (record.currencyType.code === '1' ? '元' : record.currencyType.name)
        );
      },
    },
    // {
    //   title: '货币类型',
    //   dataIndex: 'currencyType.name',
    //   width: 80,
    // },
    {
      title: '采购类型',
      dataIndex: 'projectType.name',
      width: 80,
    },
    {
      title: '采购方式',
      dataIndex: 'procurementMethod.name',
      width: 80,
    },
    {
      title: '采购形式',
      dataIndex: 'organizationalForm.name',
      width: 80,
    },
    {
      title: '申报部门',
      dataIndex: 'declareDept.name',
      width: 120,
    },
    {
      title: '申报人',
      dataIndex: 'addUser.perName',
      width: 120,
      format: (_, record) => {
        return personFormatter(record.addUser);
      },
    },
    {
      title: '添加日期',
      dataIndex: 'addDateTime',
      width: 100,
      customRender: ({ text }) => {
        return renderTime(text);
      },
      sorter: true,
    },
    // {
    //   title: 'operation',
    //   dataIndex: 'operation',
    //   slots: { customRender: 'operation' },
    // },
  ];
};

// 查询表单
const searchFormSchema = (): FormSchema[] => [
  {
    field: 'proName',
    label: '项目名称',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入项目名称',
    },
  },
  {
    field: 'projectTypeId',
    label: '采购类型',
    component: 'ApiSelect',
    colProps: { span: 8 },
    componentProps: {
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
      placeholder: '请选择采购类型',
      labelField: 'name',
      valueField: 'id',
      showSearch: true,
      optionFilterProp: 'label',
    },
  },
];

// 抽屉表单
const formSchema = (): FormSchema[] => [
  {
    field: 'result',
    label: '审核结果',
    required: true,
    component: 'RadioGroup',
    componentProps: ({ formActionType }) => {
      return {
        options: [
          { label: '接收', value: 1 },
          { label: '退回', value: 2 },
        ],
        onChange: ({ target }) => {
          const { setFieldsValue } = formActionType;
          if (target.value === 1) {
            setFieldsValue({ auditOpinion: '同意' });
          } else if (target.value === 2) {
            setFieldsValue({ auditOpinion: '不同意' });
          }
        },
      };
    },
    defaultValue: 1,
  },
  {
    field: 'option',
    label: '反馈意见',
    component: 'InputTextArea',
    rules: [
      { required: true, message: '请输入1至5000位汉字、符号、字母或数字。', trigger: 'blur' },
    ],
    componentProps: {
      // defaultValue: '同意666', bug
      placeholder: '最大可输入5000个字符',
      autoSize: { minRows: 5, maxRows: 8 },
      showCount: true,
      maxlength: 5000,
    },
    defaultValue: '同意',
  },
  {
    field: 'ifReview',
    label: '是否审核',
    required: true,
    component: 'RadioGroup',
    componentProps: {
      options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
      ],
    },
    defaultValue: 0,
    ifShow: ({ model }): boolean => {
      return model.result === 1;
    },
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    sorts: [
      {
        dir: 'desc',
        prop: 'project.updateDateTime',
      },
      {
        dir: 'desc',
        prop: 'project.id',
      },
    ],
    // page: {
    //   pageSize: 10,
    //   pageNum: 1,
    // },
    queryList: [
      {
        param: 'project.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'project.status.code',
        type: 'equal',
        value: [14],
      },
      {
        param: 'project.BiddingUserId',
        type: 'equal',
        value: [userStore.getUserInfo.id.toString()],
        // value 当前登录人id
      },
    ],
    dataFieldList: ['project', 'project.id'],
  },
});

export { columns, searchFormSchema, pageAndSort, formSchema };
