import { DictionaryI } from './../../../../types/business.d';
import { forEach } from '/@/utils/helper/treeHelper';
import { ref, toRaw } from 'vue';
import { getDictionaryByParentId } from '/@/api/demo/system';
import {
  getCentralizeDepSelectByOrgId,
  getDepartmentByOrgId,
  getFundsCategoryDepSelect,
  getFundsCategorySelect,
  getUserListByDepId,
} from '/@/api/purchase/plan-purchase';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import {
  defaultResultFormatter,
  getAmountWithCurencyName,
  personListFormatter,
} from '/@/utils/commonServe/businessUtil';
import { getNamePatternNoSpaceRule, getNamePatternRule } from '/@/utils/helper/validateRuleHelper';
import { numberToChinese, toThousand } from '/@/utils/commonServe/common';
const configStore = useConfigStoreWithOut();
console.log('这是一个schema 技术的开发卢卡斯附件进口会计师');

// const tagModuleId: number | undefined =
//   configStore.GET_CONFIG.configInfo.configDictionary?.tagModuleId;
let projectResult = [];
// const currencyList = await getDictionaryByParentId(
//   configStore.GET_CONFIG.configInfo?.configDictionary?.currencyTypeId,
// );
// const currencyType = currencyList.find((item) => item.code === '1');
export const formSchema = (): FormSchema[] => {
  const configDictionary = configStore.GET_CONFIG.configInfo?.configDictionary;
  const configModule = configStore.GET_CONFIG_MODULE;
  const configBaseInfo = configStore.GET_CONFIG_BASEINFO;

  const currencyTypetRef = ref<number>(0);
  return [
    {
      field: 'proName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '请输入项目名称',
      },
      rules: [
        {
          required: true,
          message: '请输入项目名称',
          trigger: ['change', 'blur'],
        },
        getNamePatternNoSpaceRule(50, 'change', 1),
      ],
    },
    {
      field: 'budgetAmount',
      label: '预算金额',
      component: 'InputNumber',
      defaultValue: 0,
      colProps: { span: 10 },
      componentProps: {
        min: 0,
        max: 1000000000,
        placeholder: '请输入预算金额',
        precision: 2,
      },
      rules: [
        {
          required: true,
          message: '请输入预算金额',
          trigger: 'blur',
        },
        {
          min: 0,
          max: 1000000000,
          type: 'number',
          message: '超出最大金额',
          trigger: 'blur',
        },
      ],
    },
    {
      field: 'currencyType',
      label: '货币类型',
      component: 'ApiSelect',
      colProps: { span: 10 },
      // defaultValue: currencyType.id,
      componentProps: ({ formActionType }) => {
        return {
          api: getDictionaryByParentId,
          params: configDictionary?.currencyTypeId,
          placeholder: '请选择货币类型',
          labelField: 'name',
          valueField: 'id',
          showSearch: true,
          optionFilterProp: 'label',
          resultFormatter: (result) => {
            let currencyTypeId = 0;
            result.forEach((item) => {
              if (item.code === '1') {
                currencyTypeId = item.id;
                currencyTypetRef.value = currencyTypeId;
              }
            });
            const { setFieldsValue } = formActionType;
            setFieldsValue({
              currencyType: currencyTypeId,
            });
            return result;
          },
        };
      },
      required: true,
    },
    {
      field: 'uToC',
      label: '金额大写',
      component: 'Input',
      colProps: { span: 12 },
      render: ({ model }) => {
        return numberToChinese(model.budgetAmount);
      },
      ifShow: ({ model }) => {
        return model.currencyType === currencyTypetRef.value;
      },
    },
    {
      field: 'ifGovProcurement',
      label: '是否政府采购',
      component: 'RadioGroup',
      defaultValue: 0,
      ifShow: () => {
        return !!configModule.ifGovernmentProcurement;
      },
      colProps: { span: 10 },
      componentProps: {
        options: [
          {
            label: '是',
            value: 1,
          },
          {
            label: '否',
            value: 0,
          },
        ],
      },
    },
    {
      field: 'fundsCategoryId',
      label: '经费类别',
      component: 'ApiSelect',
      colProps: { span: 10 },
      ifShow: () => {
        return !!configModule.ifFundCategory;
      },
      componentProps: ({ formModel, formActionType }) => ({
        api: getFundsCategorySelect,
        placeholder: '请选择经费类别',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
        onChange: (e: any) => {
          const { updateSchema, setFieldsValue } = formActionType;
          setFieldsValue({
            fundsDepId: undefined,
          });
          // toRaw(formModel).fundsDepId = undefined;
          if (e) {
            updateSchema({
              field: 'fundsDepId',
              componentProps: () => ({
                api: getFundsCategoryDepSelect,
                params: e,
                showSearch: true,
                placeholder: '请选择经费主管部门',
                labelField: 'name',
                valueField: 'id',
                optionFilterProp: 'label',
              }),
              required: true,
            });
          } else {
            updateSchema({
              field: 'fundsDepId',
              componentProps: () => ({
                placeholder: '请选择经费主管部门',
                disabled: true,
              }),
            });
          }
        },
      }),
      required: true,
    },
    {
      field: 'fundsDepId',
      label: '经费主管部门',
      component: 'ApiSelect',
      colProps: { span: 10 },
      ifShow: () => {
        return !!configModule.ifFundCategory;
      },
      componentProps: ({ formModel }) => ({
        disabled: !toRaw(formModel)?.fundsCategoryId,
        placeholder: '请选择经费主管部门',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      }),
      required: true,
    },
    {
      field: 'relevantDepId',
      label: '业务归口管理部门',
      component: 'ApiSelect',
      colProps: { span: 10 },
      ifShow: () => {
        return !!configModule.ifCentralizedDepartment;
      },
      componentProps: {
        api: getCentralizeDepSelectByOrgId,
        params: configBaseInfo.orgId,
        placeholder: '请选择业务归口管理部门',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      required: true,
    },
    {
      field: 'sourceFunds',
      label: '资金来源',
      component: 'ApiSelect',
      colProps: { span: 10 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.fundSourceId,
        placeholder: '请选择资金来源',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'useDirection',
      label: '使用方向',
      component: 'ApiSelect',
      colProps: { span: 10 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.useDirectionId,
        placeholder: '请选择使用方向',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      required: true,
    },
    {
      field: 'planUseTime',
      label: '计划使用时间',
      component: 'DatePicker',
      colProps: { span: 10 },
      componentProps: {
        placeholder: '请选择计划使用时间',
      },
      required: true,
    },
    {
      field: 'projectType',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 10 },
      componentProps: ({ formModel, formActionType }) => {
        return {
          api: getDictionaryByParentId,
          params: configDictionary?.projectTypeId,
          placeholder: '请选择采购类型',
          labelField: 'name',
          valueField: 'id',
          showSearch: true,
          optionFilterProp: 'label',
          resultFormatter: (result) => {
            projectResult = result;
            return result;
          },
          onChange: (e: any) => {
            const { updateSchema, setFieldsValue } = formActionType;
            setFieldsValue({
              servicePeriod: undefined,
              engineeringProperties: undefined,
              serviceContent: '',
            });
            if (e) {
              const projectType: any = projectResult.find((item: any) => item.id === e);
              if (projectType.code === '2') {
                updateSchema({
                  field: 'engineeringProperties',
                  ifShow: true,
                  componentProps: {
                    api: getDictionaryByParentId,
                    params: configDictionary?.engineeringPropertiesId,
                    placeholder: '请选择工程性质',
                    labelField: 'name',
                    valueField: 'id',
                    showSearch: true,
                    optionFilterProp: 'label',
                  },
                });
              } else {
                updateSchema({
                  field: 'engineeringProperties',
                  ifShow: false,
                  componentProps: {
                    api: getDictionaryByParentId,
                    params: configDictionary?.engineeringPropertiesId,
                    placeholder: '请选择工程性质',
                    labelField: 'name',
                    valueField: 'id',
                    showSearch: true,
                    optionFilterProp: 'label',
                  },
                });
              }
              if (projectType.code === '3') {
                toRaw(formModel).servicePeriod = 12;
                updateSchema({
                  field: 'servicePeriod',
                  defaultValue: 12,
                  ifShow: true,
                });
                updateSchema({
                  field: 'serviceContent',
                  ifShow: true,
                });
              } else {
                updateSchema({
                  field: 'servicePeriod',
                  ifShow: false,
                });
                updateSchema({
                  field: 'serviceContent',
                  ifShow: false,
                });
              }
            } else {
              updateSchema({
                field: 'engineeringProperties',
                ifShow: false,
                componentProps: {
                  api: getDictionaryByParentId,
                  params: configDictionary?.engineeringPropertiesId,
                  placeholder: '请选择工程性质',
                  labelField: 'name',
                  valueField: 'id',
                  showSearch: true,
                  optionFilterProp: 'label',
                },
              });
              updateSchema({
                field: 'servicePeriod',
                ifShow: false,
              });
              updateSchema({
                field: 'serviceContent',
                ifShow: false,
              });
            }
          },
        };
      },
    },
    {
      field: 'servicePeriod',
      label: '服务期限(月)',
      component: 'InputNumber',
      colProps: { span: 10 },
      ifShow: false,
      componentProps: {
        placeholder: '请输入服务期限',
        min: 0,
        precision: 0,
      },
      rules: [
        {
          required: true,
          message: '请输入服务期限(月)',
          trigger: 'blur',
        },
      ],
    },
    {
      field: 'engineeringProperties',
      label: '工程性质',
      component: 'ApiSelect',
      ifShow: false,
      colProps: { span: 10 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.engineeringPropertiesId,
        placeholder: '请选择工程性质',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'serviceContent',
      label: '服务内容',
      component: 'InputTextArea',
      colProps: { span: 24 },
      ifShow: false,
      componentProps: {
        placeholder: '最大可输入5000个字符',
      },
      rules: [getNamePatternRule(5000)],
    },
    {
      field: 'ifLargeEquipment',
      label: '是否包含大型仪器设备',
      // labelWidth: 180,
      component: 'RadioGroup',
      helpMessage: ["若选'是'，需上传'大型项目及贵重仪器设备采购可行性论证报告'！"],
      colProps: { span: 10 },
      defaultValue: 0,
      componentProps: {
        options: [
          {
            label: '是',
            value: 1,
          },
          {
            label: '否',
            value: 0,
          },
        ],
      },
      required: true,
      suffix: `（单台套件超过 ${configModule.largeInstrumentAmount} 万元）`,
    },
    {
      field: 'ifImportedEquipment',
      label: '是否包含进口设备',
      component: 'RadioGroup',
      helpMessage: ["若选'是'，需上传'进口设备物资申请表'！"],
      colProps: { span: 10 },
      defaultValue: 0,
      componentProps: ({ formModel, formActionType }) => {
        return {
          options: [
            {
              label: '是',
              value: 1,
            },
            {
              label: '否',
              value: 0,
            },
          ],
          onChange: (e: any) => {
            const { updateSchema } = formActionType;
            toRaw(formModel).countryOfOrigin = '';
            if (e.target.value) {
              updateSchema({
                field: 'countryOfOrigin',
                ifShow: true,
              });
            } else {
              updateSchema({
                field: 'countryOfOrigin',
                ifShow: false,
              });
            }
          },
        };
      },
      required: true,
    },
    {
      field: 'countryOfOrigin',
      label: '原产地',
      component: 'Input',
      colProps: { span: 10 },
      ifShow: false,
      componentProps: {
        placeholder: '请输入原产地',
      },
      rules: [
        {
          required: true,
          message: '请输入原产地',
          trigger: 'blur',
        },
        getNamePatternRule(50),
      ],
    },
    {
      field: 'ifSingleSource',
      label: '项目是否单一来源',
      component: 'RadioGroup',
      helpMessage: ["若选'是'，需上传'单一来源采购申请表'！"],
      colProps: { span: 10 },
      defaultValue: 0,
      componentProps: ({ formModel, formActionType }) => {
        return {
          options: [
            {
              label: '是',
              value: 1,
            },
            {
              label: '否',
              value: 0,
            },
          ],
          onChange: (e: any) => {
            const { updateSchema } = formActionType;
            toRaw(formModel).proposedTransactionUnit = '';

            if (e.target.value) {
              updateSchema({
                field: 'proposedTransactionUnit',
                ifShow: true,
              });
            } else {
              updateSchema({
                field: 'proposedTransactionUnit',
                ifShow: false,
              });
            }
          },
        };
      },
      required: true,
    },
    {
      field: 'proposedTransactionUnit',
      label: '拟成交单位全称',
      component: 'Input',
      colProps: { span: 10 },
      ifShow: false,
      componentProps: {
        placeholder: '请输入拟成交单位全称',
      },
      rules: [
        {
          required: true,
          message: '请输入拟成交单位全称',
          trigger: 'blur',
        },
        getNamePatternRule(50),
      ],
    },
    {
      field: 'proChargeDepId',
      label: '项目负责部门',
      component: 'ApiSelect',
      colProps: { span: 10 },
      componentProps: ({ formModel, formActionType }) => {
        return {
          api: getDepartmentByOrgId,
          params: configBaseInfo.orgId,
          placeholder: '请选择项目负责部门',
          labelField: 'name',
          valueField: 'id',
          showSearch: true,
          optionFilterProp: 'label',
          resultFormatter: defaultResultFormatter,
          onChange: (e: any) => {
            const { updateSchema, setFieldsValue } = formActionType;
            setFieldsValue({
              proChargeUserId: undefined,
            });
            if (e) {
              updateSchema({
                field: 'proChargeUserId',
                componentProps: () => ({
                  api: getUserListByDepId,
                  params: e,
                  placeholder: '请选择项目负责人',
                  showSearch: true,
                  optionFilterProp: 'label',
                  resultFormatter: personListFormatter,
                }),
              });
            } else {
              // toRaw(formModel).proChargeUserId = null;
              updateSchema({
                field: 'proChargeUserId',
                componentProps: () => ({
                  placeholder: '请选择项目负责人',
                  resultFormatter: personListFormatter,
                  disabled: true,
                }),
              });
            }
          },
        };
      },
      required: true,
    },
    {
      field: 'proChargeUserId',
      label: '项目负责人',
      component: 'ApiSelect',
      colProps: { span: 10 },
      componentProps: ({ formModel }) => ({
        disabled: !toRaw(formModel)?.proChargeDepId,
        placeholder: '请选择项目负责人',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      }),
      required: true,
    },
    {
      field: 'projectOverview',
      label: '项目概述',
      component: 'InputTextArea',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '最大可输入5000个字符',
      },
      rules: [
        {
          required: true,
          message: '请输入项目概述',
          trigger: 'blur',
        },
        getNamePatternRule(5000),
      ],
    },
  ];
};
export const textAreaSchema: FormSchema[] = [
  {
    field: 'mainFunctionalObjectives',
    label: '采购标的须实现的主要功能或目标',
    component: 'InputTextArea',
    colProps: { span: 24 },
    componentProps: () => {
      return {
        placeholder: '最大可输入10000个字符',
        disabled: true,
      };
    },
    rules: [
      {
        required: true,
        message: '请输入采购标的须实现的主要功能或目标',
        trigger: ['change', 'blur'],
      },
      getNamePatternRule(10000),
    ],
  },
  {
    field: 'basicRequirements',
    label: '供应商基本要求',
    component: 'InputTextAreaWarn',
    colProps: { span: 24 },
    componentProps: () => {
      return {
        placeholder: '最大可输入10000个字符',
      };
    },
    rules: [
      {
        required: true,
        message: '请输入供应商基本要求',
        trigger: ['change', 'blur'],
      },
      getNamePatternRule(10000),
    ],
  },
  {
    field: 'qualityRequirements',
    label: '质量要求',
    component: 'InputTextAreaWarn',
    colProps: { span: 24 },
    componentProps: () => {
      return {
        placeholder: '最大可输入10000个字符',
      };
    },
    rules: [
      {
        required: true,
        message: '请输入质量要求',
        trigger: ['change', 'blur'],
      },
      getNamePatternRule(10000),
    ],
  },
  {
    field: 'serviceRequirements',
    label: '服务要求',
    component: 'InputTextAreaWarn',
    colProps: { span: 24 },
    componentProps: () => {
      return {
        placeholder: '最大可输入10000个字符',
      };
    },
    rules: [
      {
        required: true,
        message: '请输入服务要求',
        trigger: ['change', 'blur'],
      },
      getNamePatternRule(10000),
    ],
  },
  {
    field: 'safetyRequirements',
    label: '安全要求',
    component: 'InputTextAreaWarn',
    colProps: { span: 24 },
    componentProps: () => {
      return {
        placeholder: '最大可输入10000个字符',
      };
    },
    rules: [
      {
        required: true,
        message: '请输入安全要求',
        trigger: ['change', 'blur'],
      },
      getNamePatternRule(10000),
    ],
  },
  {
    field: 'timeLimitRequirements',
    label: '时限要求',
    component: 'InputTextAreaWarn',
    colProps: { span: 24 },
    componentProps: () => {
      return {
        placeholder: '最大可输入200个字符',
      };
    },
    rules: [
      {
        required: true,
        message: '请输入时限要求',
        trigger: ['change', 'blur'],
      },
      getNamePatternRule(200),
    ],
  },
];
export const columns = (): BasicColumn[] => [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    align: 'center',
    customRender: ({ index }) => {
      return index + 1 + '';
    },
    flag: 'INDEX',
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 120,
    align: 'left',
  },
  {
    title: '品牌',
    dataIndex: 'brandModel',
    width: 120,
  },
  {
    title: '要求技术参数',
    dataIndex: 'spec',
    width: 120,
  },
  {
    title: '计量单位',
    dataIndex: 'unItDic',
    width: 80,
    format: (_text, record) => {
      return record.unItDic.name;
    },
  },
  {
    title: '采购数量',
    dataIndex: 'number',
    width: 80,
  },
  {
    title: '预算单价',
    dataIndex: 'unitPrice',
    format: (_text, record) => {
      return record.unitPrice;
    },
    width: 100,
  },
  {
    title: '预算总价',
    dataIndex: 'tagModule',
    format: (_text, record) => {
      const Amount = toRaw(record).unitPrice * toRaw(record).number;
      return toThousand(Amount, 2);
    },
    width: 100,
  },
  {
    title: '采购目录分类',
    dataIndex: 'purchaseType',
    width: 120,
    format: (_text, record) => {
      return record.purchaseType ? record.purchaseType.name : '';
    },
  },
];
columns().forEach((item) => {
  item.align = 'left';
});
export const BDcolumns = (): BasicColumn[] => [
  {
    title: '标段名称',
    dataIndex: 'proName',
    width: 120,
    align: 'left',
  },
  {
    title: '所在标段',
    dataIndex: 'sort',
    width: 120,
  },
  {
    title: '标段预算金额',
    dataIndex: 'budgetAmount',
    width: 120,
    format: (_, record) => {
      return getAmountWithCurencyName(record.budgetAmount, record.project.currencyType);
    },
  },
  {
    title: '标段项目状态',
    dataIndex: 'status',
    width: 100,
    format: (_text, record) => {
      return record.status.name;
    },
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod',
    format: (_text, record) => {
      return record.procurementMethod?.name;
    },
    width: 100,
  },
  {
    title: '采购形式',
    dataIndex: 'organizationalForm',
    format: (_text, record) => {
      return record.organizationalForm?.name;
    },
    width: 100,
  },
];
BDcolumns().forEach((item) => {
  item.align = 'left';
});
// 抽屉数据
export const addFormSchema = (): FormSchema[] => {
  const configDictionary = configStore.GET_CONFIG.configInfo?.configDictionary;
  // const configModule = configStore.GET_CONFIG_MODULE;
  // const configBaseInfo = configStore.GET_CONFIG_BASEINFO;
  return [
    {
      field: 'name',
      label: '名称',
      component: 'Input',
      colProps: { span: 24 },
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
      field: 'number',
      label: '采购数量',
      component: 'InputNumber',
      colProps: { span: 24 },

      componentProps: ({ formModel, formActionType }) => {
        return {
          placeholder: '请输入采购数量',
          min: 1,
          max: 200000,
          precision: 2,

          onChange: (e) => {
            const { setFieldsValue } = formActionType;
            const unitAmount = toRaw(formModel).unitPrice * e;
            setFieldsValue({
              unitAmount,
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
      field: 'unItDic',
      label: '计量单位',
      component: 'ApiSelect',
      colProps: { span: 24 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configDictionary?.unitId,
        placeholder: '请选择计量单位',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      required: true,
    },
    {
      field: 'unitPrice',
      label: '预算单价',
      component: 'InputNumber',
      defaultValue: 1,
      colProps: { span: 24 },
      componentProps: ({ formModel, formActionType }) => {
        return {
          placeholder: '请输入预算单价',
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
          message: '请输入预算单价',
          trigger: ['change', 'blur'],
        },
      ],
    },
    {
      field: 'unitAmount',
      label: '预算总价',
      component: 'InputNumber',
      colProps: { span: 24 },
      componentProps: () => {
        return {
          placeholder: '请输入预算总价',
          disabled: true,
          precision: 2,
        };
      },

      // rules: [
      //   {
      //     required: true,
      //     message: '请输入预算总价',
      //     trigger: ['change', 'blur'],
      //   },
      // ],
    },
    {
      field: 'purchaseType',
      label: '采购目录分类',
      component: 'ApiTreeSelect',
      colProps: { span: 24 },
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
      field: 'spec',
      label: '要求技术参数',
      component: 'InputTextArea',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '最大可输入10000个字符',
      },
      rules: [
        {
          required: true,
          message: '请输入要求技术参数',
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
    {
      field: 'brandModel',
      label: '品牌',
      component: 'Input',
      colProps: { span: 24 },
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
  ];
};
export const addBDFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'proName',
      label: '标段项目名称',
      component: 'Input',
      colProps: { span: 24 },
      componentProps: {
        placeholder: '请输入标段项目名称',
      },
      rules: [
        {
          required: true,
          message: '请输入名称',
          trigger: ['change', 'blur'],
        },
        getNamePatternNoSpaceRule(50, ['change', 'blur'], 1),
      ],
    },
    {
      field: 'budgetAmount',
      label: '标段预算金额',
      component: 'InputNumber',
      colProps: { span: 24 },
      defaultValue: 0,
      componentProps: {
        precision: 2,
        max: 1000000000,
        placeholder: '请输入标段预算金额',
      },
      required: true,
    },
  ];
};
