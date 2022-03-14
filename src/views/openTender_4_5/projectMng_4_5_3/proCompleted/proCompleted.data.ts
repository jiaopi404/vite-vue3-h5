import { getDictionaryByParentId } from '/@/api/demo/system';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { codeNameFilter, getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';

const configStore = useConfigStoreWithOut();
export const proCompletedTableColumns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'project.proName',
    width: 120,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectNameRender(record.project);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'project.purchaseNumber',
    width: 120,
    align: 'left',
  },
  {
    title: '预算金额',
    dataIndex: 'project.budgetAmount',
    align: 'left',
    width: 120,
    format: (_text, record) => {
      return (
        record.project.budgetAmount +
        (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'project.projectType',
    align: 'left',
    width: 120,
    format: (_text, record) => {
      return record.project.projectType?.name;
    },
  },
  {
    title: '是否多标段',
    dataIndex: 'project.ifMultiBidSection',
    align: 'left',
    width: 100,
    format: (_text, record) => {
      return record.project.ifMultiBidSection === 1 ? '是' : '否';
    },
  },
  {
    title: '采购方式',
    dataIndex: 'project.procurementMethod.name',
    align: 'left',
    width: 100,
  },
  // {
  //   title: '组织形式',
  //   dataIndex: 'project.planPurchaseTime',
  //   width: 100,
  //   customRender: ({ record }) => {
  //     return record.project.planPurchaseTime ? renderTime(record.project.planPurchaseTime) : '';
  //   },
  // },
  {
    title: '项目申报部门',
    dataIndex: 'project.declareDept',
    align: 'left',
    width: 100,
    format: (_text, record) => {
      return codeNameFilter(record.project.declareDept);
    },
  },
  {
    title: '申报人及电话',
    dataIndex: 'project.addUser',
    align: 'left',
    width: 160,
    format: (_text, record) => {
      return getPersonNameFormatter()(record?.project?.addUser);
    },
  },
  {
    title: '项目负责人及电话',
    dataIndex: 'project.proChargeUser',
    align: 'left',
    width: 160,
    format: (_text, record) => {
      return getPersonNameFormatter()(record?.project?.proChargeUser);
    },
  },
  {
    title: '中标金额',
    dataIndex: 'project.bidWinningAmount',
    align: 'left',
    width: 100,
    sorter: true,
    format: (_text, record) => {
      return record.project.bidWinningAmount
        ? record.project.bidWinningAmount +
            (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
        : '';
    },
  },
];
export const proCompletedSearchFormSchema = (): FormSchema[] => {
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
      field: 'purchaseNumber',
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
