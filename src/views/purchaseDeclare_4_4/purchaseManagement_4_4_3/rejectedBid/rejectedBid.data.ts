import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
// 初始化列表展示数据
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 80,
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record, record);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'proNumber',
    width: 80,
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 80,
    format: (_text, record) => {
      return (
        record.budgetAmount +
        (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'project.projectType.name',
    width: 80,
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod.name',
    width: 120,
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.project.addDateTime);
    },
  },
];
// 查询项
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
