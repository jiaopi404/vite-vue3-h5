import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { HqlQueryDtoI } from '/#/business';
import { renderTime } from '/@/components/Time';

import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();
import { lxTableColumnProjectBudgetRender } from '/@/components/LxComponents';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { codeNameFilter, getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
import { dateUtil } from '/@/utils/dateUtil';

const columns = (): BasicColumn[] => [
  {
    title: '所属年份',
    dataIndex: 'year',
    width: 80,
    fixed: 'left',
  },
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 180,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBudgetRender(record);
    },
  },
  {
    title: '项目类型',
    dataIndex: 'projectType.name',
    width: 100,
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 100,
    format: (_text, record) => {
      return _text + (record.currencyType?.code === '1' ? '元' : record.currencyType?.name);
    },
    sorter: true,
  },
  {
    title: '归口部门',
    dataIndex: 'relevantDep.name',
    width: 100,
    ifShow: () => {
      return !!configStore.GET_CONFIG_MODULE.ifCentralizedDepartment;
    },
  },
  {
    title: '项目负责人及电话',
    dataIndex: 'proChargeUser',
    width: 160,
    format: (_text, record) => {
      return getPersonNameFormatter()(record.proChargeUser);
    },
  },
  // {
  //   title: '项目起止时间',
  //   dataIndex: 'time',
  //   width: 180,
  //   format: (_text, record) => {
  //     return `${dateUtil(record.startTime).format('YYYY-MM-DD')} ~  ${dateUtil(
  //       record.endTime,
  //     ).format('YYYY-MM-DD')}`;
  //   },
  // },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.addDateTime);
    },
  },
  // {
  //   title: 'operation',
  //   dataIndex: 'operation',
  //   slots: { customRender: 'operation' },
  // },
];

// 查询项表单
const searchFormSchema = (): FormSchema[] => [
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
    field: 'projectTypeId',
    label: '项目类型',
    component: 'ApiSelect',
    colProps: { span: 8 },
    componentProps: {
      api: getDictionaryByParentId,
      params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
      placeholder: '请选择项目类型',
      labelField: 'name',
      valueField: 'id',
      showSearch: true,
      optionFilterProp: 'label',
    },
  },
];

// 搜索条件
const pageAndSort = (): HqlQueryDtoI => ({
  hqlPageAndSortSumDto: {
    ifCustomHql: true,
    queryList: [
      {
        param: 'proBudget.ifDelete',
        type: 'equal',
        value: [0],
      },
      {
        param: 'proBudget.addUser.id',
        type: 'equal',
        value: [userStore.getUserInfo.id],
      },
      // 项目库状态 1待申报 2审核中 3 已完成
      {
        param: 'proBudget.status.code',
        type: 'equal',
        value: [3],
      },
    ],
    dataFieldList: ['proBudget', 'proBudget.id'],
    page: {
      pageNum: 1,
      pageSize: 10,
    },
    sorts: [
      {
        dir: 'desc',
        prop: 'proBudget.id',
      },
    ],
  },
});

export { columns, searchFormSchema, pageAndSort };
