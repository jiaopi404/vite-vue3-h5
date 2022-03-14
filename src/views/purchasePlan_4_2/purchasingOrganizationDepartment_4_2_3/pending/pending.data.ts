import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStore } from '/@/store/modules/config';
// 引入接口
import { getDictionaryByParentId } from '/@/api/demo/system';
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
const configStore = useConfigStore();
//列表展示项
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 200,
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
        record.budgetAmount + (record.currencyType.code === '1' ? '元' : record.currencyType.name)
      );
    },
  },
  {
    title: '计划使用时间',
    dataIndex: 'planUseTime',
    width: 90,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.planUseTime);
    },
  },
  {
    title: '申报部门',
    dataIndex: 'declareDept.name',
    width: 140,
  },
  {
    title: '申报人',
    dataIndex: 'AddUserId',
    width: 160,
    format: (_text, record) => {
      const mobile = getSecretMobile(record.addUser.mobile);
      return `${record.addUser.perName}(${mobile})`;
    },
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 80,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.addDateTime);
    },
  },
];
// 查询项
export const searchFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
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
      field: 'declareDept',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDepartmentTreeListByOrgId,
        params: orgId,
        showSearch: true,
        optionFilterProp: 'label',
        placeholder: '请选择申报部门',
        resultField: 'data', // 接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
        replaceFields: {
          children: 'children',
          key: 'id',
          value: 'id',
          title: 'name',
        },
      },
    },
  ];
};

// 抽屉
export const formSchema = (): FormSchema[] => {
  const configDictionary = configStore.GET_CONFIG.configInfo?.configDictionary;
  return [
    {
      field: 'planPurchaseTime',
      label: '计划采购时间',
      required: true,
      component: 'DatePicker',
      componentProps: {
        placeholder: '请输入计划采购时间',
      },
    },
    {
      field: 'planOrganizationalForm.id',
      label: '计划采购形式',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.organizationalFormId,
        placeholder: '请选择计划采购形式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'planProcurementMethod.id',
      label: '计划采购方式',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.purchaseMethodId,
        placeholder: '请选择计划采购方式',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
  ];
};
