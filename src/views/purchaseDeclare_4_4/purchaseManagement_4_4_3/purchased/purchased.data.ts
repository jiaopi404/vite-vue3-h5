import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
const configStore = useConfigStore();
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
// 初始化列表展示
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 120,
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record, record);
    },
    fixed: 'left'
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 120,
    format: (_text, record) => {
      return (
        record.budgetAmount +
        (record?.project?.currencyType?.code === '1' ? '元' : record?.project?.currencyType?.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'project.projectType.name',
    width: 120,
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod.name',
    width: 120,
  },
  {
    title: '申报部门',
    dataIndex: 'project.declareDept.name',
    width: 80,
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    format: (_text, record) => {
      return renderTime(record?.project?.addDateTime);
    },
  },
  {
    title: '中标供应商',
    dataIndex: 'SuccessfulSupplierId',
    width: 100,
    format: (_text, record) => {
      const name = record?.bidWinner?.biddingCompany?.name
        ? record?.bidWinner?.biddingCompany?.name
        : '';
      return name;
    },
  },
  {
    title: '中标代表人',
    dataIndex: 'bidWinner.perName',
    width: 180,
    format: (_text, record) => {
      const mobile = getSecretMobile(record?.bidWinner?.mobile)
        ? `(${getSecretMobile(record?.bidWinner?.mobile)})`
        : '';
      const perName = record?.bidWinner?.perName ? record?.bidWinner?.perName : '';
      return perName + mobile;
    },
  },
  {
    title: '中标金额',
    dataIndex: 'bidWinningAmount',
    width: 100,
    format: (_text, record) => {
      if (record?.bidWinner?.bidWinningAmount) {
        return (
          record?.bidWinner?.bidWinningAmount +
          (record?.project?.currencyType?.code === '1' ? '元' : record?.project?.currencyType?.name)
        );
      } else {
        return null;
      }
    },
  },
  {
    title: '中标日期',
    dataIndex: 'bidWinningDate',
    width: 100,
    sorter: true,
    format: (_text, record) => {
      const bidWinningDate = record?.bidWinner?.bidWinningDate;
      return renderTime(bidWinningDate);
    },
  },
];
// 查询项数据
export const searchFormSchema = (): FormSchema[] => {
  const ConfigStoreWithOut = useConfigStoreWithOut();
  const configDictionary = configStore?.GET_CONFIG.configInfo?.configDictionary;
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
      field: 'procurementMethod',
      label: '采购方式',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.purchaseMethodId,
        placeholder: '请选择采购方式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};
