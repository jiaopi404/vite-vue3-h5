import { toRaw } from 'vue';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
import {
  lxTableColumnProjectBidsectionRender,
  lxTableColumnReportSupplierRender,
} from '/@/components/LxComponents';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import {
  codeNameFilter,
  getBidSectionProNumber,
  getPersonNameFormatter,
} from '/@/utils/commonServe/businessUtil';
import { getNamePatternRule } from '/@/utils/helper/validateRuleHelper';

const configStore = useConfigStoreWithOut();
export const WaitReviewTableColumns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'bidSection.proName',
    width: 150,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
    },
    fixed: 'left'
  },
  {
    title: '项目编号',
    dataIndex: 'bidSection.proNumber',
    width: 150,
    align: 'left',
    format: (_, record) => {
      return getBidSectionProNumber(record?.bidSection);
    },
    fixed: 'left'
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
    dataIndex: 'project.addDateTime',
    width: 120,
    sorter: true,
    align: 'left',
    customRender: ({ record }) => {
      return renderTime(record.bidSection.addDateTime);
    },
  },
];
export const reviewInfoFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'ifAbandonedBid',
      label: '评审结果',
      component: 'RadioGroup',
      defaultValue: 0,
      colProps: { span: 24 },
      componentProps: {
        options: [
          {
            label: '成交',
            value: 0,
          },
          {
            label: '废标',
            value: 1,
          },
        ],
      },
      required: true,
    },
    {
      field: 'resultNotice',
      label: '结果说明',
      component: 'InputTextArea',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '最大可输入5000个字符',
      },
      rules: [
        {
          message: '请输入结果说明',
          trigger: 'blur',
        },
        getNamePatternRule(5000),
      ],
    },
    {
      field: 'resultNoticeUrl',
      label: '结果公告原文链接',
      component: 'Input',
      colProps: { span: 24 },
      componentProps: {
        min: 0,
        max: 1000,
        placeholder: '请输入结果公告原文链接',
        precision: 2,
      },
      rules: [
        {
          pattern: new RegExp(
            `(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]`,
            'g',
          ),
          message: '链接格式不正确',
          trigger: ['change', 'blur'],
        },
      ],
    },
  ];
};
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
export const bidSupplierTableColumns: BasicColumn[] = [
  {
    title: '公司名称',
    dataIndex: 'returnBidSection.registeredSupplier.successfulSupplier.name',
    width: 100,
    align: 'left',
    // customRender: ({ record }) => {
    //   return lxTableColumnReportSupplierRender(
    //     record.returnBidSection.project,
    //     record.returnBidSection.registeredSupplier.successfulSupplier,
    //   );
    // },
  },
  {
    title: '综合得分',
    dataIndex: 'returnBidSection.score',
    width: 80,
    align: 'left',
  },
  {
    title: '报价金额',
    dataIndex: 'returnBidSection.quotedAmount',
    width: 80,
    align: 'left',
    format: (_text, record) => {
      return `${toRaw(record).returnBidSection.quotedAmount}${
        toRaw(record).returnBidSection.bidSection.project.currencyType.code === '1'
          ? '元'
          : toRaw(record).returnBidSection.bidSection.project.currencyType.name
      }`;
    },
  },
  {
    title: '业务联系人',
    dataIndex: 'returnBidSection.registeredSupplier',
    width: 100,
    format: (_text, record) => {
      return getPersonNameFormatter()(toRaw(record).returnBidSection.registeredSupplier);
    },
  },
  {
    title: '推荐次数',
    dataIndex: 'returnBidSection.recommendedTimes',
    width: 80,
    format: (_text, record) => {
      return toRaw(record).returnBidSection.bidSection.procurementMethod.node === '1'
        ? toRaw(record).returnBidSection.recommendedTimes
          ? toRaw(record).returnBidSection.recommendedTimes + '次'
          : '0 次'
        : '';
    },
  },
  {
    title: '供应商注册日期',
    dataIndex: 'biddingCompany.regdate',
    width: 80,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.returnBidSection.registeredSupplier.successfulSupplier.regdate);
    },
  },
];
bidSupplierTableColumns.forEach((item) => {
  item.align = 'left';
});
export const bidSupplierFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'bidWinningAmount',
      label: '中标金额',
      component: 'Input',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '请输入中标金额',
        disabled: true,
        precision: 2,
      },
      required: true,
    },
    {
      field: 'bidWinningDate',
      label: '中标日期',
      component: 'DatePicker',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '请选择中标日期',
        disabledDate(current) {
          return current > Date.now();
        },
        format: 'YYYY-MM-DD',
      },
      required: true,
    },
  ];
};
