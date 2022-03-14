import { FormSchema } from '/@/components/Form';
import {
  LxStatusTagColorEnum,
  LxStatusTagOptionI,
  renderLxStatusTag,
} from '/@/components/LxComponents';
import { BasicColumn } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { getGenderText, getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';

const EXPERT_PREFIX = 'userExtend.';
const USER_PREFIX = 'user.';
const USER = 'user';
export const expertListTableSchema = (): BasicColumn[] => {
  const personFormatter = getPersonNameFormatter();
  return [
    {
      title: '专家',
      dataIndex: USER,
      width: 220,
      format: (_, record) => {
        return personFormatter(record?.[USER]);
      },
    },
    {
      title: '单位名称',
      dataIndex: `${USER_PREFIX}orgName`,
      width: 120,
    },
    {
      title: '专业',
      dataIndex: `${EXPERT_PREFIX}researchAreaNames`,
      width: 140,
    },
    {
      title: '性别',
      dataIndex: `${USER_PREFIX}sexCode`,
      width: 70,
      format: (text) => {
        return getGenderText(text);
      },
    },
    {
      title: '学历',
      dataIndex: `${EXPERT_PREFIX}schoolingRecord.name`,
      width: 90,
    },
    {
      title: '学位',
      dataIndex: `${EXPERT_PREFIX}academicDegree.name`,
      width: 70,
    },
    {
      title: '职称',
      dataIndex: `${EXPERT_PREFIX}academicTitle.name`,
      width: 70,
    },
    {
      title: '邮箱',
      dataIndex: `${EXPERT_PREFIX}email`,
      width: 200,
    },
  ];
};

export const expertListQueryFormSchema = (): FormSchema[] => [
  {
    field: 'expertName',
    label: '专家姓名',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      placeholder: '请输入专家姓名',
    },
  },
  {
    field: 'expertMobile',
    label: '手机号码',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      placeholder: '请输入手机号码',
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
export const extractExpertManualExtractDetailTableSchema = (): BasicColumn[] => [
  {
    title: '专家姓名',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_USER}perName`,
    width: 150,
  },
  {
    title: '手机号',
    dataIndex: `${EXTRACT_DETAIL_PREFIX_USER}mobile`,
    width: 150,
    // format: (text) => {
    //   return getSecretMobile(text);
    // },
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
