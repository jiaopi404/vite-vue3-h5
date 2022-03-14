import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { lxTableColumnAcceptanceRecord } from '/@/components/LxComponents';
const configStore = useConfigStoreWithOut();
export const auditListTableScheam = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'processObjectName',
    width: 220,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnAcceptanceRecord(record, false, record.processObjectId);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'processObjectCode',
    width: 180,
    fixed: 'left',
  },
  {
    title: '预算金额',
    dataIndex: 'amount',
    width: 120,
    sorter: true,
    format: (_text, record) => {
      return (
        record.amount + (record.currencyTypeName === '人民币' ? '元' : record.currencyTypeName)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'projectTypeName',
    width: 90,
  },
  {
    title: '中标公司名称',
    dataIndex: 'biddingCompanyName',
    width: 180,
  },
  {
    title: '初验是否完成',
    dataIndex: 'ifBeforeAcceptance',
    width: 110,
    format: (_text, record) => {
      return record.ifBeforeAcceptance === '1' ? '是' : '否';
    },
  },
  {
    title: '验收人员',
    dataIndex: 'accUserNames',
    width: 150,
  },
  {
    title: '验收次数',
    dataIndex: 'frequency',
    width: 90,
    sorter: true,
  },
  {
    title: '验收日期',
    dataIndex: 'accDate',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.accDate);
    },
  },
];
export const searchFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'processObjectName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入项目名称',
      },
    },
    {
      field: 'processObjectCode',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入项目编号',
      },
    },
    {
      field: 'projectTypeName',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore?.GET_CONFIG_DICTIONRY?.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'name',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};
