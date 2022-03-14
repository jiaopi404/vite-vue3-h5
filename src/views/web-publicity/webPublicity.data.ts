import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';

import { getDictionaryByParentId } from '/@/api/demo/system';
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { orParamsFormatter } from '/@/utils/commonServe/businessUtil';
// import { dateUtil } from '/@/utils/dateUtil';

// 表单
const searchFormSchema = (): FormSchema[] => [
  {
    field: 'proName',
    label: '项目关键词',
    component: 'Input',
    colProps: { span: 8 },
    componentProps: {
      placeholder: '请输入项目关键词',
    },
  },
  {
    field: 'projectTypeId',
    label: '采购类型',
    component: 'ApiRadioGroup',
    colProps: { span: 8 },
    componentProps: {
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
      labelField: 'name',
      valueField: 'id',
      isBtn: true,
      onChange: (e: Event) => {
        console.log('change event:', e);
      },
    },
  },
  // {
  //   field: 'projectTypeId2',
  //   label: '中标时间',
  //   component: 'RadioGroup',
  //   colProps: { span: 8 },
  //   componentProps: {
  //     api: getDictionaryByParentId,
  //     params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
  //     placeholder: '请选择采购类型',
  //     labelField: 'name',
  //     valueField: 'id',
  //     showSearch: true,
  //     optionFilterProp: 'label',
  //   },
  // },
];

// 今日更新统计
const todayPageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'bidSection.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'bidSection.status.code',
        type: 'equal',
        value: [18],
      },
      {
        param: 'bidSection.procurementMethod.node',
        type: 'equal',
        value: [1],
      },
      {
        param: 'project.quoteStartTime',
        type: 'gt',
        value: ['2022-01-20 00:00:00'],
      },
      {
        param: 'project.quoteStartTime',
        type: 'lt',
        value: ['2022-01-20 23:59:59'],
      },
    ],
    dataFieldList: ['bidSection', 'bidSection.id'],
    page: {
      pageNum: 1,
      pageSize: 10,
    },
    sorts: [
      {
        dir: 'desc',
        prop: 'bidSection.id',
      },
    ],
  },
});

// 通知公告
const informPageAndSort = (pageNum: number): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'notice.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'notice.useMark',
        type: 'equal',
        value: [1],
      },
      // {
      //   param: 'notice.role',
      //   type: 'equal',
      //   value: [1],
      // },
      {
        param: '',
        type: 'or',
        value: [orParamsFormatter(`(notice.role = 1 or notice.role = 0)`)],
      },
    ],
    dataFieldList: ['notice', 'notice.id'],
    page: {
      pageNum,
      pageSize: 5,
    },
    sorts: [
      {
        dir: 'desc',
        prop: 'notice.addDateTime',
      },
      {
        dir: 'desc',
        prop: 'notice.id',
      },
    ],
  },
});

// 常用下载
const downloadPageAndSort = (pageNum: number): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'commonFile.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'commonFile.useMark',
        type: 'equal',
        value: [1],
      },
      // {
      //   param: 'commonFile.role',
      //   type: 'equal',
      //   value: [1],
      // },
      // 修改部分
      {
        param: '',
        type: 'or',
        value: [orParamsFormatter(`(commonFile.role = 1 or commonFile.role = 0)`)],
      },
    ],
    dataFieldList: ['commonFile', 'commonFile.id'],
    page: {
      pageNum,
      pageSize: 5,
    },
    sorts: [
      {
        dir: 'desc',
        prop: 'commonFile.addDateTime',
      },
      {
        dir: 'desc',
        prop: 'commonFile.id',
      },
    ],
  },
});

// 采购公告
// http://127.0.0.1:8085/purchase/bidSection/getBidSectionPageByQueryDtoNew
const purchasePageAndSort = (pageNum: number): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'bidSection.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'bidSection.status.code',
        type: 'equal',
        value: [18],
      },
      {
        param: 'bidSection.procurementMethod.node',
        type: 'equal',
        value: [1],
      },
      // 开始时间小于当前时间
      // {
      //   param: 'project.quoteStartTime',
      //   type: 'lt',
      //   value: [dateUtil().format('YYYY-MM-DD HH:mm:ss')],
      // },

      // {
      //   param: 'project.quoteEndTime',
      //   type: 'gt',
      //   value: [dateUtil().format('YYYY-MM-DD HH:mm:ss')],
      // },
    ],
    dataFieldList: ['bidSection', 'bidSection.id'],
    page: {
      pageNum,
      pageSize: 6,
    },
    sorts: [
      {
        dir: 'desc',
        prop: 'bidSection.id',
      },
    ],
  },
});

// 结果公告
// http://127.0.0.1:8085/purchase/bidSection/getBidSectionPageByQueryDtoNew
const resultsPageAndSort = (pageNum: number): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'bidSection.ifDelete',
        type: 'equal',
        value: [0],
      },
      // 项目中标表是否删除
      {
        param: 'bidWinner.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'bidSection.status.code',
        type: 'gt',
        value: [20],
      },
      {
        param: 'bidSection.procurementMethod.node',
        type: 'equal',
        value: [1],
      },
    ],
    // dataFieldList: ['bidSection', 'bidSection.id'],
    dataFieldList: ['bidSection', 'bidWinner', 'biddingCompany'],
    page: {
      pageNum,
      pageSize: 6,
    },
    sorts: [
      {
        dir: 'desc',
        prop: 'bidSection.id',
      },
    ],
  },
});

export {
  searchFormSchema,
  todayPageAndSort,
  informPageAndSort,
  downloadPageAndSort,
  purchasePageAndSort,
  resultsPageAndSort,
};
