import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { projectType } from './projectType';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
const configStore = useConfigStore();
const ConfigStoreWithOut = useConfigStoreWithOut();
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
// 初始列表数据展示
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 120,
    customRender: ({ record }) => {
      return lxTableColumnProjectNameRender({
        id: record.id,
        proName: record.proName,
      });
    },
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 120,
    format: (_text, record) => {
      return (
        record.budgetAmount + (record.currencyType.code === '1' ? '元' : record.currencyType.name)
      );
    },
  },
  {
    title: '项目状态',
    dataIndex: 'status.name',
    width: 120,
  },
  {
    title: '采购类型',
    dataIndex: 'projectType.name',
    width: 100,
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod.name',
    width: 120,
  },
  {
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 100,
    sorter: true,
    format: (_text, record) => {
      return renderTime(record.planPurchaseTime);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    format: (_text, record) => {
      return renderTime(record.addDateTime);
    },
  },
];
// 查询项数据
export const searchFormSchema = (): FormSchema[] => {
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
