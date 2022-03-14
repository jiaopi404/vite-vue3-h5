import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStore } from '/@/store/modules/config';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import {
  codeNameFilter,
  getBidSectionProNumber,
  getPersonNameFormatter,
} from '/@/utils/commonServe/businessUtil';
//引入接口
// 引入接口
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
const useConfigStoreData = useConfigStore();
export const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 240,
    // format: (_text, record) => {
    //   return record?.returnBidSection?.proName;
    // },
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(
        record?.returnBidSection,
        record?.returnBidSection,
      );
    },
    fixed: 'left'
  },
  {
    title: '项目编号',
    dataIndex: 'purchaseNumber',
    width: 120,
    format: (_text, record) => {
      return getBidSectionProNumber(record?.returnBidSection);
    },
    fixed: 'left'
  },
  {
    title: '项目标段',
    dataIndex: 'sort',
    width: 100,
    format: (_text, record) => {
      if (record?.returnBidSection?.sort === 0) {
        return '单标段';
      } else {
        return `第${record?.returnBidSection?.sort}标段`;
      }
    },
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 120,
    format: (_text, record) => {
      // return record?.returnBidSection?.budgetAmount;

      return (
        record?.returnBidSection?.budgetAmount +
        (record?.returnBidSection?.project?.currencyType?.code === '1'
          ? '元'
          : record?.returnBidSection?.project?.currencyType?.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'projectType',
    width: 80,
    format: (_text, record) => {
      return record?.returnBidSection?.project?.projectType?.name;
    },
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod',
    width: 100,
    format: (_text, record) => {
      return record?.returnBidSection?.procurementMethod?.name;
    },
  },
  {
    title: '申报部门',
    dataIndex: 'declareDept',
    width: 120,
    format: (_text, record) => {
      return codeNameFilter(record?.returnBidSection?.project?.declareDept);
    },
  },
  {
    title: '申报人',
    dataIndex: 'addUser',
    width: 180,
    format: (_text, record) => {
      return getPersonNameFormatter()(record?.returnBidSection?.project?.addUser);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record?.returnBidSection?.addDateTime);
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
      field: 'purchaseNumber',
      label: '项目编号',
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
// 抽屉数据
export const formSchema = (): FormSchema[] => [
  {
    field: 'registrationInstructions',
    label: '录入其他参会评审人员',
    component: 'InputTextArea',
    required: true,
    labelWidth: 160,
    componentProps: {
      placeholder: '最大可输入1000个字符',
      autoSize: { minRows: 8, maxRows: 12 },
      showCount: true,
      maxlength: 1000,
    },
  },
];
