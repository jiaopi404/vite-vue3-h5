import { BasicColumn, FormSchema } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { lxTableColumnProjectBudgetRender } from '/@/components/LxComponents';
import { dateUtil } from '/@/utils/dateUtil';
import { getPersonNameFormatter } from '/@/utils/commonServe/businessUtil';
import { getDepTreeList } from '/@/api/demo/system';
import { useUserStoreWithOut } from '/@/store/modules/user';
const userStore = useUserStoreWithOut();
import { useConfigStoreWithOut } from '/@/store/modules/config';
const configStore = useConfigStoreWithOut();

export const auditListTableScheam = (): BasicColumn[] => [
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
  },
  {
    title: '项目负责人及电话',
    dataIndex: 'proChargeUser',
    width: 160,
    format: (_text, record) => {
      return getPersonNameFormatter()(record.proChargeUser);
    },
  },
  {
    title: '项目起止时间',
    dataIndex: 'time',
    width: 180,
    format: (_text, record) => {
      return `${dateUtil(record.startTime).format('YYYY-MM-DD')} ~  ${dateUtil(
        record.endTime,
      ).format('YYYY-MM-DD')}`;
    },
  },
  {
    title: '添加日期',
    dataIndex: 'addDateTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.addDateTime);
    },
  },
];
export const searchFormSchema = (): FormSchema[] => {
  const orgId = configStore.GET_CONFIG_BASEINFO.orgId;
  return [
    {
      field: 'proName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        autoSubmitOnEnter: true,
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
    {
      field: 'declareDeptId',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDepTreeList,
        params: userStore.getUserInfo.orgId,
        placeholder: '请选择申报部门',
        // resultField: 'data',
        replaceFields: {
          children: 'children',
          key: 'id',
          value: 'id',
          title: 'name',
        },
      },
    },
  ];
};
