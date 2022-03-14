import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
// 引入接口
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
const configStore = useConfigStoreWithOut();
const useConfigStoreData = useConfigStore();

// 查询参数
export const purchasedSearchFormSchema = (): FormSchema[] => {
  const orgId = useConfigStoreData.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'proName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入项目名称',
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
    {
      field: 'projectType',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'code',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'budgetAmount',
      label: '预算金额',
      component: 'LxInputNumberDouble',
      colProps: { span: 8 },
      componentProps: {
        min: 0.0,
        max: 1000000000.0,
        step: 0.01,
      },
    },
    {
      field: 'status',
      label: '项目状态',
      component: 'ApiSelect',
      componentProps: {
        // api: getDictionaryByParentId,
        api: async (param) => {
          const data = await getDictionaryByParentId(param);
          const dataList = data.filter((item) => {
            return Number(item.code) <= 15;
          });
          console.log('dataList: ', dataList);
          return dataList;
        },
        params: configStore.GET_CONFIG.configInfo?.configDictionary?.projectStatusId,
        placeholder: '请选择项目状态',
        labelField: 'name',
        valueField: 'code',
        showSearch: true,
        optionFilterProp: 'label',
      },
      colProps: { span: 8 },
    },
    {
      field: 'planPurchaseTime',
      label: '计划采购时间',
      component: 'RangePicker',
      colProps: { span: 8 },
    },
  ];
};

// 表格数据
export const purchasedTableScheam = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 130,
    // 项目报表
    customRender: ({ record }) => {
      return lxTableColumnProjectNameRender(record);
    },
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 70,
    format: (_text, record) => {
      return (
        record.budgetAmount + (record.currencyType.code === '1' ? '元' : record.currencyType.name)
      );
    },
  },
  {
    title: '项目状态',
    dataIndex: 'status.name',
    width: 110,
  },
  {
    title: '采购类型',
    dataIndex: 'projectType.name',
    width: 70,
    format: (_text, record) => {
      return record.projectType?.name;
    },
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod.name',
    width: 80,
  },
  {
    title: '采购形式',
    dataIndex: 'organizationalForm.name',
    width: 80,
  },
  {
    title: '计划采购时间',
    dataIndex: 'planPurchaseTime',
    width: 130,
    sorter: true,
    customRender: ({ record }) => {
      return record.planPurchaseTime ? renderTime(record.planPurchaseTime) : '';
    },
  },
  {
    title: '申报部门',
    dataIndex: 'declareDept.name',
    width: 100,
  },
  {
    title: '项目负责人',
    dataIndex: 'proChargeUser',
    width: 110,
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
