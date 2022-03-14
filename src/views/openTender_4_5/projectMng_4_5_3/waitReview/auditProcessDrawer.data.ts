import { BasicColumn } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
const AccountColumns = (): BasicColumn[] => [
  {
    title: '专家名称',
    dataIndex: 'proExtraction.returnUser.perName',
    width: 150,
    format: (_text, record) => {
      return getPersonNameFormatter()(record.proExtraction.returnUser);
    },
  },
  {
    title: '审批时间',
    dataIndex: 'addDateTime',
    width: 150,
    customRender: ({ record }) => {
      return record.addDateTime ? renderTime(record?.addDateTime, false, true) : null;
    },
  },
  {
    title: '审批意见',
    dataIndex: 'indACommRegAdd',
    format: (_text, record) => {
      return record.reviewOpinion ? record.reviewOpinion : null;
    },
  },
];
export { AccountColumns };
