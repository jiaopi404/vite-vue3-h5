import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import {
  lxTableColumnProjectBidsectionRender,
  lxTableColumnReportContract,
} from '/@/components/LxComponents';
const configStore = useConfigStoreWithOut();
export const auditListTableScheam = (): BasicColumn[] => [
  {
    title: '合同名称',
    dataIndex: 'processObjectName',
    width: 150,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnReportContract({
        id: record.processObjectId,
        name: record.processObjectName,
      });
    },
  },
  {
    title: '合同编号',
    fixed: 'left',
    dataIndex: 'processObjectCode',
    width: 80,
  },
  {
    title: '合同类型',
    dataIndex: 'conContractType',
    width: 90,
    format: (_text, record) => {
      return record.conContractType;
    },
  },
  {
    title: '合同金额',
    dataIndex: 'amount',
    width: 100,
    sorter: true,
    format: (_text, record) => {
      return (
        record.amount + (record.currencyTypeName === '人民币' ? '元' : record.currencyTypeName)
      );
    },
  },
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 150,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(
        {
          proName: record.proName,
        },
        {
          id: record.bidSectionId,
        },
      );
    },
  },
  {
    title: '项目编号',
    dataIndex: 'purchaseNumber',
    width: 80,
  },
  {
    title: '中标供应商',
    dataIndex: 'successfulSupplier',
    width: 80,
  },
  {
    title: '中标日期',
    dataIndex: 'bidWinningDate',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.bidWinningDate);
    },
  },
  {
    title: '生成日期',
    dataIndex: 'conContractDate',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.conContractDate);
    },
  },
];
export const searchFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'processObjectName',
      label: '合同名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入合同名称',
      },
    },
    {
      field: 'processObjectCode',
      label: '合同编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入合同编号',
      },
    },
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
      field: 'purchaseNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入项目编号',
      },
    },
    {
      field: 'conContractType',
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
        // ranges: { Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] },
      },
    },
  ];
};
