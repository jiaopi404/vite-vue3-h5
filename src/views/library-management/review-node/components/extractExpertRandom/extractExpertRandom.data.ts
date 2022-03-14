import { BasicColumn } from '/@/components/Table';
import {
  LxStatusTagColorEnum,
  LxStatusTagOptionI,
  renderLxStatusTag,
} from '/@/components/LxComponents';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';

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
const EXTRACT_CONDITION_RESEARCH_AREA_TYPE_PREFIX = 'dictionary.';
export const extractExpertRandomExtractConditionTableSchema = (): BasicColumn[] => [
  {
    title: '专业类型',
    dataIndex: `${EXTRACT_CONDITION_RESEARCH_AREA_TYPE_PREFIX}name`,
    width: 150,
  },
  {
    title: '专业',
    dataIndex: `${EXTRACT_CONDITION_PREFIX}researchAreaNames`,
    width: 150,
  },
  {
    title: '抽取人数',
    dataIndex: `${EXTRACT_CONDITION_PREFIX}userNumber`,
    width: 120,
  },
  {
    title: '已抽取人数',
    dataIndex: `${EXTRACT_CONDITION_PREFIX}userCount`,
    width: 120,
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
const EXTRACT_DETAIL_PREFIX_USER = 'user.';
const EXTRACT_DETAIL_PREFIX_EXTEND = 'userExtend.';
const EXTRACT_DETAIL_PREFIX_PRO_EXT = 'proExtraction.';
const EXTRACT_EXPERT_REPLY_STATUS_OPTIONS: LxStatusTagOptionI[] = [
  { value: 1, label: '未回复', color: LxStatusTagColorEnum.GRAY },
  { value: 2, label: '参与', color: LxStatusTagColorEnum.GREEN },
  { value: 3, label: '不参与', color: LxStatusTagColorEnum.RED },
];
export const extractExpertRandomExtractDetailTableSchema = (): BasicColumn[] => [
  {
    title: '专家姓名',
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
    title: '专业',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_EXTEND}researchAreaNames`,
    width: 150,
  },
  {
    title: '学历',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_EXTEND}schoolingRecord.name`,
    width: 150,
  },
  {
    title: '学位',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_EXTEND}academicDegree.name`,
    width: 150,
  },
  {
    title: '职称',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_EXTEND}academicTitle.name`,
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
