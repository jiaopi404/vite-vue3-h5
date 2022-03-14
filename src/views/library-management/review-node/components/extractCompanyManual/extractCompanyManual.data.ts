import { FormSchema } from '/@/components/Form';
import {
  LxStatusTagColorEnum,
  LxStatusTagOptionI,
  renderLxStatusTag,
} from '/@/components/LxComponents';
import { BasicColumn } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
// import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';

const COMPANY_PREFIX = 'biddingCompany.';
// const COMPANY = 'biddingCompany';
const COMPANY_CHARGE_USER_PREFIX = 'user.';
export const companyListTableSchema = (): BasicColumn[] => {
  // const personFormatter = getPersonNameFormatter();
  return [
    {
      title: '公司名称',
      dataIndex: `${COMPANY_PREFIX}name`,
      width: 220,
    },
    {
      title: '业务联系人',
      dataIndex: `${COMPANY_PREFIX + COMPANY_CHARGE_USER_PREFIX}perName`,
      width: 220,
    },
    {
      title: '联系电话',
      dataIndex: `${COMPANY_PREFIX + COMPANY_CHARGE_USER_PREFIX}mobile`,
      width: 220,
    },
    {
      title: '公司法人姓名',
      dataIndex: `${COMPANY_PREFIX}legalperName`,
      width: 120,
    },
    {
      title: '公司法人手机号',
      dataIndex: `${COMPANY_PREFIX}legalperTel`,
      width: 120,
    },
    {
      title: '添加日期',
      dataIndex: `${COMPANY_PREFIX}adddateTime`,
      width: 120,
      customRender: ({ text }) => {
        return renderTime(text);
      },
    },
  ];
};

export const companyListQueryFormSchema: FormSchema[] = [
  {
    field: 'name',
    label: '公司名称',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      placeholder: '请输入公司名称',
    },
    defaultValue: '',
  },
  {
    field: 'perName',
    label: '业务联系人',
    component: 'Input',
    colProps: { span: 12 },
    componentProps: {
      placeholder: '请输入业务联系人',
    },
  },
];

const EXTRACT_DETAIL_PREFIX_USER = 'biddingCompany.user.';
const EXTRACT_DETAIL_PREFIX_BIDDING_COMPANY = 'biddingCompany.';
// const EXTRACT_DETAIL_PREFIX_EXTEND = 'userExtend.';
const EXTRACT_DETAIL_PREFIX_PRO_EXT = 'proExtraction.';
const EXTRACT_EXPERT_REPLY_STATUS_OPTIONS: LxStatusTagOptionI[] = [
  { value: 1, label: '未回复', color: LxStatusTagColorEnum.GRAY },
  { value: 2, label: '参与', color: LxStatusTagColorEnum.GREEN },
  { value: 3, label: '不参与', color: LxStatusTagColorEnum.RED },
];
export const companyProExtListSchema = (): BasicColumn[] => [
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
    // format: (text) => { // 手动抽取不需要隐藏手机号
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
