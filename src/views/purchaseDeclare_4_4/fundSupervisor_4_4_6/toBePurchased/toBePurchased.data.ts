import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
//引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 160,
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
    width: 100,
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
    width: 100,
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod.name',
    width: 120,
  },
  {
    title: '项目状态',
    dataIndex: 'status.name',
    width: 120,
    // format: (_text, record) => {
    //   return projectType(record.status.code);
    // },
  },
  {
    title: '计划使用时间',
    dataIndex: 'planUseTime',
    width: 120,
    sorter: true,
    format: (_text, record) => {
      return renderTime(record.project.planUseTime);
    },
  },
  {
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 120,
    format: (_text, record) => {
      return renderTime(record.project.planPurchaseTime);
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
    width: 100,
  },
  {
    title: '申报人',
    dataIndex: 'AddUserId',
    width: 160,
    format: (_text, record) => {
      const mobile = getSecretMobile(record.project.addUser.mobile);
      const tel = record.project.addUser.mobile ? `(${mobile})` : '';
      const perName = record.project.addUser.perName ? record.project.addUser.perName : '';
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
      field: 'status',
      label: '项目状态',
      component: 'ApiSelect',
      componentProps: {
        api: async (param) => {
          const data = await getDictionaryByParentId(param);
          const dataList = data.filter((item) => {
            return Number(item.code) <= 24;
          });
          return dataList;
        },
        params: ConfigStoreWithOut.GET_CONFIG.configInfo?.configDictionary?.projectStatusId,
        placeholder: '请选择项目状态',
        labelField: 'name',
        valueField: 'code',
        showSearch: true,
        optionFilterProp: 'label',
      },
      colProps: { span: 8 },
    },
  ];
};
