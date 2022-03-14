import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnReportSupplierRender } from '/@/components/LxComponents';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 120,
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record, record);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'proNumber',
    width: 120,
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 120,
    sorter: true,
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
    title: '计划使用时间',
    dataIndex: 'planUseTime',
    width: 120,
    sorter: true,
    format: (_text, record) => {
      return renderTime(record?.project?.planUseTime);
    },
  },
  {
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 120,
    format: (_text, record) => {
      return renderTime(record?.project?.planPurchaseTime);
    },
  },
  {
    title: '经费类别',
    dataIndex: 'fundsCategory.name',
    width: 100,
  },
  {
    title: '申报部门',
    dataIndex: 'project.declareDept.name',
    width: 80,
  },
  {
    title: '申报人',
    dataIndex: 'AddUserId',
    width: 160,
    format: (_text, record) => {
      const mobile = getSecretMobile(record?.project?.addUser?.mobile);
      const tel = record?.project?.addUser?.mobile ? `(${mobile})` : '';
      const perName = record?.project?.addUser?.perName ? record?.project?.addUser?.perName : '';
      return `${perName}${tel}`;
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
  {
    title: '是否废标',
    dataIndex: 'ifAbandonedBid',
    width: 120,
    format: (_text) => {
      return _text ? '是' : '否';
    },
  },
  {
    title: '中标公司名称',
    dataIndex: 'name',
    width: 120,
    customRender: ({ record }) => {
      return lxTableColumnReportSupplierRender(
        record?.bidWinner?.biddingCompany,
        record?.bidWinner?.biddingCompany,
      );
    },
  },
  {
    title: '中标金额',
    dataIndex: 'bidWinningAmount',
    width: 120,
    sorter: true,
    format: (_text, record) => {
      const bidWinningAmount = record?.bidWinner?.bidWinningAmount
        ? record?.bidWinner?.bidWinningAmount +
          (record.project.currencyType?.code === '1' ? '元' : record.project.currencyType?.name)
        : record?.bidWinner?.bidWinningAmount === 0
        ? record?.bidWinner?.bidWinningAmount +
          (record.project.currencyType?.code === '1' ? '元' : record?.project?.currencyType?.name)
        : '';
      return bidWinningAmount;
    },
  },
  {
    title: '完成日期',
    dataIndex: 'completeDate',
    width: 120,
    sorter: true,
    format: (_text, record) => {
      return renderTime(record.completeDate);
    },
  },
];
export const searchFormSchema = (): FormSchema[] => {
  const ConfigStoreWithOut = useConfigStoreWithOut();
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
      field: 'proNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入项目编号',
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
      field: 'planUseTime',
      label: '计划使用时间',
      component: 'DatePicker',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请选择计划使用时间',
      },
    },
    {
      field: 'ifAbandonedBid',
      component: 'Select',
      label: '是否废标',
      colProps: { span: 8 },
      componentProps: {
        options: [
          {
            label: '是',
            value: 1,
          },
          {
            label: '否',
            value: 0,
          },
        ],
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择是否废标',
      },
    },
  ];
};
