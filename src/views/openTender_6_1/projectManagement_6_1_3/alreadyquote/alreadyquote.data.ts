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

const columns = (): BasicColumn[] => [
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
    title: '采购单位',
    dataIndex: 'bidSection.project.addUser.orgName',
    width: 120,
  },
  {
    title: '采购类型',
    dataIndex: 'bidSection.project.projectType.name',
    width: 80,
  },
  {
    title: '报价开始时间',
    dataIndex: 'bidSection.project.quoteStartTime',
    width: 120,
    customRender: ({ text }) => {
      return renderTime(text, true);
    },
  },
  {
    title: '报价截止时间',
    dataIndex: 'bidSection.project.quoteEndTime',
    width: 120,
    customRender: ({ text }) => {
      return renderTime(text, true);
    },
  },
  {
    title: '剩余时间',
    dataIndex: 'surplusTime',
    width: 120,
    slots: { customRender: 'surplusTime' },
    sorter: true,
  },
  {
    title: '发布日期',
    dataIndex: 'bidSection.project.releaseDate',
    width: 100,
    customRender: ({ text }) => {
      return renderTime(text);
    },
    sorter: true,
  },
  {
    title: '报价金额',
    dataIndex: 'supplierQuotation.quotedAmount',
    width: 100,
    format: (text, record) => {
      if (text) {
        return (
          text +
          (record.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.bidSection.project.currencyType.name)
        );
      } else {
        return '';
      }
    },
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
    },
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => {
  console.log('===userStore.getUserInfo===:', userStore.getUserInfo);
  return {
    hqlPageAndSortSumDto: {
      ifCustomHql: true,
      queryList: [
        {
          param: 'bidSection.ifDelete',
          type: 'equal',
          value: [0],
        },
        {
          param: 'bidSection.procurementMethod.code',
          type: 'in',
          value: [5, 6],
        },
        {
          param: 'bidSection.status.code',
          type: 'in',
          value: [18, 19, 20],
        },
        {
          param: 'supplierQuotation.registeredSupplier.successfulSupplier.user.id',
          type: 'equal',
          value: [userStore.getUserInfo.id.toString()],
        },
      ],
      dataFieldList: [
        'bidSection',
        'supplierQuotation',
        // 'supplierQuotation.id',
        // 'supplierQuotation.ifCancelQuotation',
        'supplierQuotation.registeredSupplier',
      ],
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
  };
};

export { columns, searchFormSchema, pageAndSort };
