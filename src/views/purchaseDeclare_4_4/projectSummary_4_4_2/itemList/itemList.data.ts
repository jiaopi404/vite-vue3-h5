import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
const useConfigStoreData = useConfigStore();
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
    title: '项目编号',
    dataIndex: 'purchaseNumber',
    width: 120,
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
    dataIndex: 'projectType.name',
    width: 120,
  },
  {
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.planPurchaseTime);
    },
  },
  {
    title: '申报部门',
    dataIndex: 'declareDept.name',
    width: 120,
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
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.addDateTime);
    },
  },
];
export const searchFormSchema = (): FormSchema[] => {
  const configStore = useConfigStoreWithOut();
  const orgId = useConfigStoreData.GET_CONFIG_BASEINFO.orgId;
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
    {
      field: 'planPurchaseTime',
      label: '计划采购时间',
      component: 'DatePicker',
      colProps: { span: 8 },
    },
    {
      field: 'declareDept',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDepartmentTreeListByOrgId,
        params: orgId,
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
