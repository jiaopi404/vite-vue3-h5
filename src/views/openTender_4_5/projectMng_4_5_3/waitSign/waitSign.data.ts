import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import {
  codeNameFilter,
  getBidSectionProNumber,
  getPersonNameFormatter,
} from '/@/utils/commonServe/businessUtil';

const configStore = useConfigStoreWithOut();
export const WaitSignTableColumns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'bidSection.proName',
    width: 150,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
    },
    fixed: 'left'
  },
  {
    title: '项目编号',
    dataIndex: 'bidSection.proNumber',
    width: 150,
    align: 'left',
    format: (_, record) => {
      return getBidSectionProNumber(record?.bidSection);
    },
    fixed: 'left'
  },
  {
    title: '项目标段',
    dataIndex: 'bidSection.sort',
    width: 150,
    align: 'left',
    format: (_text, record) => {
      return record.bidSection.sort === 0 ? '单标段' : `第${record.bidSection.sort}标段`;
    },
  },
  {
    title: '预算金额',
    dataIndex: 'bidSection.budgetAmount',
    width: 120,
    align: 'left',
    format: (_text, record) => {
      return (
        record.bidSection.budgetAmount +
        (record.bidSection.project.currencyType?.code === '1'
          ? '元'
          : record.bidSection.project.currencyType?.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'bidSection.project.projectType.name',
    width: 120,
    align: 'left',
  },
  {
    title: '采购方式',
    dataIndex: 'bidSection.procurementMethod.name',
    width: 120,
    align: 'left',
  },
  {
    title: '中标供应商',
    dataIndex: 'bidSection.bidWinner.biddingCompany.name',
    width: 120,
    align: 'left',
  },
  {
    title: '中标代表人',
    dataIndex: 'bidSection.bidWinner',
    width: 120,
    align: 'left',
    format: (_text, record) => {
      return getPersonNameFormatter()(record.bidSection.bidWinner);
    },
  },
  {
    title: '中标金额',
    dataIndex: 'bidSection.bidWinner.bidWinningAmount',
    width: 120,
    align: 'left',
    format: (_text, record) => {
      return (
        record.bidSection.bidWinner.bidWinningAmount +
        (record.bidSection.project.currencyType?.code === '1'
          ? '元'
          : record.bidSection.project.currencyType?.name)
      );
    },
  },
  {
    title: '中标日期',
    dataIndex: 'bidWinner.bidWinningDate',
    width: 120,
    sorter: true,
    align: 'left',
    customRender: ({ record }) => {
      return renderTime(record.bidSection.bidWinner.bidWinningDate);
    },
  },
];
export const WaitSignSearchFormSchema = (): FormSchema[] => {
  return [
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
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG.configInfo?.configDictionary?.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'purchaseMethod',
      label: '采购方式',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG.configInfo?.configDictionary?.purchaseMethodId,
        placeholder: '请选择采购方式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};
