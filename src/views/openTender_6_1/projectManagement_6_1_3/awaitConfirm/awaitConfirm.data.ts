import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';

import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
const columns = (): BasicColumn[] => {
  const personFormatter = getPersonNameFormatter();
  return [
    {
      title: '项目名称',
      dataIndex: 'bidSection.proName',
      width: 120,
      fixed: 'left',
      customRender: ({ record }) => {
        return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
      },
    },
    {
      title: '项目编号',
      dataIndex: 'bidSection.proNumber',
      width: 100,
      fixed: 'left',
    },
    {
      title: '预算金额',
      dataIndex: 'bidSection.budgetAmount',
      width: 100,
      format: (text, record) => {
        return (
          text +
          (record.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.bidSection.project.currencyType.name)
        );
      },
    },
    {
      title: '采购类型',
      dataIndex: 'bidSection.project.projectType.name',
      width: 100,
    },
    {
      title: '采购方式',
      dataIndex: 'bidSection.procurementMethod.name',
      width: 100,
    },

    {
      title: '中标代表人',
      dataIndex: 'bidWinner.perName',
      width: 120,
      format: (_, record) => {
        return personFormatter(record.bidWinner);
      },
    },
    {
      title: '中标金额',
      dataIndex: 'bidWinner.bidWinningAmount',
      width: 100,
      format: (text, record) => {
        return (
          text +
          (record.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.bidSection.project.currencyType.name)
        );
      },
    },
    {
      title: '中标日期',
      dataIndex: 'bidWinner.bidWinningDate',
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
    field: 'proNumber',
    label: '项目编号',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入项目编号',
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
  {
    field: 'bidWinningDate',
    label: '中标日期',
    component: 'RangePicker',
    colProps: { span: 8 },
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'bidWinner.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'bidSection.status.code',
        type: 'equal',
        value: [21],
      },
      // {
      //   param: 'bidWinner.successfulSupplierId',
      //   type: 'equal',
      //   // value: [72],
      //   value: [userStore.getUserInfo.id.toString()],
      // },
      // {
      //   param: 'bidSection.biddingCompany.user.id',
      //   type: 'equal',
      //   // value: [72],
      //   value: [userStore.getUserInfo.id.toString()],
      // },
    ],
    dataFieldList: ['bidWinner', 'bidSection'],
    // page: {
    //   pageNum: 1,
    //   pageSize: 10,
    // },
    sorts: [
      {
        dir: 'desc',
        prop: 'bidWinner.id',
      },
    ],
  },
});

export { columns, searchFormSchema, pageAndSort };
