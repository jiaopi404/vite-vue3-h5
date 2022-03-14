import { getNamePatternNoSpaceRule } from '/@/utils/helper/validateRuleHelper';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { lxTableColumnProjectBidsectionRender } from '/@/components/LxComponents';
import { codeNameFilter, getSecretMobile } from '/@/utils/commonServe/businessUtil';
const configStore = useConfigStoreWithOut();
export const roleListTableSchema: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'bidSection.proName',
    width: 120,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record.bidSection, record.bidSection);
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
  },
  {
    title: '采购方式',
    dataIndex: 'bidSection.procurementMethod.name',
    width: 120,
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
    title: '中标供应商',
    dataIndex: 'biddingCompany.name',
    width: 120,
  },
  {
    title: '中标代表人',
    dataIndex: 'bidWinner.perName',
    width: 240,
    format: (_text, record) => {
      const mobile = getSecretMobile(record.bidWinner ? record.bidWinner.mobile : '');
      const tel = record.bidWinner ? (record.bidWinner.mobile ? `(${mobile})` : '') : '';
      const perName = record.bidWinner
        ? record.bidWinner.perName
          ? record.bidWinner.perName
          : ''
        : '';
      return `${perName}${tel}`;
    },
  },
  {
    title: '中标金额',
    dataIndex: 'bidWinningAmount',
    width: 120,
    align: 'left',
    sorter: true,
    format: (_text, record) => {
      const bidWinningAmount = record?.bidWinner?.bidWinningAmount
        ? record?.bidWinner?.bidWinningAmount +
          (record.bidSection.project.currencyType?.code === '1'
            ? '元'
            : record.bidSection.project.currencyType?.name)
        : record?.bidWinner?.bidWinningAmount === 0
        ? record?.bidWinner?.bidWinningAmount +
          (record.bidSection.project.currencyType?.code === '1'
            ? '元'
            : record.bidSection.project.currencyType?.name)
        : '';
      return bidWinningAmount;
    },
  },
  {
    title: '中标日期',
    dataIndex: 'bidWinner?.bidWinningDate',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.bidWinner?.bidWinningDate);
    },
  },
  {
    title: '完成日期',
    dataIndex: 'bidSection.completeDate',
    width: 120,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.bidSection.completeDate);
    },
  },
];

export const roleSearchFormSchema: FormSchema[] = [
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
    field: 'orgName',
    label: '供应商名称',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入供应商名称',
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
];

const EDIT_ROLE_FORM_ITEM_COL_SPAN = 24;
export const editRoleFormSchema: FormSchema[] = [
  {
    field: 'descripTive',
    component: 'InputTextArea',
    label: '描述',
    componentProps: {
      placeholder: '请输入描述',
      rows: 4,
    },
    colProps: { span: EDIT_ROLE_FORM_ITEM_COL_SPAN },
    rules: [
      {
        required: true,
        trigger: 'blur',
      },
      getNamePatternNoSpaceRule(5000, ['change', 'blur'], 1),
    ],
    required: true,
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
      `4. 单次上传文件最大个数：${configStore.GET_CONFIG_BASEINFO?.uploadImageMaxCount}`,
    ],
    colProps: {
      span: 24,
    },
    rules: [{ message: '请选择上传采购文件', trigger: 'change', type: 'array' }],
    defaultValue: [],
  },
];
