import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
// index.vue 主页面
// unit.data.ts  index。vue需要的 相关配置数据
// getDictionaryInfo()
export const columns = (): BasicColumn[] => [
  {
    title: '采购文件名称',
    dataIndex: 'content',
    width: 260,
    align: 'left',
    format: (_text, record) => {
      if (record.leafLevel == 3) {
        let reg = new RegExp('<[^>]+>', 'gi');
        record.content = record.content.replace(reg, '');
        record.content = record.content.replace(/(&nbsp;)/g, '');
      }
      return record.content;
    },
  },
  {
    title: '是否显示',
    dataIndex: 'ifShow',
    format: (_text, record) => {
      return record.ifShow === 0 ? '否' : '是';
    },
    width: 60,
  },
  {
    title: '是否可编辑',
    dataIndex: 'useMark',
    format: (_text, record) => {
      return record.useMark == 0 ? '否' : '是';
    },
    // slots:{},
    width: 60,
  },
  {
    title: '添加时间',
    dataIndex: 'addDateTime',
    width: 80,
    customRender: ({ record }) => {
      return renderTime(record.addDateTime);
    },
  },
];
// 查询参数
export const searchFormSchema = (): FormSchema[] => [
  {
    field: 'content',
    label: '采购文件名称',
    component: 'Input',
    componentProps: {
      showSearch: true,
      autoSubmitOnEnter: true,
      placeholder: '请输入采购名称',
    },
    colProps: { span: 8 },
  },
];
// 抽屉数据
export const formSchema = (): FormSchema[] => [
  {
    field: 'content',
    label: '采购文件名称',
    component: 'Input',
    required: true,
  },
  {
    field: 'content_text',
    label: '采购文件内容',
    component: 'Input',
    required: true,
    ifShow: () => {
      return false;
    },
  },
  {
    field: 'ifShow',
    label: '是否显示',
    required: true,
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: '否',
          value: 0,
        },
        {
          label: '是',
          value: 1,
        },
      ],
    },
    defaultValue: 1,
  },
  {
    field: 'useMark',
    label: '是否可编辑',
    component: 'Switch',
    required: true,
    defaultValue: 0,
    componentProps: {
      checkedValue: 1,
      unCheckedValue: 0,
    },
  },
];
