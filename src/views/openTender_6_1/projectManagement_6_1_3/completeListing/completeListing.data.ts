import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();

import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';
import { getSpecialDictionaryList } from '/@/api/purchase/plan-purchase';

const columns = (): BasicColumn[] => {
  return [
    {
      title: '名称',
      dataIndex: 'bidWinningList.name',
      width: 120,
      fixed: 'left',
    },
    {
      title: '品牌',
      dataIndex: 'bidWinningList.brandModel',
      width: 120,
      fixed: 'left',
    },
    {
      title: '要求技术参数',
      dataIndex: 'bidWinningList.spec',
      width: 120,
    },
    {
      title: '计量单位',
      dataIndex: 'bidWinningList.unItDic.name',
      width: 80,
    },
    {
      title: '采购数量',
      dataIndex: 'bidWinningList.number',
      width: 80,
    },
    {
      title: '预算单价',
      dataIndex: 'bidWinningList.unitPrice',
      width: 100,
      format: (text, record) => {
        if (text) {
          return (
            text +
            (record.bidSection.project.currencyType.code === '1'
              ? '元'
              : record.bidSection.project.currencyType.name)
          );
        } else {
          return '';
        }
      },
    },
    {
      title: '预算总价',
      dataIndex: 'totalUnitPrice',
      width: 100,
      format: (_text, record) => {
        if (record.bidWinningList.unitPrice) {
          return (
            (
              Number(record.bidWinningList.unitPrice) * Number(record.bidWinningList.number)
            ).toFixed(2) +
            (record.bidSection.project.currencyType.code === '1'
              ? '元'
              : record.bidSection.project.currencyType.name)
          );
        } else {
          return '';
        }
      },
    },
    {
      title: '报价单价',
      dataIndex: 'bidWinningList.transactionUnitPrice',
      width: 100,
      format: (text, record) => {
        if (text) {
          return (
            text +
            (record.bidSection.project.currencyType.code === '1'
              ? '元'
              : record.bidSection.project.currencyType.name)
          );
        } else {
          return '';
        }
      },
    },
    {
      title: '报价总价',
      dataIndex: 'bidWinningList.totalTransactionUnitPrice',
      width: 100,
      format: (_text, record) => {
        if (record.bidWinningList.transactionUnitPrice) {
          return (
            (
              Number(record.bidWinningList.transactionUnitPrice) *
              Number(record.bidWinningList.number)
            ).toFixed(2) +
            (record.bidSection.project.currencyType.code === '1'
              ? '元'
              : record.bidSection.project.currencyType.name)
          );
        } else {
          return '';
        }
      },
    },
    {
      title: '实际技术参数',
      dataIndex: 'bidWinningList.actualSpec',
      width: 120,
    },
    {
      title: '采购目录分类',
      dataIndex: 'bidWinningList.purchaseType.name',
      width: 120,
    },
    // {
    //   title: '添加日期',
    //   dataIndex: 'bidWinningList.addDateTime',
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

// 抽屉数据
const formSchema = (): FormSchema[] => {
  const configDictionary = configStore.GET_CONFIG.configInfo?.configDictionary;
  return [
    {
      field: 'name',
      label: '名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入名称',
      },
      rules: [
        {
          required: true,
          message: '请输入名称',
          trigger: ['change', 'blur'],
        },
        getNamePatternNoSpaceRule(50, ['change', 'blur'], 2),
      ],
    },
    {
      field: 'brandModel',
      label: '品牌',
      component: 'Input',
      componentProps: {
        placeholder: '建议满足参数要求的品牌输入不少于三个',
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
      field: 'number',
      label: '采购数量',
      component: 'InputNumber',
      componentProps: ({ formModel, formActionType }) => {
        return {
          placeholder: '请输入采购数量',
          min: 1,
          max: 200000,
          precision: 0,
          onChange: (value) => {
            const { setFieldsValue } = formActionType;
            console.log('formModel.transactionUnitPrice:', formModel.transactionUnitPrice);
            const totalTransactionUnitPrice = formModel.transactionUnitPrice * value;
            setFieldsValue({
              totalTransactionUnitPrice,
            });
          },
        };
      },
      rules: [
        {
          required: true,
          message: '请输入采购数量',
          trigger: ['change', 'blur'],
        },
      ],
    },
    {
      field: 'unItDicId',
      label: '计量单位',
      component: 'ApiSelect',
      required: true,
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.unitId,
        placeholder: '请选择计量单位',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    // {
    //   field: 'currencyTypeName',
    //   label: '货币类型',
    //   component: 'Input',
    //   show: false,
    //   dynamicDisabled: true,
    // },
    {
      field: 'transactionUnitPrice',
      label: '报价单价',
      component: 'InputNumber',
      rules: [
        {
          required: true,
          message: '请输入报价单价',
          trigger: ['change', 'blur'],
        },
      ],
      defaultValue: 1,
      componentProps: ({ formModel, formActionType }) => {
        return {
          placeholder: '请输入报价单价',
          min: 0,
          max: 1000000000,
          precision: 2,
          onChange: (value) => {
            console.log('change value', value);
            const { setFieldsValue } = formActionType;
            if (formModel.number) {
              const totalTransactionUnitPrice = formModel.number * value;
              setFieldsValue({
                totalTransactionUnitPrice,
              });
            }
          },
        };
      },
    },
    {
      field: 'totalTransactionUnitPrice',
      label: '报价总价',
      component: 'InputNumber',
      componentProps: {
        disabled: true,
        min: 0,
        precision: 2,
      },
      defaultValue: 0,
    },
    // {
    //   field: 'purchaseType',
    //   label: '采购目录分类',
    //   component: 'ApiTreeSelect',
    //   // required: true,
    //   componentProps: {
    //     api: getSpecialDictionaryList,
    //     params: {
    //       id: configStore.GET_CONFIG.configInfo?.configDictionary?.purchaseTypeId,
    //       useMark: 1,
    //     },
    //     placeholder: '请选择采购目录分类',
    //     resultField: 'data', // 接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
    //     replaceFields: {
    //       children: 'children',
    //       key: 'id',
    //       value: 'id',
    //       title: 'name',
    //     },
    //     showSearch: true,
    //     treeDefaultExpandAll: true,
    //     onChange: (value) => {
    //       console.log('TreeSelect value:', value);
    //     },
    //   },
    // },
    {
      field: 'purchaseType',
      label: '采购目录分类',
      component: 'ApiTreeSelect',
      componentProps: {
        // api: getDictionaryByParentId,
        // params: configDictionary?.projectTypeId,
        placeholder: '请选择采购目录分类',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        treeDefaultExpandAll: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'actualSpec',
      label: '实际技术参数',
      component: 'InputTextArea',
      rules: [{ required: true, message: '请输入实际技术参数', trigger: 'blur' }],
      componentProps: {
        // defaultValue: '同意666', bug
        placeholder: '最大可输入10000个字符',
        autoSize: { minRows: 8, maxRows: 12 },
        showCount: true,
        maxlength: 10000,
      },
    },
  ];
};

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'bidWinningList.ifDelete',
        type: 'equal',
        value: [0],
      },
      // {
      //   param: 'bidSection.id',
      //   type: 'equal',
      //   value: [15],
      // },
      // {
      //   param: 'bidSection.biddingCompany.user.id',
      //   type: 'equal',
      //   // value: [72],
      //   value: [userStore.getUserInfo.id.toString()],
      // },
      {
        param: 'bidWinningList.supplierQuotation.registeredSupplier.successfulSupplier.user.id',
        type: 'equal',
        value: [userStore.getUserInfo.id.toString()],
      },
    ],
    dataFieldList: ['bidWinningList', 'bidSection'],
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
});

export { columns, pageAndSort, formSchema };
