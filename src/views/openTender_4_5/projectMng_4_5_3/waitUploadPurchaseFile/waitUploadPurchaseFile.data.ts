import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import {
  codeNameFilter,
  getBidSectionSortStr,
  getPersonNameFormatter,
} from '/@/utils/commonServe/businessUtil';
const configStore = useConfigStoreWithOut();
export const waitUploadPurchaseFileTableColumns: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'bidSection.proName',
    width: 250,
    // align: 'left',
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
    },
  },
  {
    title: '项目标段',
    dataIndex: 'a',
    width: 100,
    // align: 'left',
    fixed: 'left',
    format: (_, record) => {
      return getBidSectionSortStr(record.bidSection);
    },
  },
  {
    title: '预算金额',
    dataIndex: 'bidSection.budgetAmount',
    width: 100,
    // align: 'left',
    format: (_text, record) => {
      return (
        record.bidSection.budgetAmount +
        (record.bidSection.project.currencyType?.code === '1'
          ? '元'
          : record.bidSection.project.currencyType?.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'b',
    width: 80,
    // align: 'left',
    format: (_text, record) => {
      return record.bidSection.project.projectType?.name;
    },
  },
  {
    title: '采购形式',
    dataIndex: 'bb',
    width: 120,
    // align: 'left',
    format: (_text, record) => {
      return record.bidSection.organizationalForm?.name;
    },
  },
  {
    title: '采购方式',
    dataIndex: 'c',
    width: 120,
    // align: 'left',
    format: (_text, record) => {
      return record.bidSection.procurementMethod?.name;
    },
  },
  {
    title: '招标公司名称',
    dataIndex: 'd',
    width: 200,
    // align: 'left',
    format: (_text, record) => {
      return record.bidSection.biddingCompany?.name;
    },
  },
  {
    title: '业务联系人',
    dataIndex: 'e',
    width: 180,
    // align: 'left',
    format: (_text, record) => {
      const formatter = getPersonNameFormatter();
      return formatter(record.bidSection.biddingCompany?.user);
    },
  },
  {
    title: '申报部门',
    dataIndex: 'f',
    width: 150,
    // align: 'left',
    format: (_text, record) => {
      return codeNameFilter(record.bidSection.project.declareDept);
    },
  },
  {
    title: '申报人',
    dataIndex: 'g',
    width: 150,
    // align: 'left',
    format: (_text, record) => {
      return getPersonNameFormatter()(record.bidSection.project.addUser);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'h',
    width: 100,
    // align: 'left',
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.bidSection.addDateTime);
    },
  },
];
export const waitUploadPurchaseFileSearchFormSchema: FormSchema[] = [
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
