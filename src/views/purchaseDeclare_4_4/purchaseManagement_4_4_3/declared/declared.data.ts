import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { projectType } from './projectType';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
// 初始化列表展示数据
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
    width: 80,
    format: (_text, record) => {
      return (
        record.budgetAmount +
        (record?.currencyType?.code === '1' ? '元' : record?.currencyType?.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'projectType.name',
    width: 80,
  },
  {
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 90,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record?.planPurchaseTime);
    },
  },
  {
    title: '项目状态',
    dataIndex: 'statusId',
    width: 80,
    format: (_text, record) => {
      return projectType(record?.status?.code);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record?.addDateTime);
    },
  },
];
// 查询项数据
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
