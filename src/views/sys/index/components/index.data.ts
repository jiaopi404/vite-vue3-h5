import { ProcessAlreadyDoneI, ProcessWaitDealI } from '/#/business';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { FormSchema } from '/@/components/Form';
import {
  lxTableColumnIndexMyBusinessRender,
  lxTableColumnIndexProcessObjectNameRender,
  lxTableColumnIndexReportJumper,
} from '/@/components/LxComponents';
import { BasicColumn } from '/@/components/Table';
import { renderTime } from '/@/components/Time';
import { ProcessApplyObjectTypeEnum, ProcessApplyObjectTypeMap } from '/@/enums/businessEnum';
import {
  getAmountWithCurencyName,
  getPersonNameFormatter,
} from '/@/utils/commonServe/businessUtil';
import { useConfigStoreWithOut } from '/@/store/modules/config';
import { useIndexDialogToReport } from '/@/enums/reportUrlEnum';

const { indexDialogToReportProjectReport } = useIndexDialogToReport();

export const myProjectTableColumns: BasicColumn[] = [
  {
    title: '项目名称',
    dataIndex: 'project.proName',
    customRender: ({ record }) => {
      const payload = indexDialogToReportProjectReport(record.project);
      return lxTableColumnIndexReportJumper(record.project.proName, payload);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'project.purchaseNumber',
    width: 120,
  },
  {
    title: '采购类型',
    dataIndex: 'project.projectType',
    width: 120,
    format: (_text, record) => {
      return record.project.projectType?.name;
    },
  },
  {
    title: '预算金额',
    dataIndex: 'project.budgetAmount',
    width: 120,
    format: (_text, record) => {
      return (
        record.project.budgetAmount +
        (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
      );
    },
  },
  {
    title: '项目负责人',
    dataIndex: 'project.proChargeUser',
    width: 160,
    format: (_text, record) => {
      return getPersonNameFormatter()(record?.project?.proChargeUser);
    },
  },
  {
    title: '添加日期',
    dataIndex: 'project.addDateTime',
    width: 120,
    customRender: ({ text }) => {
      return renderTime(text);
    },
  },
];

export const myProjectFormSchema = (): FormSchema[] => {
  const configStore = useConfigStoreWithOut();
  return [
    {
      field: 'proName',
      label: '项目名称',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请输入项目名称',
      },
    },
    {
      field: 'purchaseNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请输入项目编号',
      },
    },
    {
      field: 'purchaseType',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 12 },
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
};

export const todoTaskTableColumns = (tagModuleListRef): BasicColumn[] => [
  {
    title: '业务名称',
    dataIndex: 'processObjectName',
    customRender: ({ record }: { record: ProcessAlreadyDoneI | ProcessWaitDealI }) => {
      return lxTableColumnIndexProcessObjectNameRender(record);
    },
  },
  {
    title: '模块属性',
    dataIndex: 'tagModuleId',
    customRender: ({ record }: { record: ProcessAlreadyDoneI | ProcessWaitDealI }) => {
      const tagModuleId = Number(record.tagModuleId);
      return (
        tagModuleListRef.value.find((tagModule) => tagModule.id === tagModuleId)?.name || '模块'
      );
    },
    width: 140,
  },
  {
    title: '业务编号',
    dataIndex: 'processObjectCode',
    width: 120,
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 120,
    customRender: ({ record }: { record: ProcessAlreadyDoneI | ProcessWaitDealI }) => {
      return getAmountWithCurencyName(record.amount, { name: record.currencyTypeName });
    },
  },
];

export const todoTaskFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'processObjectCode',
      label: '业务编号',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入业务编号',
      },
    },
    {
      field: 'applyObjectType',
      label: '业务类型',
      component: 'Select',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请选择业务类型',
        options: [
          {
            label: '项目',
            value: 'pro_project',
            key: 'pro_project',
          },
          {
            label: '标段',
            value: 'pro_bidSection',
            key: 'pro_bidSection',
          },
          {
            label: '合同',
            value: 'con_contract',
            key: 'con_contract',
          },
          {
            label: '验收',
            value: 'pro_acceptance',
            key: 'pro_acceptance',
          },
        ],
        showSearch: true,
        labelField: 'label',
        valueField: 'value',
        optionFilterProp: 'label',
      },
    },
    {
      field: 'businessStage',
      label: '业务阶段',
      component: 'RadioGroup',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请选择业务阶段',
        options: [
          {
            value: 0,
            label: '待办',
          },
          {
            value: 1,
            label: '已办',
          },
          {
            value: 2,
            label: '暂缓',
          },
        ],
      },
      defaultValue: 0,
    },
  ];
};

export const myBusinessTableColumns: BasicColumn[] = [
  {
    title: '业务编号',
    dataIndex: 'objNumber',
    // customRender: ({ record }) => {
    //   return lxTableColumnIndexMyBusinessRender(record);
    // },
  },
  {
    title: '业务类型',
    dataIndex: 'type',
    customRender: ({ record }) => {
      return ProcessApplyObjectTypeMap.get(record.type);
    },
    width: 120,
  },
  {
    title: '业务名称',
    dataIndex: 'name',
    customRender: ({ record }) => {
      return lxTableColumnIndexMyBusinessRender(record);
    },
  },
  {
    title: '业务金额',
    dataIndex: 'amount',
    width: 120,
    format: (_, record) => {
      return getAmountWithCurencyName(record.amount || 0, { name: record.currencyTypeName });
    },
  },
  {
    title: '添加时间',
    dataIndex: 'addDateTime',
    width: 120,
    customRender: ({ text }) => {
      return renderTime(text);
    },
  },
  {
    title: '业务状态',
    dataIndex: 'statusName',
    width: 120,
  },
];

export const myBusinessFormSchema = (): FormSchema[] => {
  return [
    {
      field: 'objNumber',
      label: '业务编号',
      component: 'Input',
      colProps: { span: 12 },
      componentProps: {
        autoSubmitOnEnter: true,
        placeholder: '请输入业务编号',
      },
    },
    {
      field: 'type',
      label: '业务类型',
      component: 'Select',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请选择业务类型',
        options: [
          {
            label: '项目',
            value: 'pro_project',
            key: 'pro_project',
          },
          {
            label: '合同',
            value: 'con_contract',
            key: 'con_contract',
          },
        ],
        showSearch: true,
        labelField: 'label',
        valueField: 'value',
        optionFilterProp: 'label',
      },
    },
    {
      field: 'amount',
      label: '业务金额',
      component: 'LxInputNumberDouble',
      colProps: { span: 12 },
      componentProps: {
        placeholder: '请输入业务金额',
        min: 0,
        max: 1000000000,
        step: 1,
      },
    },
  ];
};
