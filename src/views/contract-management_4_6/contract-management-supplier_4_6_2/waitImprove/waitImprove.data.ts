import { toRaw } from 'vue';
import { getDictionaryByParentId } from '/@/api/demo/system';
import {
  lxTableColumnProjectBidsectionRender,
  lxTableColumnReportContract,
} from '/@/components/LxComponents';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { toThousand } from '/@/utils/commonServe/common';
import { getNamePatternNoSpaceRule, getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
const configStore = useConfigStoreWithOut();
export const WaitImproveTableColumns = (): BasicColumn[] => [
  {
    title: '合同名称',
    dataIndex: 'conContract.name',
    width: 150,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnReportContract(record.conContract);
    },
    fixed: 'left',
  },
  {
    title: '合同编号',
    dataIndex: 'conContract.code',
    width: 150,
    align: 'left',
    fixed: 'left',
  },
  {
    title: '合同类型',
    dataIndex: 'conContract.bidSection.project.projectType.name',
    width: 150,
    align: 'left',
  },
  {
    title: '合同金额',
    dataIndex: 'conContract.conAmount',
    width: 120,
    align: 'left',
    sorter: true,
    format: (_text, record) => {
      return (
        record.conContract.conAmount +
        (record.conContract.bidSection.project.currencyType?.code === '1'
          ? '元'
          : record.conContract.bidSection.project.currencyType?.name)
      );
    },
  },
  {
    title: '项目名称',
    dataIndex: 'conContract.bidSection.proName',
    width: 150,
    align: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(
        record.conContract.bidSection,
        record.conContract.bidSection,
      );
    },
  },
  {
    title: '项目编号',
    dataIndex: 'conContract.bidSection.proNumber',
    width: 150,
    align: 'left',
  },
  {
    title: '中标供应商',
    dataIndex: 'conContract.successfulSupplier.name',
    width: 120,
    align: 'left',
  },
  {
    title: '中标金额',
    dataIndex: 'bidWinner.bidWinningAmount',
    width: 120,
    align: 'left',
    sorter: true,
    format: (_text, record) => {
      return (
        record.conContract.bidWinner?.bidWinningAmount +
        (record.conContract.bidSection.project.currencyType?.code === '1'
          ? '元'
          : record.conContract.bidSection.project.currencyType?.name)
      );
    },
  },
  {
    title: '中标日期',
    dataIndex: 'bidWinner.bidWinningDate',
    width: 120,
    align: 'left',
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.conContract.bidWinner?.bidWinningDate);
    },
  },
  {
    title: '生成日期',
    dataIndex: 'conContract.addDateTime',
    width: 120,
    align: 'left',
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.conContract.addDateTime);
    },
  },
];
export const WaitImproveSearchFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'name',
      label: '合同名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入合同名称',
      },
    },
    {
      field: 'code',
      label: '合同编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入合同编号',
      },
    },
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
      field: 'bidWinningDate',
      label: '中标日期',
      component: 'RangePicker',
      colProps: { span: 8 },
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        disabledDate(current) {
          return current > Date.now();
        },
      },
    },
  ];
};
export const contractInfoFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'name',
      label: '名称',
      component: 'Input',
      colProps: { span: 22 },
      componentProps: {
        placeholder: '请输入名称',
      },
      rules: [
        {
          required: true,
          message: '请输入名称',
          trigger: ['change', 'blur'],
        },
        getNamePatternNoSpaceRule(50, 'change', 2),
      ],
    },
    {
      field: 'brandModel',
      label: '品牌',
      component: 'Input',
      colProps: { span: 11 },
      componentProps: {
        placeholder: '请输入品牌',
      },
      rules: [
        {
          required: true,
          message: '请输入品牌',
          trigger: ['change', 'blur'],
        },
        getNamePatternNoSpaceRule(50, 'change', 1),
      ],
    },
    {
      field: 'manufacturer',
      label: '生产厂家',
      component: 'Input',
      colProps: { span: 11 },
      componentProps: {
        placeholder: '请输入生产厂家',
      },
      rules: [
        {
          required: true,
          message: '请输入生产厂家',
          trigger: ['change', 'blur'],
        },
        getNamePatternNoSpaceRule(50, 'change', 2),
      ],
    },
    {
      field: 'number',
      label: '采购数量',
      component: 'InputNumber',
      defaultValue: 1,
      colProps: { span: 11 },
      componentProps: ({ formModel, formActionType }) => {
        return {
          placeholder: '请输入采购数量',
          min: 1,
          max: 200000,
          precision: 2,
          onChange: (e) => {
            const { setFieldsValue } = formActionType;
            const unitAmount = toRaw(formModel).transactionUnitPrice * e;
            setFieldsValue({
              unitAmount,
            });
            if (toRaw(formModel).assetsUnitPrice) {
              const assetAmount = toRaw(formModel).assetsUnitPrice * e;
              setFieldsValue({
                assetAmount,
              });
            }
          },
        };
      },
      rules: [
        {
          required: true,
          message: '请输入采购数量',
          trigger: 'blur',
        },
        {
          min: 0,
          max: 200000,
          type: 'number',
          message: '超出最大金额',
          trigger: 'blur',
        },
      ],
    },
    {
      field: 'unItDic',
      label: '计量单位',
      component: 'ApiSelect',
      colProps: { span: 11 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG.configInfo?.configDictionary?.unitId,
        placeholder: '请选择计量单位',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      required: true,
    },
    {
      field: 'transactionUnitPrice',
      label: '成交单价',
      component: 'InputNumber',
      defaultValue: 1,
      colProps: { span: 11 },
      componentProps: ({ formModel, formActionType }) => {
        return {
          placeholder: '请输入成交单价',
          min: 0,
          max: 1000000000,
          precision: 2,
          onChange: (e) => {
            const { setFieldsValue } = formActionType;
            const unitAmount = toRaw(formModel).number * e;
            setFieldsValue({
              unitAmount,
            });
          },
        };
      },
      rules: [
        {
          required: true,
          message: '请输入成交单价',
          trigger: ['change', 'blur'],
        },
      ],
    },
    {
      field: 'unitAmount',
      label: '成交总价',
      defaultValue: 1,
      component: 'InputNumber',
      colProps: { span: 11 },
      componentProps: () => {
        return {
          placeholder: '请输入成交总价',
          disabled: true,
          precision: 2,
        };
      },
    },
    {
      field: 'warrantyYear',
      label: '质保期（月）',
      component: 'InputNumber',
      defaultValue: 0,
      colProps: { span: 11 },
      componentProps: {
        min: 0,
        max: 200000,
        placeholder: '请输入质保期',
        precision: 0,
      },
    },
    {
      field: 'actualSpec',
      label: '实际技术参数',
      component: 'InputTextArea',
      colProps: { span: 22 },
      componentProps: {
        placeholder: '最大可输入10000个字符',
      },
      rules: [
        {
          required: true,
          message: '请输入实际技术参数',
          trigger: ['change', 'blur'],
        },
        {
          min: 1,
          max: 10000,
          message: '请输入1至10000位汉字、符号、字母或数字',
          trigger: ['change', 'blur'],
        },
      ],
    },
  ];
};
export const contractFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'deliveryDays',
      label: '合同生效后供货天数（天）',
      component: 'InputNumber',
      // defaultValue: 0,
      labelWidth: 180,
      colProps: { span: 11 },
      componentProps: {
        min: 0,
        max: 200000,
        placeholder: '请输入合同生效后供货天数',
        precision: 0,
      },
      required: true,
    },
    {
      field: 'warrantyYear',
      label: '质保期（月）',
      component: 'InputNumber',
      // defaultValue: 0,
      colProps: { span: 11 },
      componentProps: {
        min: 0,
        max: 200000,
        placeholder: '请输入质保期',
        precision: 0,
      },
      required: true,
    },
  ];
};
export const contractInfoTableColumns = (): BasicColumn[] => {
  let tableColumns = [
    {
      title: '名称',
      dataIndex: 'conContractList.name',
      width: 80,
      align: 'left',
    },
    {
      title: '品牌',
      dataIndex: 'conContractList.brandModel',
      width: 80,
      align: 'left',
    },
    {
      title: '生产厂家',
      dataIndex: 'conContractList.manufacturer',
      width: 80,
      align: 'left',
    },
    {
      title: '计量单位',
      dataIndex: 'conContractList.unItDic.name',
      width: 80,
      align: 'left',
    },
    {
      title: '采购数量',
      dataIndex: 'conContractList.number',
      width: 80,
      align: 'left',
    },
    {
      title: '成交单价',
      dataIndex: 'conContractList.transactionUnitPrice',
      width: 80,
      align: 'left',
      format: (_text, record) => {
        if (record.conContractList.transactionUnitPrice) {
          return (
            record.conContractList.transactionUnitPrice +
            (record.conContractList.bidSection.project.currencyType?.code === '1'
              ? '元'
              : record.conContractList.bidSection.project.currencyType?.name)
          );
        } else {
          return '';
        }
      },
    },
    {
      title: '成交总价',
      dataIndex: 'conContractList.bidWinner.biddingCompany.name',
      width: 80,
      align: 'left',
      format: (_text, record) => {
        if (record.conContractList.transactionUnitPrice * record.conContractList.number) {
          return (
            toThousand(
              record.conContractList.transactionUnitPrice * record.conContractList.number,
              2,
            ) +
            (record.conContractList.bidSection.project.currencyType?.code === '1'
              ? '元'
              : record.conContractList.bidSection.project.currencyType?.name)
          );
        } else {
          return '';
        }
      },
    },
    {
      title: '实际技术参数',
      dataIndex: 'conContractList.actualSpec',
      width: 100,
      align: 'left',
    },
    // {
    //   title: '添加日期',
    //   dataIndex: 'conContractList.addDateTime',
    //   width: 100,
    //   align: 'left',
    //   sorter: true,
    //   customRender: ({ record }) => {
    //     return renderTime(record.conContractList.addDateTime);
    //   },
    // },
    {
      title: '质保期',
      dataIndex: 'conContractList.warrantyYear',
      width: 80,
      align: 'left',
      format: (_text, record) => {
        return record.conContractList.warrantyYear
          ? record.conContractList.warrantyYear + '个月'
          : '';
      },
    },
  ];
  if (configStore.GET_CONFIG_MODULE.ifShowAssetFund) {
    tableColumns.splice(
      7,
      0,
      {
        title: '资产单价',
        dataIndex: 'assetsUnitPrice',
        width: 80,
        align: 'left',
        format: (_text, record) => {
          if (record.conContractList.assetsUnitPrice) {
            return (
              record.conContractList.assetsUnitPrice +
              (record.conContractList.bidSection.project.currencyType?.code === '1'
                ? '元'
                : record.conContractList.bidSection.project.currencyType?.name)
            );
          } else {
            return '';
          }
        },
      },
      {
        title: '资产总价',
        dataIndex: 'assetAmount',
        width: 80,
        align: 'left',
        format: (_text, record) => {
          if (record.conContractList.assetsUnitPrice * record.conContractList.number) {
            return (
              toThousand(
                record.conContractList.assetsUnitPrice * record.conContractList.number,
                2,
              ) +
              (record.conContractList.bidSection.project.currencyType?.code === '1'
                ? '元'
                : record.conContractList.bidSection.project.currencyType?.name)
            );
          } else {
            return '';
          }
        },
      },
    );
  }
  return tableColumns;
};
