import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import {
  lxTableColumnProjectBidsectionRender, //标段
  lxTableColumnReportContract, //合同
} from '/@/components/LxComponents';
import { getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
import { getDepTreeList } from '/@/api/demo/system';

const columns = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'conContract.bidSection.proName',
    width: 180,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(
        record.conContract.bidSection,
        record.conContract.bidSection,
      );
    },
  },
  {
    title: '合同名称',
    dataIndex: 'conContract.name',
    width: 180,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnReportContract(record.conContract);
    },
  },
  {
    title: '名称',
    dataIndex: 'conContractList.name',
    width: 120,
    fixed: 'left',
  },
  {
    title: '品牌',
    dataIndex: 'conContractList.brandModel',
    width: 120,
  },
  {
    title: '生产厂家',
    dataIndex: 'conContractList.manufacturer',
    width: 120,
  },
  {
    title: '计量单位',
    dataIndex: 'conContractList.unItDic.name',
    width: 80,
  },
  {
    title: '采购数量',
    dataIndex: 'conContractList.number',
    width: 80,
    // sorter: true,
  },
  {
    title: '已出库数量',
    dataIndex: 'conContractList.outboundQuantity',
    width: 100,
    format: (text) => {
      if (text) {
        return text;
      } else {
        return 0;
      }
    },
  },
  {
    title: '成交单价',
    dataIndex: 'conContractList.transactionUnitPrice',
    width: 100,
    format: (text, record) => {
      if (text) {
        return (
          Number(text).toFixed(2) +
          (record.conContract.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.conContract.bidSection.project.currencyType.name)
        );
      } else {
        return '';
      }
    },
    sorter: true,
  },
  {
    title: '成交总价',
    dataIndex: 'transactionUnitPriceAll',
    width: 100,
    format: (_text, record) => {
      if (record.conContractList.transactionUnitPrice) {
        return (
          (
            Number(record.conContractList.transactionUnitPrice) *
            Number(record.conContractList.number)
          ).toFixed(2) +
          (record.conContract.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.conContract.bidSection.project.currencyType.name)
        );
      } else {
        return '';
      }
    },
  },
  // // 资产单价、资产总价 ------->根据配置 资产信息是否显示 控制
  {
    title: '资产单价',
    dataIndex: 'conContractList.assetsUnitPrice',
    width: 100,
    format: (text, record) => {
      if (text) {
        return (
          Number(text).toFixed(2) +
          (record.conContract.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.conContract.bidSection.project.currencyType.name)
        );
      } else {
        return '';
      }
    },
    sorter: true,
    ifShow: () => {
      return !!configStore.GET_CONFIG_MODULE.ifShowAssetFund;
    },
  },
  {
    title: '资产总价',
    dataIndex: 'assetsUnitPriceAll',
    width: 100,
    format: (_text, record) => {
      if (record.conContractList.assetsUnitPrice) {
        return (
          (
            Number(record.conContractList.assetsUnitPrice) * Number(record.conContractList.number)
          ).toFixed(2) +
          (record.conContract.bidSection.project.currencyType.code === '1'
            ? '元'
            : record.conContract.bidSection.project.currencyType.name)
        );
      } else {
        return '';
      }
    },
    ifShow: () => {
      return !!configStore.GET_CONFIG_MODULE.ifShowAssetFund;
    },
  },
  {
    title: '实际技术参数',
    dataIndex: 'conContractList.actualSpec',
    width: 120,
  },
  {
    title: '质保期(月)',
    dataIndex: 'conContractList.warrantyYear',
    width: 100,
    sorter: true,
  },
  {
    title: '申报部门',
    dataIndex: 'conContract.bidSection.project.declareDept.name',
    width: 120,
  },
  // {
  //   title: 'operation',
  //   dataIndex: 'operation',
  //   slots: { customRender: 'operation' },
  // },
];

