import { spawn } from 'child_process';
import { Slots } from 'vue';
import { contentProps } from './../../../../../components/Menu/src/props';
import { DescItem } from '/@/components/Description/index';
import { renderTime } from '/@/components/Time';
import { Tooltip } from 'ant-design-vue';
const AccountColumns = (): DescItem[] => [
  {
    label: '专家名称',
    field: 'addUserName',
  },
  {
    label: '审批时间',
    field: 'addDateTime',
    span: 2,
    render: (curVal) => {
      return renderTime(curVal, true);
    },
  },
  {
    label: '审批意见',
    field: 'reviewOpinion',
    span: 4,
  },
  {
    label: '供应商',
    field: 'successfulSupplier',
    render: (curVal, data) => {
      console.log(curVal, data, 'curValcurValcurVal');
      // let a = `<div v-for="(item,index) in data.reviewInfo" :key="index">
      //           <div>{{item.result}}</div>
      //         </div>`;
      return data.reviewInfo.forEach((i) => {
        return i.result;
      });
    },
  },
  {
    label: '评审情况',
    field: 'result',
  },
];
export { AccountColumns };
