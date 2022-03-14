import { toRaw } from 'vue';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { getAllSelectByBidSectionId } from '/@/api/projectManagement/proMngWaitReviewApi';
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import {
  codeNameFilter,
  getBidSectionProNumber,
  getPersonNameFormatter,
} from '/@/utils/commonServe/businessUtil';
import { getNamePatternNoSpaceRule, getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
const configStore = useConfigStoreWithOut();
export const WaitReviewTableColumns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 150,
    // align: 'left',
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'bidSection.proNumber',
    width: 150,
    // align: 'left',
    fixed: 'left',
    format: (_, record) => {
      return getBidSectionProNumber(record?.bidSection);
    },
  },
  {
    title: '项目标段',
    dataIndex: 'bidSection.sort',
    width: 150,
    align: 'left',
    format: (_text, record) => {
      return record.bidSection.sort === 0 ? '单标段' : `第${record.bidSection.sort}标段`;
    },
  },
  {
    title: '预算金额',
    dataIndex: 'bidSection.budgetAmount',
    width: 120,
    align: 'left',
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
    dataIndex: 'bidSection.project.projectType.name',
    width: 120,
    align: 'left',
  },
  {
    title: '采购方式',
    dataIndex: 'bidSection.procurementMethod.name',
    width: 120,
    align: 'left',
  },
  {
    title: '申报部门',
    dataIndex: 'bidSection.project.declareDept',
    width: 120,
    align: 'left',
    format: (_text, record) => {
      return codeNameFilter(record.bidSection.project.declareDept);
    },
  },
  {
    title: '申报人',
    dataIndex: 'bidSection.project.addUser',
    width: 120,
    align: 'left',
    format: (_text, record) => {
      return getPersonNameFormatter()(record.bidSection.project.addUser);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'bidSection.project.addDateTime',
    width: 120,
    align: 'left',
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.bidSection.project.addDateTime);
    },
  },
];
export const WaitReviewSearchFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
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
      field: 'proNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入项目编号',
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
    {
      field: 'declareDept',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 6 },
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
export const reviewInfoFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'proName',
      label: '供应商名称',
      component: 'ApiSelect',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '请选择供应商名称',
        labelField: 'perName',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      required: true,
    },
    {
      field: 'quotedAmount',
      label: '报价金额',
      component: 'InputNumber',
      colProps: { span: 24 },
      defaultValue: 0,
      componentProps: () => ({
        min: 0,
        max: 1000000000,
        placeholder: '请输入报价金额',
        precision: 2,
        onChange: (e: any) => {},
      }),
      required: true,
    },
    {
      field: 'score',
      label: '综合得分',
      component: 'InputNumber',
      colProps: { span: 24 },
      // defaultValue: 0,
      componentProps: () => ({
        min: 0,
        max: 1000,
        placeholder: '请输入综合得分',
        precision: 2,
        disabled: true,
      }),
    },
    {
      field: 'description',
      label: '评审说明',
      component: 'InputTextArea',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '最大可输入5000个字符',
      },
      rules: [getNamePatternRule(5000)],
    },
  ];
};
export const reviewInfoTableColumns: BasicColumn[] = [
  {
    title: '供应商名称',
    dataIndex: 'supplierQuotation.registeredSupplier.successfulSupplier.name',
    width: 100,
    align: 'left',
  },
  {
    title: '报价次数',
    dataIndex: 'supplierQuotation.quotedTimes',
    width: 80,
    align: 'left',
  },
  {
    title: '报价金额',
    dataIndex: 'supplierQuotation.quotedAmount',
    width: 80,
    align: 'left',
    format: (_text, record) => {
      return (
        toRaw(record).supplierQuotation.quotedAmount +
        (toRaw(record).supplierQuotation.bidSection.project.currencyType.code === '1'
          ? '元'
          : toRaw(record).supplierQuotation.bidSection.project.currencyType.name)
      );
    },
  },
  {
    title: '是否无效报价',
    dataIndex: 'supplierQuotation.invalidQuotation',
    width: 100,
    format: (_text, record) => {
      return toRaw(record).supplierQuotation.invalidQuotation === 0 ? '否' : '是';
    },
  },
  {
    title: '评审状态',
    dataIndex: 'supplierQuotation.status.name',
    width: 80,
  },
  {
    title: '综合得分',
    dataIndex: 'supplierQuotation.score',
    width: 80,
  },
  {
    title: '评审说明',
    dataIndex: 'supplierQuotation.description',
    width: 80,
  },
];
reviewInfoTableColumns.forEach((item) => {
  item.align = 'left';
});