// 查询项表单
const searchFormSchema = (): FormSchema[] => [
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
    field: 'brandModel',
    label: '品牌',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入品牌',
    },
  },
  {
    field: 'manufacturer',
    label: '生产厂家',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入生产厂家',
    },
  },
  // TransactionUnitPrice
  {
    field: 'transactionUnitPrice',
    label: '成交单价',
    component: 'LxInputNumberDouble',
    colProps: { span: 8 },
    componentProps: {
      min: 0,
      step: 1,
    },
  },
  // AssetsUnitPrice
  {
    field: 'assetsUnitPrice',
    label: '资产单价',
    component: 'LxInputNumberDouble',
    colProps: { span: 8 },
    componentProps: {
      min: 0,
      step: 1,
    },
    // 资产单价 根据配置显示
    show: () => {
      return !!configStore.GET_CONFIG_MODULE.ifShowAssetFund;
    },
  },
  {
    field: 'actualSpec',
    label: '实际技术参数',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入实际技术参数',
    },
  },
  // DeclareDept/departmentId
  {
    field: 'declareDeptId',
    label: '申报部门',
    component: 'ApiTreeSelect',
    colProps: { span: 8 },
    componentProps: {
      api: getDepTreeList,
      params: userStore.getUserInfo.orgId,
      // immediate: false,
      placeholder: '请选择申报部门',
      // treeCheckable: true, // 可多选
      // resultField: 'data',
      replaceFields: {
        children: 'children',
        key: 'id',
        value: 'id',
        title: 'name',
      },
      onChange: (value) => {
        console.log('value:', value);
      },
    },
  },
];

// 抽屉表单
const formSchema = (): FormSchema[] => [
  {
    field: 'employment',
    label: '领用人',
    component: 'Input',
    rules: [
      { required: true, message: '请输入1至50位汉字、符号、大小写字母或数字', trigger: 'blur' },
      getNamePatternRule(50, 'blur'),
    ],
    componentProps: {
      placeholder: '请输入领用人',
    },
  },
  {
    field: 'number',
    label: '出库数量',
    component: 'InputNumber',
    required: true,
    componentProps: {
      min: 0,
      placeholder: '请输入出库数量',
      precision: 0,
    },
  },
  {
    field: 'remark',
    label: '备注',
    component: 'InputTextArea',
    componentProps: {
      // defaultValue: '同意', bug
      placeholder: '最大可输入1000个字符',
      autoSize: { minRows: 8, maxRows: 12 },
      showCount: true,
      maxlength: 1000,
    },
  },
];

const checkRecordColumns = (): BasicColumn[] => [
  {
    title: '领用人',
    dataIndex: 'employment',
    width: 100,
  },
  {
    title: '领取时间',
    dataIndex: 'collectionTime',
    width: 100,
    customRender: ({ text }) => {
      return renderTime(text, false, true);
    },
    // sorter: true,
  },
  {
    title: '出库数量',
    dataIndex: 'number',
    width: 50,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 200,
    // customRender: ({ record }) => {
    //   return lxTableColumnProjectNameRender(record);
    // },
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => {
  const userInfo = userStore.getUserInfo;
  let permissionsId;
  if (userInfo.authorizeDepIds) {
    permissionsId = userInfo.authorizeDepIds
      ?.substring(1, userInfo.authorizeDepIds?.length - 1)
      .split(',')
      .map(Number);
  } else {
    permissionsId = [];
  }
  if (!permissionsId?.includes(userInfo.department.id)) {
    permissionsId?.push(userInfo.department.id);
  }

  return {
    hqlPageAndSortSumDto: {
      ifCustomHql: true,
      queryList: [
        {
          param: 'conContractList.ifDelete',
          type: 'equal',
          value: [0],
        },
        {
          param: 'conContractList.warehousingClassification',
          type: 'equal',
          value: [2],
          // 0待入库 1资产库 2耗材库
        },
        {
          param: 'conContractList.bidSection.status.code',
          type: 'equal',
          value: [25],
        },
        // 当前登录人的部门 和 授权部门 department.id && authorizeDepIds 授权部门
        {
          param: 'conContractList.bidSection.project.declareDept.id',
          type: 'in',
          value: permissionsId,
        },
      ],
      dataFieldList: ['conContract', 'conContractList'],
      page: {
        pageNum: 1,
        pageSize: 10,
      },
      sorts: [
        {
          dir: 'desc',
          prop: 'conContractList.id',
        },
      ],
    },
  };
};

export { columns, searchFormSchema, formSchema, pageAndSort, checkRecordColumns };
