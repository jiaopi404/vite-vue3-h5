import { BasicColumn, FormSchema } from '/@/components/Table';
import {
  LxStatusTagColorEnum,
  LxStatusTagOptionI,
  renderLxStatusTag,
} from '/@/components/LxComponents';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';

export const companyExtCondFormSchema = (): FormSchema[] => [
  {
    field: 'keyword',
    component: 'Input',
    label: '关键字：',
    slot: 'slotKeyword',
    colProps: {
      span: 6,
    },
    // rules: [{ required: true, message: '请输入关键字', trigger: 'change', type: 'string' }],
  },
  {
    field: 'companyCount',
    component: 'Input',
    label: '可抽取公司数：',
    slot: 'slotCompanyCount',
    colProps: {
      span: 6,
    },
    defaultValue: 0,
  },
];

const EXTRACT_CONDITION_STATUS_OPTIONS: LxStatusTagOptionI[] = [
  {
    value: 1,
    label: '待抽取',
    color: LxStatusTagColorEnum.BLUE,
  },
  {
    value: 2,
    label: '抽取中',
    color: LxStatusTagColorEnum.ORANGE,
  },
  {
    value: 3,
    label: '抽取失败',
    color: LxStatusTagColorEnum.RED,
  },
  {
    value: 4,
    label: '抽取完成',
    color: LxStatusTagColorEnum.GREEN,
  },
];
// 抽取条件列表表格 schema
const EXTRACT_CONDITION_PREFIX = 'proExtractionConditions.';
export const extractCompanyRandomExtractConditionTableSchema = (): BasicColumn[] => [
  {
    title: '关键字',
    dataIndex: `${EXTRACT_CONDITION_PREFIX}keyWord`,
    width: 150,
  },
  {
    title: '状态',
    dataIndex: `${EXTRACT_CONDITION_PREFIX}status`,
    width: 150,
    customRender: ({ text }) => {
      return renderLxStatusTag(text, EXTRACT_CONDITION_STATUS_OPTIONS);
    },
  },
  {
    title: '添加日期',
    dataIndex: `${EXTRACT_CONDITION_PREFIX}addDateTime`,
    width: 100,
    customRender: ({ text }) => {
      return renderTime(text);
    },
  },
];
const EXTRACT_DETAIL_PREFIX_USER = 'biddingCompany.user.';
const EXTRACT_DETAIL_PREFIX_BIDDING_COMPANY = 'biddingCompany.';
const EXTRACT_DETAIL_PREFIX_PRO_EXT = 'proExtraction.';
const EXTRACT_EXPERT_REPLY_STATUS_OPTIONS: LxStatusTagOptionI[] = [
  { value: 1, label: '未回复', color: LxStatusTagColorEnum.GRAY },
  { value: 2, label: '参与', color: LxStatusTagColorEnum.GREEN },
  { value: 3, label: '不参与', color: LxStatusTagColorEnum.RED },
];
export const companyProExtListRandomSchema = (): BasicColumn[] => [
  {
    title: '招标公司',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_BIDDING_COMPANY}name`,
    width: 150,
  },
  {
    title: '业务联系人',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_USER}perName`,
    width: 150,
  },
  {
    title: '手机号',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_USER}mobile`,
    width: 150,
    format: (text) => {
      return getSecretMobile(text);
    },
  },
  {
    title: '回复状态',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_PRO_EXT}status`,
    width: 150,
    customRender: ({ text }) => {
      return renderLxStatusTag(text, EXTRACT_EXPERT_REPLY_STATUS_OPTIONS);
    },
  },
  {
    title: '发送次数',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_PRO_EXT}sendFrequency`,
    width: 150,
  },
  {
    title: '抽取时间',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_PRO_EXT}addDateTime`,
    width: 100,
    customRender: ({ text }) => {
      return renderTime(text, true);
    },
  },
  {
    title: '回复时间',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_PRO_EXT}replyTime`,
    width: 100,
    customRender: ({ text }) => {
      return renderTime(text, true);
    },
  },
];
