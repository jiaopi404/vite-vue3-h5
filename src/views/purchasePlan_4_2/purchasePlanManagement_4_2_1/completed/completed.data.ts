import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
// 初始化列表数据
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 260,
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
// 查询项数据
export const searchFormSchema = (): FormSchema[] => [
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
    field: 'planUseTime',
    label: '计划使用时间',
    component: 'DatePicker',
    colProps: { span: 10 },
    componentProps: {
      autoSubmitOnEnter: true,
      placeholder: '请选择计划使用时间',
    },
  },
];
