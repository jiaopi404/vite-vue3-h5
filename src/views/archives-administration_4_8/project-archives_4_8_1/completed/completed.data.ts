import { biddingCompanyI } from './../../../../api/review-node/model/biddingCompanyModel';
import { FormSchema } from '/@/components/Form';
import { BasicColumn } from '/@/components/Table';
import { getDictionaryByParentId } from '/@/api/demo/system';
import { renderTime } from '/@/components/Time';
import { getSecretMobile } from '/@/utils/commonServe/businessUtil';
import {
  lxTableColumnProjectBidsectionRender,
  lxTableColumnReportSupplierRender,
} from '/@/components/LxComponents';
import { useConfigStoreWithOut, useConfigStore } from '/@/store/modules/config';
// 引入接口
import { getDepartmentTreeListByOrgId } from '/@/api/purchase/plan-purchase';
const configStore = useConfigStoreWithOut();
const useConfigStoreData = useConfigStore();

// 查询参数
export const completedSearchFormSchema = (): FormSchema[] => {
  const orgId = useConfigStoreData.GET_CONFIG_BASEINFO.orgId;
  return [
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
      field: 'proNumber',
      label: '项目编号',
      component: 'Input',
      colProps: { span: 8 },
      componentProps: {
        placeholder: '请输入项目编号',
      },
    },
    {
      field: 'declareDept',
      label: '申报部门',
      component: 'ApiTreeSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDepartmentTreeListByOrgId,
        params: orgId,
        placeholder: '请选择申报部门',
        resultField: 'data', // 接口返回的字段，如果接口返回数组，可以不填。支持x.x.x格式
        replaceFields: {
          children: 'children',
          key: 'id',
          value: 'id',
          title: 'name',
        },
      },
    },
    {
      field: 'projectType',
      label: '采购类型',
      component: 'ApiSelect',
      colProps: { span: 8 },
      componentProps: {
        api: getDictionaryByParentId,
        params: configStore.GET_CONFIG_DICTIONRY.projectTypeId,
        placeholder: '请选择采购类型',
        labelField: 'name',
        valueField: 'code',
        showSearch: true,
        optionFilterProp: 'label',
      },
    },
    {
      field: 'budgetAmount',
      label: '预算金额',
      component: 'LxInputNumberDouble',
      colProps: { span: 8 },
      componentProps: {
        min: 0.0,
        max: 1000000000.0,
        step: 0.01,
      },
    },
    {
      field: 'bidWinningAmount',
      label: '中标金额',
      component: 'LxInputNumberDouble',
      colProps: { span: 8 },

      componentProps: {
        min: 0.0,
        max: 1000000000.0,
        step: 0.01,
      },
    },
    {
      field: 'planPurchaseTime',
      label: '计划采购时间',
      component: 'RangePicker',
      colProps: { span: 8 },
    },
  ];
};

// 表格数据
export const completedTableScheam = (): BasicColumn[] => [
  {
    title: '项目名称',
    dataIndex: 'proName',
    width: 130,
    fixed: 'left',
    customRender: ({ record }) => {
      return lxTableColumnProjectBidsectionRender(record, record);
    },
  },
  {
    title: '项目编号',
    dataIndex: 'proNumber',
    width: 100,
    fixed: 'left',
  },
  {
    title: '预算金额',
    dataIndex: 'budgetAmount',
    width: 90,
    fixed: 'left',
    sorter: true,
    format: (_text, record) => {
      return (
        record.budgetAmount +
        (record.project.currencyType.code === '1' ? '元' : record.project.currencyType.name)
      );
    },
  },
  {
    title: '采购类型',
    dataIndex: 'project.projectType.name',
    width: 80,
  },
  {
    title: '采购方式',
    dataIndex: 'procurementMethod.name',
    width: 80,
  },

  {
    title: '申报部门',
    dataIndex: 'project.declareDept.name',
    width: 100,
  },
  {
    title: '项目负责人',
    dataIndex: 'proChargeUser',
    width: 120,
    format: (_text, record) => {
      const mobile = getSecretMobile(
        record.project?.proChargeUser ? record.project?.proChargeUser?.mobile : '',
      );
      const tel = record.project?.proChargeUser
        ? record.project?.proChargeUser?.mobile
          ? `(${mobile})`
          : ''
        : '';
      const perName = record.project?.proChargeUser
        ? record.project?.proChargeUser?.perName
          ? record.project?.proChargeUser?.perName
          : ''
        : '';
      return `${perName}${tel}`;
    },
  },
  {
    title: '计划采购时间',
    dataIndex: 'project.planPurchaseTime',
    width: 130,
    sorter: true,
    customRender: ({ record }) => {
      return record.project.planPurchaseTime ? renderTime(record.project.planPurchaseTime) : '';
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
  {
    title: '是否废标',
    dataIndex: 'ifAbandonedBid',
    width: 80,
    format: (_text, record) => {
      return record.ifAbandonedBid == 1 ? '是' : '否';
    },
  },
  {
    title: '中标供应商',
    dataIndex: 'bidWinner.biddingCompany.name',
    width: 110,
    customRender: ({ record }) => {
      return lxTableColumnReportSupplierRender(record.project, record.bidWinner?.biddingCompany);
    },
  },
  {
    title: '中标金额',
    dataIndex: 'bidWinningAmount',
    width: 100,
    sorter: true,
    format: (_text, record) => {
      return _text == null
        ? ' '
        : record.bidWinningAmount +
            (record.project.currencyType?.code === '1' ? '元' : record.project.currencyType?.name);
    },
  },
  {
    title: '中标日期',
    dataIndex: 'bidWinningDate',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.bidWinner?.bidWinningDate);
    },
  },
  {
    title: '开标时间',
    dataIndex: 'quoteEndTime',
    width: 130,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.quoteEndTime, false, true);
    },
  },
  {
    title: '交付日期',
    dataIndex: 'deliveryTime',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.deliveryTime);
    },
  },
  {
    title: '完成日期',
    dataIndex: 'completeDate',
    width: 100,
    sorter: true,
    customRender: ({ record }) => {
      return renderTime(record.completeDate);
    },
  },
];
