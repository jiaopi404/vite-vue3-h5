import { renderTime } from '/@/components/Time';
import { BasicColumn, FormSchema } from '/@/components/Table';
import {
  lxTableColumnProjectBidsectionRender,
  lxTableColumnReportContract,
  lxTableColumnReportSupplierRender,
} from '/@/components/LxComponents';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
import { codeNameFilter, getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { getDictionaryByParentId, getCompetentDept } from '/@/api/demo/system';
const useConfigStoreData = useConfigStore();
const configStore = useConfigStoreWithOut();
export const roleListTableSchema: BasicColumn[] = [
  {
    title: '合同名称',
    dataIndex: 'conContract.name',
    width: 120,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnReportContract(record.conContract);
    },
  },
  {
    title: '合同编号',
    dataIndex: 'conContract.code',
    width: 120,
    fixed: 'left',
  },
  {
    title: '合同状态',
    dataIndex: 'conContract.status.name',
    width: 120,
    fixed: 'left',
  },
  {
    title: '合同金额',
    dataIndex: 'conContract.conAmount',
    width: 120,
    align: 'left',
    fixed: 'left',
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
    title: '合同类型',
    dataIndex: 'conContract.bidSection.project.projectType.name',
    width: 120,
  },
  {
    title: '项目名称',
    dataIndex: 'conContract.bidSection.proName',
    width: 120,
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
    width: 120,
  },
  {
    title: '中标供应商',
    dataIndex: 'conContract.successfulSupplier.name',
    width: 120,
    customRender: ({ record }) => {
      return lxTableColumnReportSupplierRender(
        record.conContract.bidSection.project,
        record.conContract.successfulSupplier,
      );
    },
  },
  {
    title: '中标日期',
    dataIndex: 'conContract.bidWinner.bidWinningDate',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.conContract.bidWinner?.bidWinningDate);
    },
  },
  {
    title: '合同主管部门',
    dataIndex: 'conContract.competentDept',
    width: 120,
    align: 'left',
    format: (_text, record) => {
      return codeNameFilter(record.conContract.competentDept);
    },
  },
  {
    title: '合同负责人',
    dataIndex: 'conContract.chargeUser.perName',
    width: 240,
    format: (_text, record) => {
      const mobile = getSecretMobile(
        record.conContract.chargeUser ? record.conContract.chargeUser.mobile : '',
      );
      const tel = record.conContract.chargeUser
        ? record.conContract.chargeUser.mobile
          ? `(${mobile})`
          : ''
        : '';
      const perName = record.conContract.chargeUser
        ? record.conContract.chargeUser.perName
          ? record.conContract.chargeUser.perName
          : ''
        : '';
      return `${perName}${tel}`;
    },
  },
  {
    title: '生成日期',
    dataIndex: 'conContract.addDateTime',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.conContract.addDateTime);
    },
  },
];

// 查询项表单
export const roleSearchFormSchema = (): FormSchema[] => {
  const orgId = useConfigStoreData.GET_CONFIG_BASEINFO.orgId;
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
      field: 'contractDep',
      label: '合同主管部门',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getCompetentDept,
        params: orgId,
        placeholder: '请选择合同主管部门',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
        resultField: 'competentDeptSelect',
        resultFormatter: (result) => {
          return result;
        },
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
      field: 'conAmount',
      label: '合同金额',
      component: 'LxInputNumberDouble',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入合同金额',
      },
    },
    {
      field: 'status',
      label: '合同状态',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: async (param) => {
          const data = await getDictionaryByParentId(param);
          const dataList = data.filter((item) => {
            return Number(item.code) < 5;
          });
          return dataList;
        },
        params: configStore.GET_CONFIG.configInfo?.configDictionary?.contractStatusId,
        placeholder: '请选择合同状态',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};
