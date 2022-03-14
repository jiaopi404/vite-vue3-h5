import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
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
    // {
    //   title: '采购方式',
    //   dataIndex: 'procurementMethod.name',
    //   width: 120,
    // },
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
        type: 'gt',
        value: ['10'],
      },
    ],
    dataFieldList: ['project', 'project.id'],
  },
});

export { columns, searchFormSchema, pageAndSort };
