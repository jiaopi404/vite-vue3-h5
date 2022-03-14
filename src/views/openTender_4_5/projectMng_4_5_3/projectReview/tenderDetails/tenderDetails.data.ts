import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { DescItem } from '/@/components/Description/index';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();

// 基本信息展示
const schema = (): DescItem[] => [
  {
    field: 'proName',
    label: '项目名称',
  },
  {
    field: 'purchaseNumber',
    label: '项目编号',
  },
  {
    field: 'projectType.name',
    label: '采购类型',
  },
  {
    field: 'budgetAmount',
    label: '预算金额',
    render: (curVal, data) => {
      return curVal + (data.currencyType.code === '1' ? '元' : data.currencyType.name);
    },
  },
  {
    field: 'quoteStartTime',
    label: '报价开始时间',
    render: (curVal) => {
      return renderTime(curVal, true);
    },
  },
  {
    field: 'quoteEndTime',
    label: '报价截止时间',
    render: (curVal) => {
      return renderTime(curVal, true);
    },
  },
  {
    field: 'map.quaRequire',
    label: '要求资质',
    span: 3,
    // render: (curVal, data) => {
    //   return h(Input, {
    //     placeholder: '请输入',
    //     value: curVal,
    //   });
    // },
  },
  {
    field: 'remark',
    label: '要求申购备注',
    span: 3,
  },
  {
    field: 'dateOfDelivery',
    label: '交货期',
    span: 3,
  },
];

// tabel表格配置
const columns = (currencyType): BasicColumn[] => {
  return [
    {
      title: '名称',
      dataIndex: 'name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '品牌',
      dataIndex: 'brandModel',
      width: 120,
      fixed: 'left',
    },
    {
      title: '要求技术参数',
      dataIndex: 'spec',
      width: 120,
    },
    {
      title: '计量单位',
      dataIndex: 'unItDic.name',
      width: 120,
    },
    {
      title: '采购数量',
      dataIndex: 'number',
      width: 120,
    },
    {
      title: '预算单价',
      dataIndex: 'unitPrice',
      width: 120,
      format: (text) => {
        return text + currencyType;
      },
    },
    {
      title: '预算总价',
      dataIndex: 'totalUnitPrice',
      width: 120,
      format: (_text, record) => {
        return (record.number * record.unitPrice).toFixed(2) + currencyType;
      },
    },
    {
      title: '报价单价',
      dataIndex: 'transactionUnitPrice',
      width: 120,
      // slots: { title: 'customTitle1' },
      format: (text) => {
        if (text) {
          return text + currencyType;
        } else {
          return '';
        }
      },
    },
    {
      title: '报价总价',
      dataIndex: 'totalTransactionUnitPrice',
      width: 120,
      format: (_text, record) => {
        return (record.number * record.transactionUnitPrice).toFixed(2) + currencyType;
      },
    },
    {
      title: '实际技术参数',
      dataIndex: 'actualSpec',
      width: 150,
      slots: { customRender: 'actualSpec' },
    },
    {
      title: '采购目录分类',
      dataIndex: 'purchaseType.name',
      width: 120,
    },
    // {
    //   title: '预算金额',
    //   dataIndex: 'budgetAmount',
    //   width: 100,
    //   format: (text, record) => {
    //     return (
    //       text + (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
    //     );
    //   },
    // },
    // {
    //   title: '发布日期',
    //   dataIndex: 'updateDateTime',
    //   width: 120,
    //   customRender: ({ text }) => {
    //     return renderTime(text);
    //   },
    //   sorter: true,
    // },
    // {
    //   title: 'operation',
    //   dataIndex: 'operation',
    //   slots: { customRender: 'operation' },
    // },
  ];
};

