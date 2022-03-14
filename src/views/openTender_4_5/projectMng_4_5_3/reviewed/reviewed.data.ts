import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
import {
  codeNameFilter,
  getBidSectionProNumber,
  getPersonNameFormatter,
} from '/@/utils/commonServe/businessUtil';
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnReportSupplierRender } from '/@/components/LxComponents';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 150,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'proNumber',
    width: 150,
    fixed: 'left',
    format: (_, record) => {
      return getBidSectionProNumber(record?.bidSection);
    },
  },
  {
    title: '项目标段',
    dataIndex: 'sort',
    width: 150,
    format: (_text, record) => {
      return record?.bidSection?.sort === 0 ? '单标段' : `第${record?.bidSection?.sort}标段`;
    },
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 120,
    format: (_text, record) => {
      return (
        record?.bidSection?.budgetAmount +
        (record?.bidSection?.project?.currencyType?.code === '1'
          ? '元'
          : record?.bidSection?.project?.currencyType?.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'bidSection.project.projectType.name',
    width: 120,
  },
  {
    title: '采购方式',
    dataIndex: 'bidSection.procurementMethod.name',
    width: 120,
  },
  {
    title: '申报部门',
    dataIndex: 'declareDept',
    width: 120,

    format: (_text, record) => {
      return codeNameFilter(record?.bidSection?.project?.declareDept);
    },
  },
  {
    title: '申报人',
    dataIndex: 'addUser',
    width: 120,
    format: (_text, record) => {
      return getPersonNameFormatter()(record?.bidSection?.project?.addUser);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record?.bidSection?.project?.addDateTime);
    },
  },
  {
    title: '是否废标',
    dataIndex: 'bidSection.ifAbandonedBid',
    width: 120,
    format: (_text) => {
      return _text ? '是' : '否';
    },
  },
  {
    title: '中标供应商',
    dataIndex: 'name',
    width: 120,
    customRender: ({ record }) => {
      return lxTableColumnReportSupplierRender(
        record?.bidSection?.bidWinner?.biddingCompany,
        record?.bidSection?.bidWinner?.biddingCompany,
      );
    },
  },
  {
    title: '中标金额',
    dataIndex: 'bidWinningAmount',
    width: 120,
    format: (_text, record) => {
      const bidWinningAmount = record?.bidSection?.bidWinner?.bidWinningAmount
        ? record?.bidSection?.bidWinner?.bidWinningAmount +
          (record?.bidSection?.project?.currencyType?.code === '1'
            ? '元'
            : record?.bidSection?.project?.currencyType?.name)
        : record?.bidSection?.bidWinner?.bidWinningAmount === 0
        ? record?.bidSection?.bidWinner?.bidWinningAmount +
          (record?.bidSection?.project?.currencyType?.code === '1'
            ? '元'
            : record?.bidSection?.project?.currencyType?.name)
        : '';
      return bidWinningAmount;
    },
  },
  {
    title: '完成日期',
    dataIndex: 'completeDate',
    width: 120,
    sorter: true,
    format: (_text, record) => {
      return renderTime(record?.bidSection?.completeDate);
    },
  },
];
export const searchFormSchema = (): FormSchema[] => {
  const ConfigStoreWithOut = useConfigStoreWithOut();
  const orgId = ConfigStoreWithOut.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'proName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入项目名称',
      },
    },
    {
      field: 'proNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入项目编号',
      },
    },
    {
      field: 'projectType',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: ConfigStoreWithOut.GET_CONFIG.configInfo?.configDictionary?.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'declareDept',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDepartmentTreeListByOrgId,
        params: orgId,
        placeholder: '请选择申报部门',
        resultField: 'data', // 接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
        replaceFields: {
          children: 'children',
          key: 'id',
          value: 'id',
          title: 'name',
        },
      },
    },
    {
      field: 'ifAbandonedBid',
      component: 'Select',
      label: '是否废标',
      colProps: { span: 8 },
      componentProps: {
        options: [
          {
            label: '是',
            value: 1,
          },
          {
            label: '否',
            value: 0,
          },
        ],
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择是否废标',
      },
    },
  ];
};
