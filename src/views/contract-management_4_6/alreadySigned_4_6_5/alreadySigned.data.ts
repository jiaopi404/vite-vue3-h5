import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { dateUtil } from '/@/utils/dateUtil';
import { lxTableColumnProjectBidsectionRender, lxTableColumnReportContract } from '/@/components/LxComponents';

const columns = (): BasicColumn[] => [
  {
    title: '合同名称',
    dataIndex: 'name',
    width: 120,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnReportContract(record);
    },
  },
  {
    title: '合同编号',
    dataIndex: 'code',
    width: 120,
    fixed: 'left',
  },
  // {
  //   title: '合同类型',
  //   dataIndex: 'code',
  //   width: 120,
  // },
  {
    title: '合同金额',
    dataIndex: 'conAmount',
    width: 100,
    format: (_text, record) => {
      return (
        record.conAmount +
        (record.bidSection.project.currencyType.code === '1'
          ? '元'
          : record.bidSection.project.currencyType.name)
      );
    },
    sorter: true,
  },
  {
    title: '合同类型',
    dataIndex: 'bidSection.project.projectType.name',
    width: 80,
  },

  {
    title: '项目名称',
    dataIndex: 'bidSection.proName',
    width: 120,
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(
        record.bidSection,
        record.bidSection,
      );
    },
  },
  {
    title: '项目编号',
    dataIndex: 'bidSection.proNumber',
    width: 120,
  },
  {
    title: '中标供应商',
    dataIndex: 'successfulSupplier.name',
    width: 100,
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
  {
    title: '生成日期',
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
    field: 'name',
    label: '合同名称',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入合同名称',
    },
  },
  {
    field: 'code',
    label: '合同编号',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入合同编号',
    },
  },
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
    label: '合同类型',
    component: 'ApiSelect',
    colProps: { span: 8 },
    componentProps: {
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
      placeholder: '请选择合同类型',
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
      disabledDate(current) {
        return current && current > dateUtil().endOf('day');
      },
      // ranges: { Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] },
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
        prop: 'conContract.updateDateTime',
      },
      {
        dir: 'desc',
        prop: 'conContract.id',
      },
    ],
    // page: {
    //   pageSize: 10,
    //   pageNum: 1,
    // },
    queryList: [
      {
        param: 'conContract.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'bidWinner.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'conContract.status.code',
        type: 'equal',
        value: [5],
      },
      {
        param: 'conContract.chargeUser.id',
        type: 'equal',
        value: [userStore.getUserInfo.id.toString()],
        // value 当前登录人id
      },
    ],
    dataFieldList: ['conContract', 'conContract.id'],
  },
});

export { columns, searchFormSchema, pageAndSort };