// 抽屉表单
const formSchema = (): FormSchema[] => [
  {
    field: 'id',
    label: 'id',
    component: 'InputNumber',
    // required: true,
    show: false,
    dynamicDisabled: true,
  },
  {
    field: 'name',
    label: '名称',
    component: 'Input',
    // required: true,
    dynamicDisabled: true,
  },
  {
    field: 'brandModel',
    label: '品牌',
    component: 'Input',
    // required: true,
    dynamicDisabled: true,
  },
  {
    field: 'spec',
    label: '要求技术参数',
    component: 'InputTextArea',
    // required: true,
    componentProps: {
      autoSize: { minRows: 5, maxRows: 8 },
      showCount: true,
      maxlength: 10000,
    },
    dynamicDisabled: true,
  },
  {
    field: 'unItDicName',
    label: '计量单位',
    component: 'Input',
    // required: true,
    dynamicDisabled: true,
  },
  {
    field: 'number',
    label: '采购数量',
    component: 'Input',
    // required: true,
    dynamicDisabled: true,
  },
  {
    field: 'unitPrice',
    label: '预算单价',
    component: 'InputNumber',
    // required: true,
    dynamicDisabled: true,
  },
  {
    field: 'totalUnitPrice',
    label: '预算总价',
    component: 'InputNumber',
    // required: true,
    dynamicDisabled: true,
  },
  {
    field: 'transactionUnitPrice',
    label: '报价单价',
    component: 'InputNumber',
    required: true,
    componentProps: ({ formModel, formActionType }) => {
      return {
        placeholder: '请输入报价单价',
        min: 0,
        max: 100000,
        precision: 2,
        onChange: (value) => {
          const { setFieldsValue } = formActionType;
          const totalTransactionUnitPrice = (formModel.number * value).toFixed(2);
          setFieldsValue({
            totalTransactionUnitPrice,
          });
        },
      };
    },
  },
  {
    field: 'totalTransactionUnitPrice',
    label: '报价总价',
    component: 'InputNumber',
    // required: true,
    dynamicDisabled: true,
  },
  {
    field: 'actualSpec',
    label: '实际技术参数',
    component: 'InputTextArea',
    rules: [{ required: true, message: '请输入实际技术参数', trigger: 'blur' }],
    componentProps: {
      placeholder: '最大可输入10000个字符',
      autoSize: { minRows: 5, maxRows: 8 },
      showCount: true,
      maxlength: 10000,
    },
  },
  {
    label: '采购目录分类',
    field: 'purchaseTypeName',
    component: 'Input',
    // required: true,
    dynamicDisabled: true,
  },
];

// 提交报价表单数据
const formSchemas = (currencyType, idEditable): FormSchema[] => {
  return [
    {
      field: 'budgetAmount',
      label: `报价总金额（${currencyType}）`,
      component: 'InputNumber',
      required: true,
      componentProps: {
        precision: 2,
        max: 1000000000,
        min: 0,
      },
      dynamicDisabled: !idEditable,
    },
    {
      field: 'purchaseFile',
      component: 'LxBasicUploadFile',
      label: '上传附件',
      slot: 'purchaseFile',
      helpMessage: [
        '1. 支持图片类型：png、jpg、bmp、jpeg、gif；',
        '2. 支持文件类型：doc、docx、xls、xlsx、ppt、pptx、pub、txt、pdf、zip、rar；',
        `3. 上传的单个文件不大于：${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxSize}M；`,
        `4. 供应商报价附件只能上传1个`,
      ],
      colProps: {
        span: 24,
      },
      rules: [
        { required: true, message: '请选择上传供应商报价附件', trigger: 'change', type: 'array' },
      ],
      defaultValue: [],
      ifShow: () => {
        if (configStore.GET_CONFIG_MODULE.supplierQuotationFileRequired) {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      field: 'submit',
      label: 'submit',
      component: 'Input',
      colSlot: 'submitSlot',
    },
  ];
};

// 弹框表单数据
const modalformSchemas = (): FormSchema[] => [
  {
    field: 'id',
    label: '项目id',
    component: 'InputNumber',
    required: true,
    componentProps: {
      precision: 0,
    },
    show: true,
    dynamicDisabled: true,
  },
  {
    field: 'actualSpec',
    label: '实际技术参数',
    component: 'InputTextArea',
    rules: [{ required: true, message: '请输入实际技术参数', trigger: 'blur' }],
    componentProps: {
      placeholder: '最大可输入10000个字符',
      autoSize: { minRows: 5, maxRows: 8 },
      showCount: true,
      maxlength: 10000,
    },
  },
];

const pageAndSort = (): HqlQueryDtoI => {
  return {
    hqlPageAndSortSumDto: {
      ifCustomHql: true,
      queryList: [
        {
          param: 'bidWinningList.ifDelete',
          type: 'equal',
          value: [0],
        },
        // {
        //   param: 'bidWinningList.id',
        //   type: 'equal',
        //   value: [1],
        // },
      ],
      dataFieldList: ['bidWinningList', 'bidWinningList.id'],
      page: {
        pageNum: 1,
        pageSize: 10,
      },
      sorts: [
        {
          dir: 'desc',
          prop: 'bidWinningList.id',
        },
      ],
    },
  };
};

export { columns, schema, formSchemas, modalformSchemas, pageAndSort, formSchema };
