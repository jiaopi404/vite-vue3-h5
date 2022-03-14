import { ref, unref } from 'vue';
import { FormSchema } from '/@/components/Table';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { getUserByRole, getCentralizeDepSelectByOrgId } from '/@/api/purchase/plan-purchase';
import { getDepTreeList } from '/@/api/demo/system';

import { personListFormatter } from '/@/utils/commonServe/businessUtil';
import { getNamePatternRule, getInputTextAreaPattern } from '/@/utils/helper/validateRuleHelper';
import { numberToChinese } from '/@/utils/commonServe/common';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { dateUtil } from '/@/utils/dateUtil';

// import { debouncePromise } from '/@/utils/commonServe';
// import { checkProBudgetRepeat } from '/@/api/projectManagement/projectCollectionLibraryApi';

export const formSchema = (): FormSchema[] => {
  const year = ref<number>(dateUtil().year());
  return [
    // {
    //   field: 'id',
    //   label: '项目ID',
    //   component: 'Input',
    //   colProps: { span: 24 },
    //   componentProps: {
    //     placeholder: '请输入项目ID',
    //   },
    //   show: false,
    //   defaultValue:null,
    // },
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
        getNamePatternRule(10, 'change'),
      ],
    },
    {
      field: 'year',
      label: '所属年份',
      component: 'RadioGroup',
      colProps: { span: 10 },
      required: true,
      componentProps: ({ formActionType }) => {
        return {
          options: [
            { label: `${unref(year)}`, value: unref(year) },
            { label: `${unref(year) + 1}`, value: unref(year) + 1 },
          ],
          onChange: ({ target }) => {
            const { setFieldsValue } = formActionType;
            setFieldsValue({
              time: [`${target.value}-01-01`, `${target.value}-12-31`],
            });
          },
        };
      },
      defaultValue: unref(year) + 1,
    },
    {
      field: 'declareDept',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 10 },
      componentProps: {
        api: getDepTreeList,
        params: userStore.getUserInfo.orgId,
        // immediate: false,
        placeholder: '请选择申报部门',
        // resultField: 'data',
        replaceFields: {
          children: 'children',
          key: 'id',
          value: 'id',
          title: 'name',
        },
        disabled: true,
      },
      defaultValue: userStore.getUserInfo.department?.id,
    },
    {
      field: 'budgetAmount',
      label: '预算金额',
      component: 'InputNumber',
      required: true,
      colProps: { span: 10 },
      componentProps: {
        min: 0,
        max: 1000000000,
        placeholder: '请输入预算金额',
        precision: 2,
      },
      defaultValue: 0,
    },
    {
      field: 'currencyType',
      label: '货币类型',
      component: 'ApiSelect',
      required: true,
      colProps: { span: 10 },
      // defaultValue: currencyType.id,
      componentProps: ({ formActionType }) => {
        return {
          api: getDictionaryByParentId,
          params: configStore.GET_CONFIG_DICTIONRY.currencyTypeId,
          placeholder: '请选择货币类型',
          labelField: 'name',
          valueField: 'id',
          showSearch: true,
          optionFilterProp: 'label',
          onOptionsChange: (options) => {
            console.log('api options is:', options);
            let currencyTypeId = 0;
            options.forEach((item) => {
              if (item.code === '1') {
                currencyTypeId = item.value;
              }
            });
            const { setFieldsValue } = formActionType;
            setFieldsValue({
              currencyType: currencyTypeId,
            });
          },
          // resultFormatter: (result) => {
          //   let currencyTypeId = 0;
          //   result.forEach((item) => {
          //     if (item.code === '1') {
          //       currencyTypeId = item.id;
          //     }
          //   });
          //   const { setFieldsValue } = formActionType;
          //   setFieldsValue({
          //     currencyType: currencyTypeId,
          //   });
          //   return result;
          // },
        };
      },
      show: false,
    },
    {
      field: 'uToC',
      label: '金额大写',
      component: 'Input',
      colProps: { span: 10 },
      render: ({ model }) => {
        return numberToChinese(model.budgetAmount);
      },
    },
    {
      field: 'relevantDepId',
      label: '归口部门',
      component: 'ApiSelect',
      required: true,
      colProps: { span: 10 },
      componentProps: {
        api: getCentralizeDepSelectByOrgId,
        params: configStore.GET_CONFIG_BASEINFO.orgId,
        placeholder: '请选择归口部门',
        labelField: 'name',
        valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
      },
      ifShow: () => {
        return !!configStore.GET_CONFIG_MODULE.ifCentralizedDepartment;
      },
    },
    {
      field: 'proChargeUserId',
      label: '项目负责人',
      component: 'ApiSelect',
      required: true,
      colProps: { span: 10 },
      componentProps: {
        // api: getUserListByDepId,
        // params: userStore.getUserInfo.department?.id,
        api: getUserByRole,
        params: {
          orgId: userStore.getUserInfo.orgId,
          roleId: 2,
        },
        placeholder: '请选择项目负责人',
        // labelField: 'name',
        // valueField: 'id',
        showSearch: true,
        optionFilterProp: 'label',
        resultFormatter: personListFormatter,
      },
    },
    // 项目类型 从字典配置“采购类型”中读值。
    {
      field: 'projectType',
      label: '项目类型',
      component: 'ApiSelect',
      required: true,
      colProps: { span: 10 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
        placeholder: '请选择项目类型',
        labelField: 'name',
        valueField: 'id',
        showSearch: true, // 可搜索
        optionFilterProp: 'label', // 搜索过滤label
      },
    },
    {
      field: 'time',
      label: '项目起止时间',
      component: 'RangePicker',
      colProps: { span: 10 },
      required: true,
      componentProps: {
        format: 'YYYY-MM-DD',
        // valueFormat: '[YYYY-MM-DD,YYYY-MM-DD]',
        // showTime: { defaultValue: ['00:00:00', '23:59:59'] },
        onChange: (value, mode) => {
          console.log('日期2：', value);
        },
      },
    },
    {
      field: 'projectOverview',
      label: '项目简介',
      component: 'InputTextArea',
      colProps: { span: 24 },
      rules: [
        { required: true, message: '请输入300至5000位汉字、符号、字母或数字', trigger: 'blur' },
        getInputTextAreaPattern(5000, 'blur', 300),
      ],
      componentProps: {
        placeholder: '不少于300个字',
        autoSize: { minRows: 5, maxRows: 8 },
        showCount: true,
        maxlength: 5000,
      },
    },
    {
      field: 'calculationBasisOfFunds',
      label: '经费测算',
      component: 'InputTextArea',
      colProps: { span: 24 },
      rules: [
        { required: true, message: '请输入200至5000位汉字、符号、字母或数字', trigger: 'blur' },
        getInputTextAreaPattern(5000, 'blur', 200),
      ],
      helpMessage: '测算方法，测算依据。',
      componentProps: {
        placeholder: '不少于200个字',
        autoSize: { minRows: 5, maxRows: 8 },
        showCount: true,
        maxlength: 5000,
      },
    },
    {
      field: 'projectNecessity',
      label: '项目必要性',
      component: 'InputTextArea',
      colProps: { span: 24 },
      rules: [
        { required: true, message: '请输入200至5000位汉字、符号、字母或数字', trigger: 'blur' },
        getInputTextAreaPattern(5000, 'blur', 200),
      ],
      componentProps: {
        placeholder: '不少于200个字',
        autoSize: { minRows: 5, maxRows: 8 },
        showCount: true,
        maxlength: 5000,
      },
    },
    {
      field: 'feasibilityAnalysis',
      label: '项目可行性分析',
      component: 'InputTextArea',
      colProps: { span: 24 },
      rules: [
        { required: true, message: '请输入200至5000位汉字、符号、字母或数字', trigger: 'blur' },
        getInputTextAreaPattern(5000, 'blur', 200),
      ],
      componentProps: {
        placeholder: '不少于200个字',
        autoSize: { minRows: 5, maxRows: 8 },
        showCount: true,
        maxlength: 5000,
      },
    },
    {
      field: 'performanceObjectives',
      label: '绩效目标',
      component: 'InputTextArea',
      colProps: { span: 24 },
      rules: [
        { required: true, message: '请输入300至5000位汉字、符号、字母或数字', trigger: 'blur' },
        getInputTextAreaPattern(5000, 'blur', 300),
      ],
      helpMessage: '含数量指标、质量指标、社会效益指标、服务对象满意度指标等。',
      componentProps: {
        placeholder: '不少于300个字',
        autoSize: { minRows: 5, maxRows: 8 },
        showCount: true,
        maxlength: 5000,
      },
    },
    {
      field: 'implementationProgress',
      label: '项目实施进度计划',
      component: 'InputTextArea',
      colProps: { span: 24 },
      rules: [
        { required: true, message: '请输入1至5000位汉字、符号、字母或数字', trigger: 'blur' },
        getInputTextAreaPattern(5000, 'blur', 1),
      ],
      componentProps: {
        placeholder: '按计划填报',
        autoSize: { minRows: 5, maxRows: 8 },
        showCount: true,
        maxlength: 5000,
      },
    },
    {
      field: 'remark',
      label: '说明',
      component: 'InputTextAreaWarn',
      colProps: { span: 24 },
      // rules: [
      //   { required: true, message: '请输入1至5000位汉字、符号、字母或数字', trigger: 'blur' },
      // ],
      componentProps: {
        warn: '已确定经费来源、或其他情况请在此说明',
        placeholder: '按计划填报',
        autoSize: { minRows: 5, maxRows: 8 },
        showCount: true,
        maxlength: 5000,
      },
    },
  ];
};
