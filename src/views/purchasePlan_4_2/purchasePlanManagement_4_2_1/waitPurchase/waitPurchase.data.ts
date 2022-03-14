import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';

export const columns: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 120,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectNameRender(record);
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
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.addDateTime);
    },
  },
];
columns.forEach((item) => {
  item.align = 'left';
});
export const searchFormSchema: FormSchema[] = [
  {
    field: 'proName',
    label: '项目名称',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入项目名称',
    },
  },
];
