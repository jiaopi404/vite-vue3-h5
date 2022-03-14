import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { lxTableColumnWinAfficheRender } from '/@/components/LxComponents';

const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'bidSection.proName',
    width: 120,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnWinAfficheRender(record.bidSection);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'bidSection.proNumber',
    width: 120,
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
    title: '中标金额',
    dataIndex: 'bidSection.bidWinningAmount',
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
    width: 80,
  },
  {
    title: '采购单位',
    dataIndex: 'bidSection.project.addUser.orgName',
    width: 120,
  },
  {
    title: '中标公司',
    dataIndex: 'supplierQuotation_registeredSupplier.successfulSupplier.name',
    width: 80,
  },
  {
    title: '发布日期',
    dataIndex: 'bidSection.project.releaseDate',
    width: 120,
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
  {
    field: 'releaseDate',
    label: '发布日期',
    component: 'RangePicker',
    colProps: { span: 8 },
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      // ranges: { Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] },
    },
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'supplierQuotation.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'supplierQuotation.status.code',
        type: 'equal',
        value: [2],
      },
      {
        param: 'supplierQuotation.registeredSupplier.successfulSupplier.user.id',
        type: 'equal',
        value: [userStore.getUserInfo.id.toString()],
      },
      {
        param: 'bidSection.procurementMethod.node',
        type: 'equal',
        value: [1],
      },
    ],

    dataFieldList: ['bidSection', 'supplierQuotation.registeredSupplier'],
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
