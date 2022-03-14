import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnProjectNameRender } from '/@/components/LxComponents';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { codeNameFilter, getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
const configStore = useConfigStoreWithOut();
export const proMngWaitPurchaseTableColumns: BasicColumn[] = [
  // {
  //   title: '是否计划内',
  //   dataIndex: 'projectAdditionPhase',
  //   width: 120,
  //   align: 'left',
  //   format: (_text, record) => {
  //     return record.projectAdditionPhase !== 1 ? '计划外' : '计划内';
  //   },
  // },
  {
    title: '项目名称',
    dataIndex: 'project.proName',
    width: 250,
    customRender: ({ record }) => {
      return lxTableColumnProjectNameRender(record.project);
    },
    fixed: 'left'
    // align: 'left',
  },
  {
    title: '预算金额',
    dataIndex: 'project.budgetAmount',
    width: 100,
    format: (_text, record) => {
      return (
        record.project.budgetAmount +
        (record.project.currencyType?.code === '1' ? '元' : record.project.currencyType?.name)
      );
    },
  },
  // {
  //   // 此项目状态非彼项目状态
  //   title: '项目状态',
  //   dataIndex: 'status',
  //   width: 120,
  //   format: (_text, record) => {
  //     return record.status?.name;
  //   },
  // },
  // {
  //   title: '货币类型',
  //   dataIndex: 'project.currencyType',
  //   width: 120,
  //   format: (_text, record) => {
  //     return record.project.currencyType?.name;
  //   },
  // },
  {
    title: '采购类型',
    dataIndex: 'project.projectType',
    width: 80,
    format: (_text, record) => {
      return record.project.projectType?.name;
    },
  },
  {
    title: '采购方式',
    dataIndex: 'project.procurementMethod',
    width: 120,
    format: (_text, record) => {
      return record.project.procurementMethod?.name;
    },
  },
  {
    title: '申报部门',
    dataIndex: 'project.declareDept',
    width: 120,
    format: (_text, record) => {
      return codeNameFilter(record.project.declareDept);
    },
  },
  {
    title: '申报人',
    dataIndex: 'project.addUser',
    width: 160,
    format: (_text, record) => {
      return getPersonNameFormatter()(record.project.addUser);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'project.addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.project.addDateTime);
    },
  },
  {
    title: '招标公司',
    dataIndex: 'biddingCompany.name',
    width: 200,
    format: (_, record) => {
      return record.biddingCompany?.name;
    },
  },
  {
    title: '业务联系人',
    dataIndex: 'biddingCompany.user',
    width: 180,
    format: (_, record) => {
      return getPersonNameFormatter()(record.biddingCompany?.user);
    },
  },
];
// proMngWaitPurchaseTableColumns.forEach((item) => {
//   item.align = 'center';
// });
export const proMngWaitPurchaseSearchFormSchema: FormSchema[] = [
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
    field: 'purchaseType',
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
  // {
  //   field: 'procurementMethod',
  //   label: '采购方式',
  //   component: 'ApiSelect',
  //   colProps: { span: 8 },
  //   componentProps: {
  //     api: getDictionaryByParentId,
  //     params: configStore.GET_CONFIG.configInfo?.configDictionary?.purchaseMethodId,
  //     placeholder: '请选择采购方式',
  //     labelField: 'name',
  //     valueField: 'id',
  //     showSearch: true,
  //     optionFilterProp: 'label',
  //   },
  // },
];
