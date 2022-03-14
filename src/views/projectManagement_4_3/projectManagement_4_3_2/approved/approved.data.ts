import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 240,
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
    title: '采购类型',
    dataIndex: 'projectType',
    width: 120,
    format: (_text, record) => {
      return record.projectType.name;
    },
  },
  {
    title: '计划使用时间',
    dataIndex: 'planUseTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.planUseTime);
    },
  },
  {
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.planPurchaseTime);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.addDateTime);
    },
  },
];
export const searchFormSchema = (): FormSchema[] => {
  const configStore = useConfigStoreWithOut();
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
        params: configStore.GET_CONFIG.configInfo?.configDictionary?.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};
