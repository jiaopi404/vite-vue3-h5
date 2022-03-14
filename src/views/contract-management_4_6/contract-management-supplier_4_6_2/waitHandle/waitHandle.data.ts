import { getDictionaryByParentId } from '/@/api/demo/system';
import {
  lxTableColumnProjectBidsectionRender,
  lxTableColumnReportContract,
} from '/@/components/LxComponents';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
export const WaitHandleTableColumns = (): BasicColumn[] => [
  {
    title: '合同名称',
    dataIndex: 'conContract.name',
    width: 150,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnReportContract(record.conContract);
    },
    fixed: 'left'
  },
  {
    title: '合同编号',
    dataIndex: 'conContract.code',
    width: 150,
    align: 'left',
    fixed: 'left'
  },
  {
    title: '合同类型',
    dataIndex: 'conContract.bidSection.project.projectType.name',
    width: 150,
    align: 'left',
  },
  {
    title: '合同金额',
    dataIndex: 'conContract.conAmount',
    width: 120,
    align: 'left',
    sorter: true,
    format: (_text, record) => {
      return (
        record.conContract.conAmount +
        (record.conContract.bidSection.project.currencyType?.code === '1'
          ? '元'
          : record.conContract.bidSection.project.currencyType?.name)
      );
    },
  },
  {
    title: '项目名称',
    dataIndex: 'conContract.bidSection.proName',
    width: 150,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(
        record.conContract.bidSection,
        record.conContract.bidSection,
      );
    },
  },
  {
    title: '项目编号',
    dataIndex: 'conContract.bidSection.proNumber',
    width: 150,
    align: 'left',
  },
  {
    title: '中标供应商',
    dataIndex: 'conContract.successfulSupplier.name',
    width: 120,
    align: 'left',
  },
  {
    title: '中标金额',
    dataIndex: 'bidWinner.bidWinningAmount',
    width: 120,
    align: 'left',
    sorter: true,
    format: (_text, record) => {
      return (
        record.conContract.bidWinner.bidWinningAmount +
        (record.conContract.bidSection.project.currencyType?.code === '1'
          ? '元'
          : record.conContract.bidSection.project.currencyType?.name)
      );
    },
  },
  {
    title: '中标日期',
    dataIndex: 'bidWinner.bidWinningDate',
    width: 120,
    align: 'left',
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.conContract.bidWinner.bidWinningDate);
    },
  },
  {
    title: '生成日期',
    dataIndex: 'conContract.addDateTime',
    width: 120,
    align: 'left',
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.conContract.addDateTime);
    },
  },
];
export const WaitHandleSearchFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
  return [
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
      field: 'purchaseType',
      label: '合同类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG.configInfo?.configDictionary?.projectTypeId,
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
          return current > Date.now();
        },
      },
    },
  ];
};
