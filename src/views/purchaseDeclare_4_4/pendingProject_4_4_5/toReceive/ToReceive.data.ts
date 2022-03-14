import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { getPurOrgList } from '/@/api/purchaseDeclare/pendingProjectApi';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
const personFormatter = getPersonNameFormatter();
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';

const columns = (): BasicColumn[] => [
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
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 120,
    customRender: ({ text }) => {
      return renderTime(text);
    },
    sorter: true,
  },
  {
    title: '计划使用时间',
    dataIndex: 'planUseTime',
    width: 120,
    customRender: ({ text }) => {
      return renderTime(text);
    },
    sorter: true,
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

// 查询项表单
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
    label: '处理项目',
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
  // 接收1 显示组织接收人,
  // 退回2 不显示
  {
    field: 'biddingUserId',
    label: '组织处理人',
    component: 'ApiSelect',
    required: true,
    componentProps: {
      api: getPurOrgList,
      params: userStore.getUserInfo.orgId,
      placeholder: '请选择组织处理人',
      labelField: 'perName',
      valueField: 'id',
      showSearch: true,
      optionFilterProp: 'label',
      resultFormatter: (data) => {
        data.forEach((item) => {
          item.perName = personFormatter(item);
        });
        return data;
      },
    },
    ifShow: ({ model }): boolean => {
      return model.result === 1;
    },
  },
  {
    field: 'planOrganizationalForm',
    label: '计划采购形式',
    component: 'ApiSelect',
    componentProps: {
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG_DICTIONRY.organizationalFormId,
      placeholder: '请选择计划采购形式',
      labelField: 'name',
      valueField: 'id',
      showSearch: true,
      optionFilterProp: 'label',
    },
  },
  {
    field: 'planProcurementMethod',
    label: '计划采购方式',
    component: 'ApiSelect',
    componentProps: {
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG_DICTIONRY.purchaseMethodId,
      placeholder: '请选择计划采购方式',
      labelField: 'name',
      valueField: 'id',
      showSearch: true,
      optionFilterProp: 'label',
    },
  },
  // 选择 接收1 ，反馈意见默认填充“同意”
  // 选择 退回2 ，反馈意见默认填充“不同意”
  {
    field: 'auditOpinion',
    label: '反馈意见',
    component: 'InputTextArea',
    required: true,
    componentProps: {
      // defaultValue: '同意666', bug
      placeholder: '最大可输入5000个字符',
      autoSize: { minRows: 8, maxRows: 12 },
      showCount: true,
      maxlength: 5000,
    },
    defaultValue: '同意',
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
        value: [10],
      },
    ],
    dataFieldList: ['project', 'project.id'],
  },
});

export { columns, searchFormSchema, pageAndSort, formSchema };
