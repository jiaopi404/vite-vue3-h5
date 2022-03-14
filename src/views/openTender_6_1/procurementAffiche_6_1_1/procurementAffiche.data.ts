import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { formatToDateTime } from '/@/utils/dateUtil';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
const configStore = useConfigStoreWithOut();

const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 150,
    // slots: { customRender: 'proName' },
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record, record, false);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'project.purchaseNumber',
    width: 120,
    fixed: 'left',
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 100,
    format: (text, record) => {
      return (
        text + (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
      );
    },
  },
  // {
  //   title: '货币类型',
  //   dataIndex: 'currencyType.name',
  //   width: 80,
  // },
  {
    title: '采购单位',
    dataIndex: 'project.addUser.orgName',
    width: 120,
  },
  {
    title: '采购类型',
    dataIndex: 'project.projectType.name',
    width: 80,
  },
  {
    title: '报价开始时间',
    dataIndex: 'project.quoteStartTime',
    width: 150,
    customRender: ({ text }) => {
      return renderTime(text, true);
    },
    sorter: true,
  },
  {
    title: '报价截止时间',
    dataIndex: 'project.quoteEndTime',
    width: 150,
    customRender: ({ text }) => {
      return renderTime(text, true);
    },
    sorter: true,
  },
  {
    title: '剩余时间',
    dataIndex: 'surplusTime',
    width: 160,
    slots: { customRender: 'surplusTime' },
  },
  {
    title: '发布日期',
    dataIndex: 'project.releaseDate',
    width: 100,
    customRender: ({ text }) => {
      return renderTime(text);
    },
    sorter: true,
  },
  // {
  //   title: '浏览次数',
  //   dataIndex: 'viewingTimes',
  //   width: 80,
  // },
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
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'bidSection.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'bidSection.procurementMethod.node',
        type: 'equal',
        value: [1],
      },
      {
        param: 'bidSection.status.code',
        type: 'equal',
        value: [18],
      },
      // {
      //   param: 'bidSection.project.quoteStartTime',
      //   type: 'le',
      //   value: [nowDate],
      // },
      // {
      //   param: 'bidSection.project.quoteEndTime',
      //   type: 'ge',
      //   value: [nowDate],
      // },
    ],
    dataFieldList: ['bidSection', 'bidSection.id'],
    // page: {
    //   pageNum: 1,
    //   pageSize: 10,
    // },
    sorts: [
      {
        dir: 'desc',
        prop: 'bidSection.id',
      },
    ],
  },
});

export { columns, searchFormSchema, pageAndSort };
