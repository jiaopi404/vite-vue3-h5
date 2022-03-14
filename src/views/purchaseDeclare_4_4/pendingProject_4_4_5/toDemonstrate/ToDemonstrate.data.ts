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
import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
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
    {
      title: '采购类型',
      dataIndex: 'projectType.name',
      width: 80,
    },
    {
      title: '采购方式',
      dataIndex: 'procurementMethod.name',
      width: 120,
    },
    {
      title: '采购形式',
      dataIndex: 'organizationalForm.name',
      width: 120,
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
      width: 120,
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
  // {
  //   field: 'proName',
  //   label: '项目名称',
  //   component: 'Input',
  //   componentProps: {
  //     placeholder: '请输入项目名称',
  //   },
  // },
  {
    field: 'expert',
    label: '论证专家',
    component: 'InputTextArea',
    rules: [{ required: true, message: '请输入论证专家', trigger: 'blur' }],
    componentProps: {
      // defaultValue: '同意666', bug
      placeholder: '请输入论证专家',
      autoSize: { minRows: 3, maxRows: 5 },
      showCount: true,
      maxlength: 5000,
    },
  },
  {
    field: 'participants',
    label: '参会人员',
    component: 'InputTextArea',
    rules: [{ required: true, message: '请输入参会人员', trigger: 'blur' }],
    componentProps: {
      placeholder: '请输入参会人员',
      autoSize: { minRows: 3, maxRows: 5 },
      showCount: true,
      maxlength: 5000,
    },
  },
  {
    field: 'demonstrationTime',
    label: '论证时间',
    component: 'DatePicker',
    required: true,
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD 00:00:00',
      // valueFormat: 'YYYY-MM-DD HH:mm:00',
    },
  },
  {
    field: 'result',
    label: '论证结果',
    required: true,
    component: 'RadioGroup',
    componentProps: ({ formActionType }) => {
      return {
        options: [
          { label: '通过', value: 1 },
          { label: '不通过', value: 2 },
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
    field: 'auditOpinion',
    label: '论证意见',
    component: 'InputTextArea',
    rules: [{ required: true, message: '请输入论证意见', trigger: 'blur' }],
    componentProps: {
      // defaultValue: '同意666', bug
      placeholder: '最大可输入5000个字符',
      autoSize: { minRows: 3, maxRows: 5 },
      showCount: true,
      maxlength: 5000,
    },
    defaultValue: '同意',
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => {
  // const base64Data = orParamsFormatter(
  //   `(project.BiddingUserId = ${userStore.getUserInfo.id.toString()} or biddingCompany.user.id = ${userStore.getUserInfo.id.toString()})`,
  // );
  const base64Data = orParamsFormatter(
    `(project.BiddingUserId = ${userStore.getUserInfo.id.toString()} or biddingCompany.user.id = ${userStore.getUserInfo.id.toString()})`,
  );
  return {
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
          value: [12],
        },
        // {
        //   param: 'project.BiddingUserId',
        //   type: 'equal',
        //   value: [userStore.getUserInfo.id.toString()],
        //   // value 当前登录人id
        // },
        {
          param: '',
          type: 'or',
          value: [base64Data],
        },
      ],
      // dataFieldList: ['project', 'project.id'],
      dataFieldList: ['project', 'biddingCompany.user.id'],
    },
  };
};

export { columns, searchFormSchema, pageAndSort, formSchema };
